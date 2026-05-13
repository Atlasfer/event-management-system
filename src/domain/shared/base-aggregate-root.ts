import { DomainEvent } from "./domain-event";

export abstract class BaseAggregateRoot<Tid> {
    private domainEvents: DomainEvent[] = [];

    protected constructor(public readonly id: Tid) {}
    
    protected raiseDomainEvent(event: DomainEvent): void {
        this.domainEvents.push(event);
    }

    protected pullDomainEvents(): DomainEvent[] {
        const events = [...this.domainEvents];
        this.domainEvents = [];
        return events;
    }
}