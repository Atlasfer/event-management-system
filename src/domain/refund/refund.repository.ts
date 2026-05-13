import { RefundAggregate } from './refund.aggregate';
import { RefundStatus } from './value-objects';
 
export interface IRefundRepository {
  save(refund: RefundAggregate): Promise<void>;
  findById(id: string): Promise<RefundAggregate | null>;
  findByBookingId(bookingId: string): Promise<RefundAggregate | null>;
  findByStatus(status: RefundStatus): Promise<RefundAggregate[]>;
  findByCustomerId(customerId: string): Promise<RefundAggregate[]>;
}