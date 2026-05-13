import { BookingAggregate } from './booking.aggregate';
import { BookingStatus } from './value-objects';
 
export interface IBookingRepository {
  save(booking: BookingAggregate): Promise<void>;
  findById(id: string): Promise<BookingAggregate | null>;
  findByCustomerAndEvent(customerId: string, eventId: string): Promise<BookingAggregate[]>;
  findByStatus(status: BookingStatus): Promise<BookingAggregate[]>;
  findByEventId(eventId: string): Promise<BookingAggregate[]>;
  delete(id: string): Promise<void>;
}