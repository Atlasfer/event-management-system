import { IEventRepository } from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import {
  CancelEventCommand,
  CreateEventCommand,
  CreateTicketCategoryCommand,
  DisableTicketCategoryCommand,
  PublishEventCommand,
} from './event.commands';

export class CreateEventCommandHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CreateEventCommand): Promise<void> {
    const event = EventAggregate.create({
      id: command.eventId,
      organizerId: command.organizerId,
      name: command.name,
      description: command.description,
      location: command.location,
      startDate: command.startDate,
      endDate: command.endDate,
      maxCapacity: command.maxCapacity,
    });

    await this.eventRepository.save(event);
  }
}

export class PublishEventCommandHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: PublishEventCommand): Promise<void> {
    const event = await this.eventRepository.findById(command.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.publish();
    await this.eventRepository.save(event);
  }
}

export class CancelEventCommandHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CancelEventCommand): Promise<void> {
    const event = await this.eventRepository.findById(command.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.cancel();
    await this.eventRepository.save(event);
  }
}

export class CreateTicketCategoryCommandHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CreateTicketCategoryCommand): Promise<void> {
    const event = await this.eventRepository.findById(command.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.createTicketCategory({
      id: command.categoryId,
      name: command.name,
      price: command.price,
      quota: command.quota,
      salesStart: command.salesStart,
      salesEnd: command.salesEnd,
    });

    await this.eventRepository.save(event);
  }
}

export class DisableTicketCategoryCommandHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: DisableTicketCategoryCommand): Promise<void> {
    const event = await this.eventRepository.findById(command.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.disableTicketCategory(command.categoryId);

    await this.eventRepository.save(event);
  }
}