import { DomainEvent } from "../shared/domain-event";

export class EventCancelledEvent implements DomainEvent {
    public readonly occurredAt: Date = new Date();
    public readonly eventName = 'EventCancelled';

    constructor(public readonly eventId: string) {}
}