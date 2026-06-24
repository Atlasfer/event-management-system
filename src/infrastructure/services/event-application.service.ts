import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PrismaEventRepository } from '../database/repositories/prisma-event.repository';
import { PrismaBookingRepository } from '../database/repositories/prisma-booking.repository';
import { PrismaTicketRepository } from '../database/repositories/prisma-ticket.repository';

import {
  CreateEventCommandHandler,
  PublishEventCommandHandler,
  CancelEventCommandHandler,
  CreateTicketCategoryCommandHandler,
  DisableTicketCategoryCommandHandler,
} from '../../application/Event/event.command.handlers';

import {
  GetEventByIdQueryHandler,
  GetPublishedEventsQueryHandler,
  GetEventSalesReportQueryHandler,
  GetEventParticipantsQueryHandler,
} from '../../application/Event/event.query-handlers';

import {
  CreateEventCommand,
  PublishEventCommand,
  CancelEventCommand,
  CreateTicketCategoryCommand,
  DisableTicketCategoryCommand,
} from '../../application/Event/event.commands';

import {
  GetEventByIdQuery,
  GetPublishedEventsQuery,
  GetEventSalesReportQuery,
  GetEventParticipantsQuery,
} from '../../application/Event/event.queries';

import { EventDto } from '../../application/dto/event.dto';
import {
  SalesReportDto,
  ParticipantDto,
} from '../../application/dto/report.dto';

@Injectable()
export class EventApplicationService {
  private readonly eventRepository: PrismaEventRepository;
  private readonly bookingRepository: PrismaBookingRepository;
  private readonly ticketRepository: PrismaTicketRepository;

  constructor(private readonly prisma: PrismaService) {
    this.eventRepository = new PrismaEventRepository(prisma);
    this.bookingRepository = new PrismaBookingRepository(prisma);
    this.ticketRepository = new PrismaTicketRepository(prisma);
  }

  async createEvent(command: CreateEventCommand): Promise<void> {
    const handler = new CreateEventCommandHandler(this.eventRepository);
    await handler.execute(command);
  }

  async publishEvent(command: PublishEventCommand): Promise<void> {
    const handler = new PublishEventCommandHandler(this.eventRepository);
    await handler.execute(command);
  }

  async cancelEvent(command: CancelEventCommand): Promise<void> {
    const handler = new CancelEventCommandHandler(this.eventRepository);
    await handler.execute(command);
  }

  async createTicketCategory(
    command: CreateTicketCategoryCommand,
  ): Promise<void> {
    const handler = new CreateTicketCategoryCommandHandler(
      this.eventRepository,
    );
    await handler.execute(command);
  }

  async disableTicketCategory(
    command: DisableTicketCategoryCommand,
  ): Promise<void> {
    const handler = new DisableTicketCategoryCommandHandler(
      this.eventRepository,
    );
    await handler.execute(command);
  }

  async getEventById(query: GetEventByIdQuery): Promise<EventDto> {
    const handler = new GetEventByIdQueryHandler(this.eventRepository);
    return handler.execute(query);
  }

  async getPublishedEvents(
    query: GetPublishedEventsQuery,
  ): Promise<EventDto[]> {
    const handler = new GetPublishedEventsQueryHandler(this.eventRepository);
    return handler.execute(query);
  }

  async getEventSalesReport(
    query: GetEventSalesReportQuery,
  ): Promise<SalesReportDto> {
    const handler = new GetEventSalesReportQueryHandler(
      this.eventRepository,
      this.bookingRepository,
    );
    return handler.execute(query);
  }

  async getEventParticipants(
    query: GetEventParticipantsQuery,
  ): Promise<ParticipantDto[]> {
    const handler = new GetEventParticipantsQueryHandler(
      this.eventRepository,
      this.bookingRepository,
      this.ticketRepository,
    );
    return handler.execute(query);
  }
}
