import { DomainEvent } from '../shared/domain-event';

export class EventPublishedEvent implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'EventPublished';

  constructor(public readonly eventId: string) {}
}