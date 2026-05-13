import { BaseAggregateRoot } from '../shared/base-aggregate-root';
import { DomainError } from '../shared/domain-error';
import { EventStatus } from './event-status';
import { EventCapacity, EventSchedule } from './value-objects';
import { TicketCategory } from './ticket-category.entity';
import { Money } from '../shared/money.vo';

import  { EventPublishingPolicyService } from './event-publishing-policy.service';

import { EventCreatedEvent } from './event-created.event';
import { EventPublishedEvent } from './event-published.event';
import { EventCancelledEvent } from './event-cancelled.event';
import { TicketCategoryCreatedEvent } from './ticket-category-created.event';
import { TicketCategoryDisabledEvent } from './ticket-category-disabled.event';

export class EventAggregate extends BaseAggregateRoot<string> {
  private categories: TicketCategory[] = [];

  private constructor(
    id: string,
    public organizerId: string,
    public name: string,
    public description: string,
    public location: string,
    public schedule: EventSchedule,
    public capacity: EventCapacity,
    public status: EventStatus,
  ) {
    super(id);
  }

  public static create(props: {
    id: string;
    organizerId: string;
    name: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
    maxCapacity: number;
  }): EventAggregate {
    const schedule = EventSchedule.create(props.startDate, props.endDate);
    const capacity = EventCapacity.create(props.maxCapacity);

    const event = new EventAggregate(
      props.id,
      props.organizerId,
      props.name,
      props.description,
      props.location,
      schedule,
      capacity,
      EventStatus.Draft,
    );

    event.raiseDomainEvent(new EventCreatedEvent(event.id));
    return event;
  }

  public getTicketCategories(): TicketCategory[] {
    return [...this.categories];
  }

  public createTicketCategory(props: {
    id: string;
    name: string;
    price: number;
    quota: number;
    salesStart: Date;
    salesEnd: Date;
  }): TicketCategory {
    const money = Money.create(props.price);

    const newCategory = TicketCategory.create({
      id: props.id,
      eventId: this.id,
      name: props.name,
      price: money,
      quota: props.quota,
      salesStart: props.salesStart,
      salesEnd: props.salesEnd,
      eventStartDate: this.schedule.start,
    });

    const totalQuota = this.categories.reduce((sum, c) => sum + c.quota, 0) + props.quota;

    if (totalQuota > this.capacity.capacity) {
      throw new DomainError('Total ticket quota cannot exceed event capacity');
    }

    this.categories.push(newCategory);

    this.raiseDomainEvent(new TicketCategoryCreatedEvent(this.id, newCategory.id));
    return newCategory;
  }

  public disableTicketCategory(categoryId: string): void {
    const category = this.categories.find((c) => c.id === categoryId);

    if (!category) {
      throw new DomainError('Ticket category not found');
    }

    if (this.status === EventStatus.Completed) {
      throw new DomainError('Ticket category cannot be disabled after event is completed');
    }

    category.disable();
    this.raiseDomainEvent(new TicketCategoryDisabledEvent(this.id, category.id));
  }

  public publish(): void {
    if (this.status === EventStatus.Cancelled) {
      throw new DomainError('Cancelled event cannot be published');
    }

    if (this.status !== EventStatus.Draft) {
      throw new DomainError('Only draft event can be published');
    }

    EventPublishingPolicyService.validate(this.categories, this.capacity.capacity);

    this.status = EventStatus.Published;
    this.raiseDomainEvent(new EventPublishedEvent(this.id));
  }

  public cancel(): void {
    if (this.status === EventStatus.Completed) {
      throw new DomainError('Completed event cannot be cancelled');
    }

    if (this.status !== EventStatus.Published) {
      throw new DomainError('Only published event can be cancelled');
    }

    this.status = EventStatus.Cancelled;

    // Important: acceptance criteria says ticket categories can no longer be purchased
    this.categories.forEach((c) => c.disable());

    this.raiseDomainEvent(new EventCancelledEvent(this.id));
  }
}