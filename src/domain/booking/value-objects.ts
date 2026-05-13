import { DomainError } from '../shared/domain-error';

export class BookingId {
  constructor(public readonly value: string) {
    if (!value || value.trim() === '') {
      throw new DomainError('BookingId cannot be empty.');
    }
  }
 
  equals(other: BookingId): boolean {
    return this.value === other.value;
  }
 
  toString(): string {
    return this.value;
  }
}

export class PaymentDeadline {
  public readonly value: Date;
 
  constructor(value: Date) {
    this.value = value;
  }
 
  static fromMinutes(minutes: number): PaymentDeadline {
    const deadline = new Date(Date.now() + minutes * 60 * 1000);
    return new PaymentDeadline(deadline);
  }
 
  isExpired(now: Date = new Date()): boolean {
    return now > this.value;
  }
 
  toString(): string {
    return this.value.toISOString();
  }
}

export enum BookingStatus {
  PendingPayment = 'PendingPayment',
  Paid = 'Paid',
  Expired = 'Expired',
  Refunded = 'Refunded',
}