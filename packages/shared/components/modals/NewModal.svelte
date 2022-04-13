<script lang="typescript">
    import { clickOutside } from 'shared/lib/actions'
    import { fade } from 'svelte/transition'
    import { createEventDispatcher } from 'svelte'

    enum Size {
        Small = 'small',
        Medium = 'medium',
        Large = 'large',
    }

    enum Position {
        Top = 'top',
        Right = 'right',
        Bottom = 'bottom',
        Left = 'left',
    }

    enum Alignment {
        Start = 'start',
        Center = 'center',
        End = 'end',
    }

    export let anchor: HTMLElement
    export let position: Position = Position.Right
    export let alignment: Alignment = Alignment.Center
    export let size: Size = Size.Medium
    export let classes: string = ''
    export let disableOnClickOutside = false

    export function close(): void {
        setShow(false)
    }
    export function open(): void {
        setShow(true)
    }
    export function toggle(): void {
        show ? close() : open()
    }
    export function isOpened(): boolean {
        return show
    }

    const dispatch = createEventDispatcher()

    let clientHeight: number
    let clientWidth: number
    let top: string
    let left: string
    let isBlockedByTimeout = false
    let show = false

    $: clientHeight, clientWidth, anchor, updatePositionValues()

    function updatePositionValues(): void {
        top = getPositionValue('top')
        left = getPositionValue('left')
    }
    function getPositionValue(type: 'top' | 'left'): string {
        const isTop = type === 'top'
        const offsetPositionKey = `offset${isTop ? 'Top' : 'Left'}`
        const offsetDimensionKey = `offset${isTop ? 'Height' : 'Width'}`
        const startPosition = isTop ? Position.Top : Position.Left
        const endPosition = isTop ? Position.Bottom : Position.Right
        const clientDimension = isTop ? clientHeight : clientWidth

        if (position === startPosition) {
            return `${anchor?.[offsetPositionKey] - clientDimension}px`
        } else if (position === endPosition) {
            return `${anchor?.[offsetPositionKey] + anchor?.[offsetDimensionKey]}px`
        }

        if (alignment === Alignment.Start) {
            return `${anchor?.[offsetPositionKey]}px`
        } else if (alignment === Alignment.Center) {
            return `${anchor?.[offsetPositionKey] + anchor?.[offsetDimensionKey] / 2 - clientDimension / 2}px`
        } else if (alignment === Alignment.End) {
            return `${anchor?.[offsetPositionKey] + anchor?.[offsetDimensionKey] - clientDimension}px`
        }

        return ''
    }
    function setShow(bool: boolean) {
        if (!isBlockedByTimeout) {
            show = bool
            isBlockedByTimeout = true
            setTimeout(() => (isBlockedByTimeout = false), 100)
            show ? dispatch('open') : dispatch('close')
        }
    }
    function handleOnClickOutside(): void {
        if (disableOnClickOutside) return
        close()
    }
</script>

{#if show}
    <modal-content
        bind:clientHeight
        bind:clientWidth
        in:fade={{ duration: 100 }}
        use:clickOutside
        on:clickOutside={handleOnClickOutside}
        class="{size} bg-white dark:bg-gray-900 border border-solid border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden z-10 {classes}"
        style="--modal-position-top: {top}; --modal-position-left: {left};"
    >
        <slot />
    </modal-content>
{/if}

<style type="text/scss">
    modal-content {
        position: absolute;
        min-width: 230px;
        box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
        top: var(--modal-position-top);
        left: var(--modal-position-left);
        &.large {
            min-width: 420px;
        }
    }
</style>
