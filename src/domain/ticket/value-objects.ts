import { DomainError } from '../shared/domain-error';
 
export class TicketId {
  constructor(public readonly value: string) {
    if (!value || value.trim() === '') {
      throw new DomainError('TicketId cannot be empty.');
    }
  }
 
  equals(other: TicketId): boolean {
    return this.value === other.value;
  }
 
  toString(): string {
    return this.value;
  }
}
 
export class TicketCode {
  constructor(public readonly value: string) {
    if (!value || value.trim() === '') {
      throw new DomainError('TicketCode cannot be empty.');
    }
  }
 
  equals(other: TicketCode): boolean {
    return this.value === other.value;
  }
 
  toString(): string {
    return this.value;
  }
}
 
export enum TicketStatus {
  Active = 'Active',
  CheckedIn = 'CheckedIn',
  Cancelled = 'Cancelled',
}