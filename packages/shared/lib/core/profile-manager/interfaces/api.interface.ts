import { AccountManagerOptions, CreateAccountPayload } from '@iota/wallet'

import { IAccount } from '@core/account'

import { IProfileManager } from './profile-manager.interface'

export interface IApi {
    createAccountManager(id: string, options: AccountManagerOptions): IProfileManager
    createAccount(managerId: string, payload: CreateAccountPayload): Promise<IAccount>
    deleteAccountManager(id: string): void
    getAccount(profileManagerId: string, index: number): Promise<IAccount>
}
