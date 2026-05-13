import { DomainEvent } from '../shared/domain-event';

export class TicketCategoryCreatedEvent implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'TicketCategoryCreated';

  constructor(
    public readonly eventId: string,
    public readonly categoryId: string,
  ) {}
}