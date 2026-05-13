import {DomainEvent} from '../shared/domain-event';

export class EventCreatedEvent implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'EventCreated';
    
  constructor(public readonly eventId: string) {}
}