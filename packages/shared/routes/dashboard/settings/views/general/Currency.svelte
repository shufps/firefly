<script lang="typescript">
    import { Dropdown, Text } from 'shared/components'
    import { localize } from '@core/i18n'
    import { activeProfile, updateActiveProfileSettings } from '@core/profile'
    import type { DropdownChoice } from '@core/utils'
    import { MarketCurrency } from '@core/market'

    let currencyList: DropdownChoice[]
    $: currencyList = Object.values(MarketCurrency)
        .map((currency) => ({ value: currency, label: currency.toUpperCase() }))
        .sort()

    const handleCurrencySelect = (item) => {
        updateActiveProfileSettings({ marketCurrency: item.value })
    }
</script>

<Text type="h4" classes="mb-3">{localize('views.settings.currency.title')}</Text>
<Text type="p" secondary classes="mb-5">{localize('views.settings.currency.description')}</Text>
<Dropdown
    sortItems={true}
    onSelect={handleCurrencySelect}
    value={$activeProfile?.settings.marketCurrency}
    items={currencyList}
    enableTyping
/>
