import { PrismaService } from '../../database/prisma.service';
import { IBookingRepository } from '../../../domain/booking/booking.repository';
import { BookingAggregate } from '../../../domain/booking/booking.aggregate';
import { BookingStatus, PaymentDeadline } from '../../../domain/booking/value-objects';
import { Money } from '../../../domain/shared/money.vo';

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(booking: BookingAggregate): Promise<void> {
    await this.prisma.booking.upsert({
      where: { id: booking.id },
      create: {
        id: booking.id,
        customerId: booking.customerId,
        eventId: booking.eventId,
        categoryId: booking.categoryId,
        quantity: booking.quantity,
        totalAmount: booking.totalPrice.amount,
        totalCurrency: booking.totalPrice.currency,
        status: booking.status,
        paymentDeadline: booking.paymentDeadline.value,
      },
      update: {
        status: booking.status,
        paymentDeadline: booking.paymentDeadline.value,
      },
    });
  }

  async findById(id: string): Promise<BookingAggregate | null> {
    const record = await this.prisma.booking.findUnique({
      where: { id },
    });
 
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByCustomerAndEvent(
    customerId: string,
    eventId: string,
  ): Promise<BookingAggregate[]> {
    const records = await this.prisma.booking.findMany({
      where: { customerId, eventId },
    });
 
    return records.map((r) => this.toDomain(r));
  }

  async findByStatus(status: BookingStatus): Promise<BookingAggregate[]> {
    const records = await this.prisma.booking.findMany({
      where: { status },
    });
 
    return records.map((r) => this.toDomain(r));
  }

  async findByEventId(eventId: string): Promise<BookingAggregate[]> {
    const records = await this.prisma.booking.findMany({
      where: { eventId },
    });
 
    return records.map((r) => this.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.booking.delete({ where: { id } });
  }

  private toDomain(record: {
    id: string;
    customerId: string;
    eventId: string;
    categoryId: string;
    quantity: number;
    totalAmount: any;
    totalCurrency: string;
    status: string;
    paymentDeadline: Date;
  }): BookingAggregate {
    return BookingAggregate.reconstitute({
      id: record.id,
      customerId: record.customerId,
      eventId: record.eventId,
      categoryId: record.categoryId,
      quantity: record.quantity,
      totalPrice: Money.create(Number(record.totalAmount), record.totalCurrency),
      status: record.status as BookingStatus,
      paymentDeadline: new PaymentDeadline(record.paymentDeadline),
      tickets: [],
    });
  }
}