import { BASE_TOKEN } from '@core/network'
import { Unit } from '@iota/unit-converter'
import { convertToFiat, currencies, exchangeRates } from 'shared/lib/currency'
import { activeProfile } from '@core/profile'
import { Asset } from 'shared/lib/typings/assets'
import { AvailableExchangeRates, CurrencyTypes } from 'shared/lib/typings/currency'
import { UNIT_MAP } from 'shared/lib/units'
import { selectedAccount } from '@core/account'
import { derived } from 'svelte/store'

export const assets = derived(
    [exchangeRates, currencies, activeProfile, selectedAccount],
    ([$exchangeRates, $currencies, $activeProfile, $selectedAccount]) => {
        if (!$activeProfile || !$selectedAccount) return []
        const profileCurrency = $activeProfile?.settings?.currency ?? AvailableExchangeRates.USD
        const assets: Asset[] = [
            {
                meta: BASE_TOKEN[$activeProfile?.networkProtocol],
                balance: {
                    total: $selectedAccount?.balances.total,
                    available: $selectedAccount?.balances.available,
                },
                fiatPrice: `${convertToFiat(
                    UNIT_MAP[Unit.Mi].val,
                    $currencies[CurrencyTypes.USD],
                    $exchangeRates[profileCurrency]
                )} ${profileCurrency}`,
                fiatBalance: '0 USD',
            },
        ]
        return assets
    }
)
