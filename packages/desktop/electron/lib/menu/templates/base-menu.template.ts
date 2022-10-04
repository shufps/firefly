import { MenuItemConstructorOptions, app } from 'electron'
import { openAboutWindow, getOrInitWindow } from '../../../main'
import { MENU_STATE } from '../../constants'
import { MenuEvent } from '../enums'

export const baseMenuTemplate: MenuItemConstructorOptions[] = [
    {
        label: `${MENU_STATE.strings.about} ${app.name}`,
        click: openAboutWindow,
        enabled: MENU_STATE.enabled,
    },
    {
        label: `${MENU_STATE.strings.checkForUpdates}...`,
        click: () => getOrInitWindow('main').webContents.send(MenuEvent.CheckForUpdate),
        enabled: process.env.STAGE === 'prod' ? MENU_STATE.enabled : false,
    },
    { type: 'separator' },

    {
        label: MENU_STATE.strings.settings,
        click: () => getOrInitWindow('main').webContents.send(MenuEvent.NavigateSettings),
    },
    { type: 'separator' },
    {
        label: MENU_STATE.strings.createDeveloperProfile,
        click: () => getOrInitWindow('main').webContents.send(MenuEvent.CreateDeveloperProfile),
        visible: MENU_STATE.canCreateNewProfile,
    },
    {
        label: MENU_STATE.strings.createNormalProfile,
        click: () => getOrInitWindow('main').webContents.send(MenuEvent.CreateNormalProfile),
        visible: MENU_STATE.canCreateNewProfile,
    },
    {
        label: MENU_STATE.strings.diagnostics,
        click: () => getOrInitWindow('main').webContents.send(MenuEvent.Diagnostics),
    },
]
