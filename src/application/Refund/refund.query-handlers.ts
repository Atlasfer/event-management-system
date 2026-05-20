import { IRefundRepository } from '../../domain/refund/refund.repository';
import { RefundDto } from '../dto/refund.dto';
import { GetRefundByBookingQuery, GetRefundsByCustomerQuery } from './refund.queries';
 
export class GetRefundByBookingQueryHandler {
  constructor(private readonly refundRepository: IRefundRepository) {}
 
  async execute(query: GetRefundByBookingQuery): Promise<RefundDto | null> {
    const refund = await this.refundRepository.findByBookingId(query.bookingId);
    if (!refund) return null;
 
    return {
      id: refund.id,
      bookingId: refund.bookingId,
      customerId: refund.customerId,
      amount: refund.amount.amount,
      currency: refund.amount.currency,
      status: refund.status,
      reason: refund.reason,
      rejectionReason: refund.rejectionReason,
      paymentReference: refund.paymentReference,
      requestedAt: refund.requestedAt,
    };
  }
}
 
export class GetRefundsByCustomerQueryHandler {
  constructor(private readonly refundRepository: IRefundRepository) {}
 
  async execute(query: GetRefundsByCustomerQuery): Promise<RefundDto[]> {
    const refunds = await this.refundRepository.findByCustomerId(
      query.customerId,
    );
 
    return refunds.map((refund) => ({
      id: refund.id,
      bookingId: refund.bookingId,
      customerId: refund.customerId,
      amount: refund.amount.amount,
      currency: refund.amount.currency,
      status: refund.status,
      reason: refund.reason,
      rejectionReason: refund.rejectionReason,
      paymentReference: refund.paymentReference,
      requestedAt: refund.requestedAt,
    }));
  }
}