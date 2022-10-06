import { Event } from '@lib/typings/events'

export interface Element {
    addEventListener(event: Event<unknown> | string, unknown)
    removeEventListener(event: Event<unknown> | string, handler: unknown)
}
