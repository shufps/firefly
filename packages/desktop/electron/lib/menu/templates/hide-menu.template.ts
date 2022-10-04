import { MenuItemConstructorOptions, app } from 'electron'
import { MENU_STATE } from '../../constants'
import { createRoleMenuItem } from '../helpers'

export const hideMenuTemplate: MenuItemConstructorOptions[] = [
    createRoleMenuItem('hide', `${MENU_STATE.strings.hide} ${app.name}`),
    createRoleMenuItem('hideOthers'),
    createRoleMenuItem('unhide'),
    { type: 'separator' },
]
