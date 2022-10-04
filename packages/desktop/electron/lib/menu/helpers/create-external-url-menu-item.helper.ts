import { MenuItemConstructorOptions, shell } from 'electron'
import { MENU_STATE } from '../../constants'

export function createExternalUrlMenuItem(
    stringsKey: keyof typeof MENU_STATE['strings'],
    url: string
): MenuItemConstructorOptions {
    return {
        label: MENU_STATE.strings[stringsKey],
        click: () => shell.openExternal(url),
    }
}
