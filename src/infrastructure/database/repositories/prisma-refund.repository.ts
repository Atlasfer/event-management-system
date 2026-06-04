import { PrismaService } from '../../database/prisma.service';
import { IRefundRepository } from '../../../domain/refund/refund.repository';
import { RefundAggregate } from '../../../domain/refund/refund.aggregate';
import { RefundStatus } from '../../../domain/refund/value-objects';
import { Money } from '../../../domain/shared/money.vo';
 
export class PrismaRefundRepository implements IRefundRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(refund: RefundAggregate): Promise<void> {
    await this.prisma.refund.upsert({
      where: { id: refund.id },
      create: {
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
      },
      update: {
        status: refund.status,
        rejectionReason: refund.rejectionReason,
        paymentReference: refund.paymentReference,
      },
    });
  }

  async findById(id: string): Promise<RefundAggregate | null> {
    const record = await this.prisma.refund.findUnique({
      where: { id },
    });
 
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByBookingId(bookingId: string): Promise<RefundAggregate | null> {
    const record = await this.prisma.refund.findUnique({
      where: { bookingId },
    });
 
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByStatus(status: RefundStatus): Promise<RefundAggregate[]> {
    const records = await this.prisma.refund.findMany({
      where: { status },
    });
 
    return records.map((r) => this.toDomain(r));
  }

  async findByCustomerId(customerId: string): Promise<RefundAggregate[]> {
    const records = await this.prisma.refund.findMany({
      where: { customerId },
    });
 
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: {
    id: string;
    bookingId: string;
    customerId: string;
    amount: any;
    currency: string;
    status: string;
    reason: string | null;
    rejectionReason: string | null;
    paymentReference: string | null;
    requestedAt: Date;
  }): RefundAggregate {
    return RefundAggregate.reconstitute({
      id: record.id,
      bookingId: record.bookingId,
      customerId: record.customerId,
      amount: Money.create(Number(record.amount), record.currency),
      status: record.status as RefundStatus,
      reason: record.reason,
      rejectionReason: record.rejectionReason,
      paymentReference: record.paymentReference,
      requestedAt: record.requestedAt,
    });
  }
}