import { app, ipcMain, Menu } from 'electron'
import { closeAboutWindow, getOrInitWindow } from '../../main'
import { MENU_STATE } from '../constants'
import { MenuEvent } from './enums'
import { createTemplate } from './menu-template'

let state = MENU_STATE

// Creates a native menu tree and applies it to the application window
export function initMenu(): void {
    let mainMenu: Menu | null = null

    function createMenu(): Menu {
        const template = createTemplate()
        const applicationMenu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(applicationMenu)
        // setApplicationMenu sets the menu for all top level windows
        // which breaks the about window, if we try and set the about
        // window menu to null it resizes. We would also need to re-apply
        // the localisation, so just close it
        closeAboutWindow()
        return applicationMenu
    }

    app.once('ready', () => {
        ipcMain.handle(MenuEvent.Update, (e, args): void => {
            state = Object.assign({}, state, args)
            mainMenu = createMenu()
        })

        ipcMain.handle(MenuEvent.Popup, (): void => {
            mainMenu?.popup({ window: getOrInitWindow('main') })
        })

        ipcMain.handle(MenuEvent.Data, () => state)

        ipcMain.handle('maximize', (): boolean => {
            const isMaximized = getOrInitWindow('main').isMaximized()
            if (isMaximized) {
                getOrInitWindow('main').restore()
            } else {
                getOrInitWindow('main').maximize()
            }
            return !isMaximized
        })

        ipcMain.handle('isMaximized', (): boolean => getOrInitWindow('main').isMaximized())

        ipcMain.handle('minimize', (): void => {
            getOrInitWindow('main').minimize()
        })

        ipcMain.handle('close', (): void => {
            getOrInitWindow('main').close()
        })

        mainMenu = createMenu()
    })
}
