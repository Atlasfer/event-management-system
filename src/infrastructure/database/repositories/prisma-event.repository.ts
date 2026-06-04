import { IEventRepository } from '../../../domain/event/event.repository';
import { EventAggregate } from '../../../domain/event/event.aggregate';
import { PrismaService } from '../../database/prisma.service';

export class PrismaEventRepository implements IEventRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: string): Promise<EventAggregate | null> {
    throw new Error('Not implemented');
  }

  async findPublished(): Promise<EventAggregate[]> {
    throw new Error('Not implemented');
  }

  async save(event: EventAggregate): Promise<void> {
    throw new Error('Not implemented');
  }
}