<script lang="typescript">
    import { Modal, Text } from 'shared/components'
    import { localize } from '@core/i18n'
    import { SECONDS_PER_MILESTONE, SECONDS_PER_MINUTE, milestoneToDate } from '@lib/time'
    import { formatUnitBestMatch } from '@lib/units'
    import { ParticipationEvent } from '@lib/participation';
    import { selectedAccountParticipationOverview } from '@lib/participation/account'

    export let modal: Modal
    export let event: ParticipationEvent
    export let type: GovernanceInfoType

    enum GovernanceInfoType {
        EventStatusTimeline = 'eventStatusTimeline',
        VotingRate = 'votingRate',
        CountedVotes = 'countedVotes',
    }

    $: trackedParticipation = $selectedAccountParticipationOverview?.trackedParticipations?.[event?.eventId]
    $: lastTrackedParticipationItem = trackedParticipation?.[trackedParticipation.length - 1]
    $: votesPerMinute = lastTrackedParticipationItem?.amount * 0.001 * (SECONDS_PER_MINUTE / SECONDS_PER_MILESTONE)
</script>

<Modal bind:this={modal} position={{ left: '200px', top: '100px' }}>
    {#if type === GovernanceInfoType.EventStatusTimeline}
        <ul>
            <li>
                <Text>{localize('views.governance.info.modal.eventStatusTimeline.announcement')}</Text>
            </li>
            <li>
                <Text>{milestoneToDate(event?.information?.milestoneIndexCommence)}</Text>
                <Text>{localize('views.governance.info.modal.eventStatusTimeline.votingOpen')}</Text>
            </li>
            <li>
                <Text>{milestoneToDate(event?.information?.milestoneIndexStart)}</Text>
                <Text>{localize('views.governance.info.modal.eventStatusTimeline.countingStarts')}</Text>
            </li>
            <li>
                <Text>{milestoneToDate(event?.information?.milestoneIndexEnd)}</Text>
                <Text>{localize('views.governance.info.modal.eventStatusTimeline.countingStops')}</Text>
            </li>
        </ul>
    {:else if type === GovernanceInfoType.VotingRate}
        <Text type='h3'>{localize('views.governance.info.modal.votingRate.title')}</Text>
        <Text>
            {localize('views.governance.info.modal.votingRate.body', {
                amount: formatUnitBestMatch(lastTrackedParticipationItem.amount),
                votesPerMinute,
            })}
        </Text>
    {:else if type === GovernanceInfoType.CountedVotes}
        <Text type='h3'>{localize('views.governance.info.modal.countedVotes.title')}</Text>
        <Text>{localize('views.governance.info.modal.countedVotes.body')}</Text>
    {/if}
</Modal>
