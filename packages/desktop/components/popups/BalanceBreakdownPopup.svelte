<script lang="ts">
    import { closePopup, openPopup, PopupId } from '@auxiliary/popup'
    import { selectedAccount } from '@core/account'
    import { localize } from '@core/i18n'
    import { checkActiveProfileAuth } from '@core/profile'
    import {
        OUTPUT_TYPE_TREASURY,
        UNLOCK_CONDITION_EXPIRATION,
        UNLOCK_CONDITION_STORAGE_DEPOSIT_RETURN,
        UNLOCK_CONDITION_TIMELOCK,
    } from '@core/wallet'
    import { consolidateOutputs } from '@core/wallet/actions/consolidateOutputs'
    import { getStorageDepositFromOutput } from '@core/wallet/utils/generateActivity/helper'
    import type { UnlockConditionTypes } from '@iota/types'
    import { TextHintVariant } from 'shared/components/enums'
    import { BalanceSummarySection, Button, FontWeight, Text, TextType } from 'shared/components'

    interface BalanceBreakdown {
        amount: number
        subBreakdown?: { [key: string]: { amount: number } }
    }

    enum PendingFundsType {
        Unclaimed = 'unclaimed',
        StorageDepositReturn = 'storageDepositReturn',
        Timelock = 'timelock',
    }

    $: accountBalance = $selectedAccount?.balances

    let breakdown: { [key: string]: BalanceBreakdown } = {}
    $: accountBalance, void setBreakdown()
    async function setBreakdown(): Promise<void> {
        const availableBreakdown = getAvailableBreakdown()
        const pendingBreakdown = await getPendingBreakdown()
        const lockedBreakdown = getLockedBreakdown()
        const storageDepositBreakdown = getStorageDepositBreakdown()

        breakdown = {
            available: availableBreakdown,
            pending: pendingBreakdown,
            locked: lockedBreakdown,
            storageDeposit: storageDepositBreakdown,
        }
    }

    function getAvailableBreakdown(): BalanceBreakdown {
        return { amount: Number(accountBalance?.baseCoin?.available ?? 0) }
    }

    async function getPendingBreakdown(): Promise<BalanceBreakdown> {
        let pendingOutputsStorageDeposit = 0

        const subBreakdown = {}
        for (const [outputId, unlocked] of Object.entries(accountBalance?.potentiallyLockedOutputs ?? {})) {
            if (!unlocked) {
                const output = (await $selectedAccount.getOutput(outputId)).output

                let type: string
                let amount: number
                if (output.type !== OUTPUT_TYPE_TREASURY) {
                    if (containsUnlockCondition(output.unlockConditions, UNLOCK_CONDITION_EXPIRATION)) {
                        type = PendingFundsType.Unclaimed
                        amount = Number(output.amount)
                    } else if (
                        containsUnlockCondition(output.unlockConditions, UNLOCK_CONDITION_STORAGE_DEPOSIT_RETURN)
                    ) {
                        type = PendingFundsType.StorageDepositReturn
                        amount = (await getStorageDepositFromOutput($selectedAccount, output))?.storageDeposit
                    } else if (containsUnlockCondition(output.unlockConditions, UNLOCK_CONDITION_TIMELOCK)) {
                        type = PendingFundsType.Timelock
                        amount = Number(output.amount)
                    }
                }

                if (!subBreakdown[type]) {
                    subBreakdown[type] = amount
                } else {
                    subBreakdown[type] += amount
                }
                pendingOutputsStorageDeposit += amount
            }
        }

        return { amount: pendingOutputsStorageDeposit, subBreakdown }
    }

    function getLockedBreakdown(): BalanceBreakdown {
        const governanceAmount = parseInt($selectedAccount?.votingPower, 10)
        const totalLockedAmount = governanceAmount

        const subBreakdown = {
            governance: { amount: governanceAmount },
        }

        return { amount: totalLockedAmount, subBreakdown }
    }

    function getStorageDepositBreakdown(): BalanceBreakdown {
        const storageDeposits = accountBalance?.requiredStorageDeposit
        const totalStorageDeposit = storageDeposits
            ? Object.values(accountBalance.requiredStorageDeposit).reduce(
                  (total: number, value: string): number => total + Number(value ?? 0),
                  0
              )
            : 0

        const subBreakdown = {
            basicOutputs: { amount: Number(storageDeposits?.basic ?? 0) },
            nftOutputs: { amount: Number(storageDeposits?.nft ?? 0) },
            aliasOutputs: { amount: Number(storageDeposits?.alias ?? 0) },
            foundryOutputs: { amount: Number(storageDeposits?.foundry ?? 0) },
        }

        return { amount: totalStorageDeposit, subBreakdown }
    }

    function containsUnlockCondition(unlockConditions: UnlockConditionTypes[], unlockConditionId: number) {
        return unlockConditions.some((unlockCondition) => unlockCondition.type === unlockConditionId)
    }

    function onConsolidationClick(): void {
        openPopup({
            id: PopupId.Confirmation,
            props: {
                title: localize('popups.minimizeStorageDeposit.title'),
                description: localize('popups.minimizeStorageDeposit.description'),
                confirmText: localize('popups.minimizeStorageDeposit.confirmButton'),
                variant: TextHintVariant.Info,
                onConfirm: async () => {
                    await checkActiveProfileAuth(
                        async () => {
                            await consolidateOutputs()
                            closePopup()
                        },
                        { stronghold: true }
                    )
                },
            },
        })
    }
</script>

<div class="flex flex-col space-y-6">
    <Text type={TextType.h3} fontWeight={FontWeight.semibold} lineHeight="6">
        {localize('popups.balanceBreakdown.title')}
    </Text>
    <div class="flex flex-col space-y-8">
        {#each Object.keys(breakdown) as breakdownKey}
            <BalanceSummarySection
                titleKey={breakdownKey}
                subtitleKey={breakdownKey}
                amount={breakdown[breakdownKey].amount}
                subBreakdown={breakdown[breakdownKey].subBreakdown}
            />
        {/each}
        <BalanceSummarySection titleKey="totalBalance" amount={Number(accountBalance?.baseCoin?.total ?? 0)} bold />
    </div>
    <Button onClick={onConsolidationClick}>
        {localize('popups.balanceBreakdown.minimizeStorageDepositButton')}
    </Button>
</div>
