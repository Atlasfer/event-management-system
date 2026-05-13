import { DomainError } from '../shared/domain-error';
 
export class RefundId {
  constructor(public readonly value: string) {
    if (!value || value.trim() === '') {
      throw new DomainError('RefundId cannot be empty.');
    }
  }
 
  equals(other: RefundId): boolean {
    return this.value === other.value;
  }
 
  toString(): string {
    return this.value;
  }
}
 
export enum RefundStatus {
  Requested = 'Requested',
  Approved = 'Approved',
  Rejected = 'Rejected',
  PaidOut = 'PaidOut',
}