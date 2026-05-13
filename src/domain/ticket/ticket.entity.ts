import { Entity } from '../shared/entity';
import { DomainError } from '../shared/domain-error';
import { TicketCheckedIn } from './events';
import { TicketCode, TicketStatus } from './value-objects';

export class TicketEntity extends Entity<string> {
  public bookingId: string;
  public eventId: string;
  public code: TicketCode;
  public status: TicketStatus;
  public checkedInAt: Date | null;
 
  private _domainEvents: TicketCheckedIn[] = [];
 
  private constructor(
    id: string,
    bookingId: string,
    eventId: string,
    code: TicketCode,
    status: TicketStatus,
    checkedInAt: Date | null,
  ) {
    super(id);
    this.bookingId = bookingId;
    this.eventId = eventId;
    this.code = code;
    this.status = status;
    this.checkedInAt = checkedInAt;
  }

  static create(props: {
    id: string;
    bookingId: string;
    eventId: string;
    code: TicketCode;
  }): TicketEntity {
    return new TicketEntity(
      props.id,
      props.bookingId,
      props.eventId,
      props.code,
      TicketStatus.Active,
      null,
    );
  }

  static reconstitute(props: {
    id: string;
    bookingId: string;
    eventId: string;
    code: TicketCode;
    status: TicketStatus;
    checkedInAt: Date | null;
  }): TicketEntity {
    return new TicketEntity(
      props.id,
      props.bookingId,
      props.eventId,
      props.code,
      props.status,
      props.checkedInAt,
    );
  }

  checkIn(now: Date = new Date()): void {
    // Tickets that have already been checked in cannot be checked in again
    if (this.status === TicketStatus.CheckedIn) {
      throw new DomainError('This ticket has already been used (checked in).');
    }
 
    if (this.status !== TicketStatus.Active) {
      throw new DomainError(
        `Ticket cannot be checked in because its status is ${this.status}.`,
      );
    }
 
    this.status = TicketStatus.CheckedIn;
    this.checkedInAt = now;
 
    this._domainEvents.push(
      new TicketCheckedIn(this.id, this.code.value, this.bookingId, this.eventId),
    );
  }

  cancel(): void {
    if (this.status === TicketStatus.CheckedIn) {
      throw new DomainError('A checked-in ticket cannot be cancelled.');
    }
    this.status = TicketStatus.Cancelled;
  }

  pullDomainEvents(): TicketCheckedIn[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}