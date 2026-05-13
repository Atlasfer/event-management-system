import { EventAggregate } from './event.aggregate';

export interface IEventRepository {
  findById(id: string): Promise<EventAggregate | null>;
  findPublished(): Promise<EventAggregate[]>;
  save(event: EventAggregate): Promise<void>;
}