import { DomainEvent } from '../shared/domain-event';

export class TicketCategoryDisabledEvent implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  public readonly eventName = 'TicketCategoryDisabled';

  constructor(
    public readonly eventId: string,
    public readonly categoryId: string,
  ) {}
}