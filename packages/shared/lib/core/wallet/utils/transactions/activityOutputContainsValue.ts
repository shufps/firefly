import { IAccountState } from '@core/account/interfaces'
import { ActivityType } from '@core/wallet/enums'
import { IBasicOutput } from '@iota/types'
import { getNativeTokenFromOutput, isOutputAsync } from '..'
import { IWrappedOutput } from '../../interfaces'
import { getActivityTypeFromOutput, getAmountFromOutput, getStorageDepositFromOutput } from '../generateActivity/helper'

export async function activityOutputContainsValue(
    account: IAccountState,
    wrappedOutput: IWrappedOutput
): Promise<boolean> {
    const type = getActivityTypeFromOutput(wrappedOutput)
    const typesToCheck = [ActivityType.Basic]
    if (typesToCheck.includes(type)) {
        const output = wrappedOutput.output as IBasicOutput

        const isAsync = isOutputAsync(output)
        const nativeToken = getNativeTokenFromOutput(output)

        const { storageDeposit } = await getStorageDepositFromOutput(account, output)
        const rawAmount = getAmountFromOutput(output) - storageDeposit
        return !isAsync || rawAmount > 0 || (!!nativeToken && Number(nativeToken.amount) > 0)
    } else {
        return true
    }
}
