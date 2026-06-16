import { Entity } from '../shared/entity';
import { Money } from '../shared/money.vo';
import { DomainError } from '../shared/domain-error';

export class TicketCategory extends Entity<string> {
  private constructor(
    id: string,
    public readonly eventId: string,
    public name: string,
    public price: Money,
    public quota: number,
    public remainingQuota: number,
    public salesStart: Date,
    public salesEnd: Date,
    public isActive: boolean,
  ) {
    super(id);
  }

  public static reconstitute(props: {
    id: string;
    eventId: string;
    name: string;
    price: Money;
    quota: number;
    remainingQuota: number;
    salesStart: Date;
    salesEnd: Date;
    isActive: boolean;
  }): TicketCategory {
    return new TicketCategory(
      props.id,
      props.eventId,
      props.name,
      props.price,
      props.quota,
      props.remainingQuota,
      props.salesStart,
      props.salesEnd,
      props.isActive,
    );
  }

  public static create(props: {
    id: string;
    eventId: string;
    name: string;
    price: Money;
    quota: number;
    salesStart: Date;
    salesEnd: Date;
    eventStartDate: Date;
  }): TicketCategory {
    if (props.price.amount < 0) {
      throw new DomainError('Ticket price cannot be negative');
    }

    if (props.quota <= 0) {
      throw new DomainError('Ticket quota must be greater than zero');
    }

    if (props.salesEnd > props.eventStartDate) {
      throw new DomainError('Ticket sales period must end before or at event start date');
    }

    return new TicketCategory(
      props.id,
      props.eventId,
      props.name,
      props.price,
      props.quota,
      props.quota,
      props.salesStart,
      props.salesEnd,
      true,
    );
  }

  public disable(): void {
    this.isActive = false;
  }

  public reserveQuota(quantity: number): void {
  if (quantity <= 0) {
    throw new DomainError('Quantity must be greater than zero.');
  }
  if (quantity > this.remainingQuota) {
    throw new DomainError('Not enough remaining quota.');
  }
  this.remainingQuota -= quantity;
}

public releaseQuota(quantity: number): void {
  this.remainingQuota += quantity;
}
}