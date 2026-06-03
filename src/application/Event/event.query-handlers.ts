import { IEventRepository } from '../../domain/event/event.repository.js';
import { IBookingRepository } from '../../domain/booking/booking.repository.js';
import { ITicketRepository } from '../../domain/ticket/ticket.repository.js';
import { BookingStatus } from '../../domain/booking/value-objects.js';
import { EventDto } from '../dto/event.dto.js';
import { SalesReportDto, ParticipantDto } from '../dto/report.dto.js';
import { GetEventByIdQuery, GetPublishedEventsQuery, GetEventSalesReportQuery, GetEventParticipantsQuery } from './event.queries.js';

export class GetEventByIdQueryHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(query: GetEventByIdQuery): Promise<EventDto> {
    const event = await this.eventRepository.findById(query.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    return {
      id: event.id,
      organizerId: event.organizerId,
      name: event.name,
      description: event.description,
      location: event.location,
      startDate: event.schedule.start,
      endDate: event.schedule.end,
      maxCapacity: event.capacity.capacity,
      status: event.status,
      categories: event.getTicketCategories().map((c) => ({
        id: c.id,
        eventId: c.eventId,
        name: c.name,
        price: c.price.amount,
        currency: c.price.currency,
        quota: c.quota,
        remainingQuota: c.remainingQuota,
        salesStart: c.salesStart,
        salesEnd: c.salesEnd,
        isActive: c.isActive,
      })),
    };
  }
}

export class GetPublishedEventsQueryHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(query: GetPublishedEventsQuery): Promise<EventDto[]> {
    const events = await this.eventRepository.findPublished();

    const filtered = events.filter((e) => {
      if (query.location && e.location !== query.location) return false;

      if (query.date) {
        const eventStart = e.schedule.start.toDateString();
        const filterDate = query.date.toDateString();
        if (eventStart !== filterDate) return false;
      }

      return true;
    });

    return filtered.map((event) => ({
      id: event.id,
      organizerId: event.organizerId,
      name: event.name,
      description: event.description,
      location: event.location,
      startDate: event.schedule.start,
      endDate: event.schedule.end,
      maxCapacity: event.capacity.capacity,
      status: event.status,
      categories: event.getTicketCategories().map((c) => ({
        id: c.id,
        eventId: c.eventId,
        name: c.name,
        price: c.price.amount,
        currency: c.price.currency,
        quota: c.quota,
        remainingQuota: c.remainingQuota,
        salesStart: c.salesStart,
        salesEnd: c.salesEnd,
        isActive: c.isActive,
      })),
    }));
  }
}

export class GetEventSalesReportQueryHandler {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(query: GetEventSalesReportQuery): Promise<SalesReportDto> {
    const event = await this.eventRepository.findById(query.eventId);
    if (!event) throw new Error('Event not found');

    const bookings = await this.bookingRepository.findByEventId(query.eventId);
    const paidBookings = bookings.filter((b) => b.status === BookingStatus.Paid);

    // Build per-category sales map
    const categoryMap = new Map<string, { name: string; sold: number; revenue: number; currency: string }>();
    for (const category of event.getTicketCategories()) {
      categoryMap.set(category.id, {
        name: category.name,
        sold: 0,
        revenue: 0,
        currency: category.price.currency,
      });
    }

    for (const booking of paidBookings) {
      const entry = categoryMap.get(booking.categoryId);
      if (entry) {
        entry.sold += booking.quantity;
        entry.revenue += booking.totalPrice.amount;
      }
    }

    const categorySales = Array.from(categoryMap.entries()).map(([id, data]) => ({
      categoryId: id,
      categoryName: data.name,
      ticketsSold: data.sold,
      revenue: data.revenue,
      currency: data.currency,
    }));

    const totalRevenue = categorySales.reduce((sum, c) => sum + c.revenue, 0);
    const currency = categorySales[0]?.currency ?? 'IDR';

    return {
      eventId: query.eventId,
      categorySales,
      bookingCountByStatus: {
        pendingPayment: bookings.filter((b) => b.status === BookingStatus.PendingPayment).length,
        paid: paidBookings.length,
        expired: bookings.filter((b) => b.status === BookingStatus.Expired).length,
        refunded: bookings.filter((b) => b.status === BookingStatus.Refunded).length,
      },
      totalRevenue,
      currency,
    };
  }
}

export class GetEventParticipantsQueryHandler {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(query: GetEventParticipantsQuery): Promise<ParticipantDto[]> {
    const event = await this.eventRepository.findById(query.eventId);
    if (!event) throw new Error('Event not found');

    const bookings = await this.bookingRepository.findByEventId(query.eventId);
    const paidBookings = bookings.filter((b) => b.status === BookingStatus.Paid);

    const categoryMap = new Map(
      event.getTicketCategories().map((c) => [c.id, c.name]),
    );

    const participants: ParticipantDto[] = [];

    for (const booking of paidBookings) {
      const tickets = await this.ticketRepository.findByBookingId(booking.id);
      for (const ticket of tickets) {
        participants.push({
          customerId: booking.customerId,
          ticketCategoryId: booking.categoryId,
          ticketCategoryName: categoryMap.get(booking.categoryId) ?? '',
          ticketCode: ticket.code.value,
          checkInStatus: ticket.status,
        });
      }
    }

    return participants;
  }
}
