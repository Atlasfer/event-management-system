import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventApplicationService } from '../../infrastructure/services/event-application.service';
import {
  CancelEventCommand,
  CreateEventCommand,
  CreateTicketCategoryCommand,
  DisableTicketCategoryCommand,
  PublishEventCommand,
} from '../../application/Event/event.commands';
import {
  GetEventByIdQuery,
  GetEventParticipantsQuery,
  GetEventSalesReportQuery,
  GetPublishedEventsQuery,
} from '../../application/Event/event.queries';
import {
  CreateEventRequest,
  CreateTicketCategoryRequest,
  GetPublishedEventsRequest,
} from '../request/event.request';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() request: CreateEventRequest,
  ): Promise<{ eventId: string }> {
    const eventId = randomUUID();

    const command = new CreateEventCommand(
      eventId,
      request.organizerId,
      request.name,
      request.description,
      request.location,
      request.startDate,
      request.endDate,
      request.maxCapacity,
    );

    await this.eventService.createEvent(command);

    return { eventId };
  }

  @Get()
  async getPublished(@Query() request: GetPublishedEventsRequest) {
    const query = new GetPublishedEventsQuery(request.location, request.date);
    return this.eventService.getPublishedEvents(query);
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const query = new GetEventByIdQuery(id);
    return this.eventService.getEventById(query);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ status: string }> {
    await this.eventService.publishEvent(new PublishEventCommand(id));
    return { status: 'published' };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ status: string }> {
    await this.eventService.cancelEvent(new CancelEventCommand(id));
    return { status: 'cancelled' };
  }

  @Post(':id/categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Body() request: CreateTicketCategoryRequest,
  ): Promise<{ categoryId: string }> {
    const categoryId = randomUUID();

    const command = new CreateTicketCategoryCommand(
      categoryId,
      eventId,
      request.name,
      request.price,
      request.currency,
      request.quota,
      request.salesStart,
      request.salesEnd,
    );

    await this.eventService.createTicketCategory(command);

    return { categoryId };
  }

  @Post(':id/categories/:categoryId/disable')
  @HttpCode(HttpStatus.OK)
  async disableCategory(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<{ status: string }> {
    await this.eventService.disableTicketCategory(
      new DisableTicketCategoryCommand(eventId, categoryId),
    );
    return { status: 'disabled' };
  }

  @Get(':id/sales-report')
  async getSalesReport(@Param('id', ParseUUIDPipe) id: string) {
    const query = new GetEventSalesReportQuery(id);
    return this.eventService.getEventSalesReport(query);
  }

  @Get(':id/participants')
  async getParticipants(@Param('id', ParseUUIDPipe) id: string) {
    const query = new GetEventParticipantsQuery(id);
    return this.eventService.getEventParticipants(query);
  }
}
