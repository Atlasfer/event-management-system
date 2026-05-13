import { BaseAggregateRoot } from '../shared/base-aggregate-root';
import { DomainError } from '../shared/domain-error';
import { Money } from '../shared/money.vo';
import { RefundApproved, RefundPaidOut, RefundRejected, RefundRequested } from './events';
import { RefundStatus } from './value-objects';

export class RefundAggregate extends BaseAggregateRoot<string> {
  public bookingId!: string;
  public customerId!: string;
  public amount!: Money;
  public status!: RefundStatus;
  public reason!: string | null;
  public rejectionReason!: string | null;
  public paymentReference!: string | null;
  public requestedAt!: Date;
 
  private constructor(id: string) {
    super(id);
  }

  static create(props: {
    id: string;
    bookingId: string;
    customerId: string;
    amount: Money;
    reason: string | null;
  }): RefundAggregate {
    const refund = new RefundAggregate(props.id);
    refund.bookingId = props.bookingId;
    refund.customerId = props.customerId;
    refund.amount = props.amount;
    refund.status = RefundStatus.Requested;
    refund.reason = props.reason;
    refund.rejectionReason = null;
    refund.paymentReference = null;
    refund.requestedAt = new Date();
 
    refund.raiseDomainEvent(
      new RefundRequested(
        refund.id,
        refund.bookingId,
        refund.customerId,
        refund.amount.amount,
        refund.amount.currency,
        refund.reason,
      ),
    );
 
    return refund;
  }

  static reconstitute(props: {
    id: string;
    bookingId: string;
    customerId: string;
    amount: Money;
    status: RefundStatus;
    reason: string | null;
    rejectionReason: string | null;
    paymentReference: string | null;
    requestedAt: Date;
  }): RefundAggregate {
    const refund = new RefundAggregate(props.id);
    refund.bookingId = props.bookingId;
    refund.customerId = props.customerId;
    refund.amount = props.amount;
    refund.status = props.status;
    refund.reason = props.reason;
    refund.rejectionReason = props.rejectionReason;
    refund.paymentReference = props.paymentReference;
    refund.requestedAt = props.requestedAt;
    return refund;
  }

  // Approve
  approve(): void {
    if (this.status !== RefundStatus.Requested) {
      throw new DomainError(
        `Refund can only be approved if its status is Requested. Current status: ${this.status}.`,
      );
    }
 
    this.status = RefundStatus.Approved;
 
    this.raiseDomainEvent(
      new RefundApproved(this.id, this.bookingId, this.customerId),
    );
  }

  // Reject
  reject(rejectionReason: string): void {
    if (this.status !== RefundStatus.Requested) {
      throw new DomainError(
        `Refund can only be rejected if its status is Requested. Current status: ${this.status}.`,
      );
    }
 
    if (!rejectionReason || rejectionReason.trim() === '') {
      throw new DomainError('A rejection reason must be provided.');
    }
 
    this.status = RefundStatus.Rejected;
    this.rejectionReason = rejectionReason;
 
    // Booking remains paid; ticket remains active
    this.raiseDomainEvent(
      new RefundRejected(this.id, this.bookingId, this.customerId, rejectionReason),
    );
  }

  markAsPaidOut(paymentReference: string): void {
    if (this.status !== RefundStatus.Approved) {
      throw new DomainError(
        `Refund can only be marked as paid out if its status is Approved. Current status: ${this.status}.`,
      );
    }
 
    if (!paymentReference || paymentReference.trim() === '') {
      throw new DomainError(
        'A payment reference must be provided when marking a refund as paid out.',
      );
    }
 
    this.status = RefundStatus.PaidOut;
    this.paymentReference = paymentReference;
 
    this.raiseDomainEvent(
      new RefundPaidOut(this.id, this.bookingId, this.customerId, paymentReference),
    );
  }
}