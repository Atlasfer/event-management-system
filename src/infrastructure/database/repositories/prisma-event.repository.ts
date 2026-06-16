import { IEventRepository } from '../../../domain/event/event.repository';
import { EventAggregate } from '../../../domain/event/event.aggregate';
import { EventStatus } from '../../../domain/event/event-status';
import { TicketCategory } from '../../../domain/event/ticket-category.entity';
import { Money } from '../../../domain/shared/money.vo';
import { PrismaService } from '../../database/prisma.service';

export class PrismaEventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<EventAggregate | null> {
    const record = await this.prisma.event.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findPublished(): Promise<EventAggregate[]> {
    const records = await this.prisma.event.findMany({
      where: { status: EventStatus.Published },
      include: { categories: true },
    });

    return records.map((r) => this.toDomain(r));
  }

  async save(event: EventAggregate): Promise<void> {
    const categories = event.getTicketCategories();

    await this.prisma.$transaction(async (tx) => {
      await tx.event.upsert({
        where: { id: event.id },
        create: {
          id: event.id,
          organizerId: event.organizerId,
          name: event.name,
          description: event.description,
          location: event.location,
          startDate: event.schedule.start,
          endDate: event.schedule.end,
          maxCapacity: event.capacity.capacity,
          status: event.status,
        },
        update: {
          name: event.name,
          description: event.description,
          location: event.location,
          startDate: event.schedule.start,
          endDate: event.schedule.end,
          maxCapacity: event.capacity.capacity,
          status: event.status,
        },
      });

      for (const category of categories) {
        await tx.ticketCategory.upsert({
          where: { id: category.id },
          create: {
            id: category.id,
            eventId: category.eventId,
            name: category.name,
            priceAmount: category.price.amount,
            priceCurrency: category.price.currency,
            quota: category.quota,
            remainingQuota: category.remainingQuota,
            salesStart: category.salesStart,
            salesEnd: category.salesEnd,
            isActive: category.isActive,
          },
          update: {
            name: category.name,
            priceAmount: category.price.amount,
            priceCurrency: category.price.currency,
            quota: category.quota,
            remainingQuota: category.remainingQuota,
            salesStart: category.salesStart,
            salesEnd: category.salesEnd,
            isActive: category.isActive,
          },
        });
      }
    });
  }

  private toDomain(record: {
    id: string;
    organizerId: string;
    name: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
    maxCapacity: number;
    status: string;
    categories: Array<{
      id: string;
      eventId: string;
      name: string;
      priceAmount: number;
      priceCurrency: string;
      quota: number;
      remainingQuota: number;
      salesStart: Date;
      salesEnd: Date;
      isActive: boolean;
    }>;
  }): EventAggregate {
    const categories = record.categories.map((c) =>
      TicketCategory.reconstitute({
        id: c.id,
        eventId: c.eventId,
        name: c.name,
        price: Money.create(c.priceAmount, c.priceCurrency),
        quota: c.quota,
        remainingQuota: c.remainingQuota,
        salesStart: c.salesStart,
        salesEnd: c.salesEnd,
        isActive: c.isActive,
      }),
    );

    return EventAggregate.reconstitute({
      id: record.id,
      organizerId: record.organizerId,
      name: record.name,
      description: record.description,
      location: record.location,
      startDate: record.startDate,
      endDate: record.endDate,
      maxCapacity: record.maxCapacity,
      status: record.status as EventStatus,
      categories,
    });
  }
}
