import { TicketEntity } from './ticket.entity';
import { TicketCode, TicketStatus } from './value-objects';
 
export interface ITicketRepository {
  save(ticket: TicketEntity): Promise<void>;
  saveMany(tickets: TicketEntity[]): Promise<void>;
  findById(id: string): Promise<TicketEntity | null>;
  findByCode(code: TicketCode): Promise<TicketEntity | null>;
  findByBookingId(bookingId: string): Promise<TicketEntity[]>;
  findByStatus(status: TicketStatus): Promise<TicketEntity[]>;
}