import { EventAggregate } from '../../../src/domain/event/event.aggregate';
import { DomainError } from '../../../src/domain/shared/domain-error';

describe('EventAggregate Domain Rules', () => {
  it('should throw if event schedule is invalid', () => {
    expect(() => {
      EventAggregate.create({
        id: 'event-1',
        organizerId: 'org-1',
        name: 'Concert',
        description: 'Music concert',
        location: 'Surabaya',
        startDate: new Date('2025-12-10'),
        endDate: new Date('2025-12-09'),
        maxCapacity: 100,
      });
    }).toThrow(DomainError);
  });

  it('should throw if event capacity is <= 0', () => {
    expect(() => {
      EventAggregate.create({
        id: 'event-1',
        organizerId: 'org-1',
        name: 'Concert',
        description: 'Music concert',
        location: 'Surabaya',
        startDate: new Date('2025-12-10'),
        endDate: new Date('2025-12-11'),
        maxCapacity: 0,
      });
    }).toThrow(DomainError);
  });

  it('should not publish if there is no active ticket category', () => {
    const event = EventAggregate.create({
      id: 'event-1',
      organizerId: 'org-1',
      name: 'Concert',
      description: 'Music concert',
      location: 'Surabaya',
      startDate: new Date('2025-12-10'),
      endDate: new Date('2025-12-11'),
      maxCapacity: 100,
    });

    expect(() => {
      event.publish();
    }).toThrow('Event cannot be published without active ticket category');
  });

  it('should throw if total ticket quota exceeds event capacity', () => {
    const event = EventAggregate.create({
      id: 'event-1',
      organizerId: 'org-1',
      name: 'Concert',
      description: 'Music concert',
      location: 'Surabaya',
      startDate: new Date('2025-12-10'),
      endDate: new Date('2025-12-11'),
      maxCapacity: 10,
    });

    expect(() => {
      event.createTicketCategory({
        id: 'cat-1',
        name: 'VIP',
        price: 100000,
        quota: 20,
        salesStart: new Date('2025-12-01'),
        salesEnd: new Date('2025-12-10'),
      });
    }).toThrow('Total ticket quota cannot exceed event capacity');
  });
});