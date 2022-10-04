import { MenuItem, MenuItemConstructorOptions } from 'electron'
import { MENU_STATE } from '../../constants'

export function createRoleMenuItem(role: NonNullable<MenuItem['role']>, label?: string): MenuItemConstructorOptions {
    return {
        label: label ?? MENU_STATE.strings[role],
        role,
    }
}
