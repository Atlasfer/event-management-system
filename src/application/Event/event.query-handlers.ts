import { IEventRepository } from '../../domain/event/event.repository';
import { EventDto } from '../dto/event.dto';
import { GetEventByIdQuery, GetPublishedEventsQuery } from './event.queries';

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