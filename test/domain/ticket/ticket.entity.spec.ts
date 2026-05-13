import { TicketEntity } from '../../../src/domain/ticket/ticket.entity';
import { TicketCode, TicketStatus } from '../../../src/domain/ticket/value-objects';
import { DomainError } from '../../../src/domain/shared/domain-error';
 
function makeTicket(overrides: {
  status?: TicketStatus;
  eventId?: string;
} = {}): TicketEntity {
  return TicketEntity.reconstitute({
    id: 'ticket-1',
    bookingId: 'booking-1',
    eventId: overrides.eventId ?? 'event-1',
    code: new TicketCode('TICKET-ABC123'),
    status: overrides.status ?? TicketStatus.Active,
    checkedInAt: null,
  });
}

// ================================================================
// TEST 5: Checked-in ticket cannot be checked in again (BR26)
// ================================================================
describe('TicketEntity.checkIn', () => {
  it('should throw DomainError when ticket is already CheckedIn', () => {
    const ticket = makeTicket({ status: TicketStatus.CheckedIn });
 
    expect(() => {
      ticket.checkIn();
    }).toThrow(DomainError);
  });
 
  it('should throw error with message about already used ticket', () => {
    const ticket = makeTicket({ status: TicketStatus.CheckedIn });
 
    expect(() => {
      ticket.checkIn();
    }).toThrow('already been used');
  });
 
  it('should succeed when checking in an Active ticket', () => {
    const ticket = makeTicket({ status: TicketStatus.Active });
 
    expect(() => {
      ticket.checkIn();
    }).not.toThrow();
 
    expect(ticket.status).toBe(TicketStatus.CheckedIn);
    expect(ticket.checkedInAt).not.toBeNull();
  });
});