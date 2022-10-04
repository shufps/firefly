import { app, Menu, MenuItemConstructorOptions } from 'electron'
import features from 'shared/features/features'
import { getOrInitWindow } from '../../main'
import { MENU_STATE } from '../constants'
import { createRoleMenuItem } from './helpers'
import { baseMenuTemplate, editMenuTemplate, helpMenuTemplate, hideMenuTemplate } from './templates'

export const createContextMenu = (): Menu => Menu.buildFromTemplate(editMenuTemplate)

export function createTemplate(): MenuItemConstructorOptions[] {
    const isDeveloperToolsMenuEnabled = !app.isPackaged || features?.electron?.developerTools?.enabled

    const template: MenuItemConstructorOptions[] = [
        {
            label: app.name,
            submenu: [
                ...baseMenuTemplate,
                ...(isDeveloperToolsMenuEnabled ? [createRoleMenuItem('toggleDevTools', 'Developer Tools')] : []),
                {
                    label: MENU_STATE.strings.errorLog,
                    click: () => getOrInitWindow('main').webContents.send('menu-error-log'),
                },
                { type: 'separator' },
                ...(process.platform === 'darwin' ? hideMenuTemplate : []),
                {
                    label: MENU_STATE.strings.quit,
                    accelerator: process.platform === 'win32' ? 'Alt+F4' : 'CmdOrCtrl+Q',
                    click: () => app.quit(),
                },
            ],
        },
        {
            label: MENU_STATE.strings.edit,
            submenu: editMenuTemplate,
        },
        {
            label: MENU_STATE.strings.help,
            submenu: helpMenuTemplate,
        },
    ]
    return template
}
