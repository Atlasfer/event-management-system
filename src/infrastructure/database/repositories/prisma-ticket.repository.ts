import { PrismaService } from '../../database/prisma.service';
import { ITicketRepository } from '../../../domain/ticket/ticket.repository';
import { TicketEntity } from '../../../domain/ticket/ticket.entity';
import { TicketCode, TicketStatus } from '../../../domain/ticket/value-objects';

export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(ticket: TicketEntity): Promise<void> {
    await this.prisma.ticket.upsert({
      where: { id: ticket.id },
      create: {
        id: ticket.id,
        bookingId: ticket.bookingId,
        eventId: ticket.eventId,
        code: ticket.code.value,
        status: ticket.status,
        checkedInAt: ticket.checkedInAt,
      },
      update: {
        status: ticket.status,
        checkedInAt: ticket.checkedInAt,
      },
    });
  }

  async saveMany(tickets: TicketEntity[]): Promise<void> {
    await this.prisma.ticket.createMany({
      data: tickets.map((t) => ({
        id: t.id,
        bookingId: t.bookingId,
        eventId: t.eventId,
        code: t.code.value,
        status: t.status,
        checkedInAt: t.checkedInAt,
      })),
      skipDuplicates: true,
    });
  }

  async findById(id: string): Promise<TicketEntity | null> {
    const record = await this.prisma.ticket.findUnique({
      where: { id },
    });
 
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByCode(code: TicketCode): Promise<TicketEntity | null> {
    const record = await this.prisma.ticket.findUnique({
      where: { code: code.value },
    });
 
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByBookingId(bookingId: string): Promise<TicketEntity[]> {
    const records = await this.prisma.ticket.findMany({
      where: { bookingId },
    });
 
    return records.map((r) => this.toDomain(r));
  }

  async findByStatus(status: TicketStatus): Promise<TicketEntity[]> {
    const records = await this.prisma.ticket.findMany({
      where: { status },
    });
 
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: {
    id: string;
    bookingId: string;
    eventId: string;
    code: string;
    status: string;
    checkedInAt: Date | null;
  }): TicketEntity {
    return TicketEntity.reconstitute({
      id: record.id,
      bookingId: record.bookingId,
      eventId: record.eventId,
      code: new TicketCode(record.code),
      status: record.status as TicketStatus,
      checkedInAt: record.checkedInAt,
    });
  }
}