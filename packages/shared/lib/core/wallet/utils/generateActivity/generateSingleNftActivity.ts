import { IAccountState } from '@core/account'
import { handleError } from '@core/error/handlers'
import { ActivityAction, ActivityType } from '@core/wallet/enums'
import { IActivityGenerationParameters } from '@core/wallet/interfaces'
import { NftActivity } from '@core/wallet/types'
import type { INftOutput } from '@iota/types'
import { getNftId } from '../outputs/getNftId'
import {
    getAsyncDataFromOutput,
    getLayer2ActivityInformation,
    getMetadataFromOutput,
    getSendingInformation,
    getStorageDepositFromOutput,
    getTagFromOutput,
} from './helper'

export async function generateSingleNftActivity(
    account: IAccountState,
    { action, processedTransaction, wrappedOutput }: IActivityGenerationParameters,
    nftIdFromInput?: string
): Promise<NftActivity> {
    const { claimingData, time, inclusionState, transactionId, direction } = processedTransaction
    const outputId = wrappedOutput.outputId
    const output = wrappedOutput.output as INftOutput
    const id = outputId || transactionId

    const isHidden = false
    const isAssetHidden = false
    const containsValue = true

    const nftId = nftIdFromInput ? nftIdFromInput : getNftId(output.nftId, outputId)
    const metadata = getMetadataFromOutput(output)
    const tag = getTagFromOutput(output)

    const sendingInfo = getSendingInformation(processedTransaction, output, account)
    const { subject, isInternal } = sendingInfo

    const { parsedLayer2Metadata, destinationNetwork } = getLayer2ActivityInformation(metadata, sendingInfo)
    const gasBudget = Number(parsedLayer2Metadata?.gasBudget ?? '0')

    let { storageDeposit, giftedStorageDeposit } = await getStorageDepositFromOutput(account, output)
    giftedStorageDeposit = action === ActivityAction.Burn ? 0 : giftedStorageDeposit
    giftedStorageDeposit = gasBudget === 0 ? giftedStorageDeposit : 0

    let surplus: number | undefined = undefined
    try {
        const minimumRequiredStorageDeposit = await account.minimumRequiredStorageDeposit(output)
        surplus = Number(output.amount) - Number(minimumRequiredStorageDeposit)
        if (surplus && !storageDeposit) {
            giftedStorageDeposit = Number(minimumRequiredStorageDeposit)
        }
    } catch (err) {
        handleError(err)
    }

    const asyncData = await getAsyncDataFromOutput(output, outputId, claimingData, account)

    return {
        type: ActivityType.Nft,
        id,
        transactionId,
        outputId,
        nftId,
        time,
        isHidden,
        action,
        giftedStorageDeposit,
        surplus,
        isAssetHidden,
        containsValue,
        inclusionState,
        storageDeposit,
        metadata,
        tag,
        asyncData,
        subject,
        isInternal,
        direction,
        destinationNetwork,
        parsedLayer2Metadata,
    }
}
