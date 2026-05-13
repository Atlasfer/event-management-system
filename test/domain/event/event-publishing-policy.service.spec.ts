import { EventPublishingPolicyService } from '../../../src/domain/event/event-publishing-policy.service';
import { TicketCategory } from '../../../src/domain/event/ticket-category.entity';
import { Money } from '../../../src/domain/shared/money.vo';
import { DomainError } from '../../../src/domain/shared/domain-error';

describe('EventPublishingPolicyService', () => {
  it('should throw if there is no active ticket category', () => {
    const categories: TicketCategory[] = [];

    expect(() => {
      EventPublishingPolicyService.validate(categories, 100);
    }).toThrow(DomainError);
  });

  it('should throw if total quota exceeds event capacity', () => {
    const category = TicketCategory.create({
      id: 'cat-1',
      eventId: 'event-1',
      name: 'VIP',
      price: Money.create(100000),
      quota: 200,
      salesStart: new Date('2025-12-01'),
      salesEnd: new Date('2025-12-10'),
      eventStartDate: new Date('2025-12-10'),
    });

    const categories = [category];

    expect(() => {
      EventPublishingPolicyService.validate(categories, 100);
    }).toThrow('Total ticket quota cannot exceed event capacity');
  });

  it('should pass validation if active categories exist and quota fits capacity', () => {
    const category = TicketCategory.create({
      id: 'cat-1',
      eventId: 'event-1',
      name: 'Regular',
      price: Money.create(50000),
      quota: 50,
      salesStart: new Date('2025-12-01'),
      salesEnd: new Date('2025-12-10'),
      eventStartDate: new Date('2025-12-10'),
    });

    const categories = [category];

    expect(() => {
      EventPublishingPolicyService.validate(categories, 100);
    }).not.toThrow();
  });

  it('should fail if all categories are disabled', () => {
    const category = TicketCategory.create({
      id: 'cat-1',
      eventId: 'event-1',
      name: 'Regular',
      price: Money.create(50000),
      quota: 50,
      salesStart: new Date('2025-12-01'),
      salesEnd: new Date('2025-12-10'),
      eventStartDate: new Date('2025-12-10'),
    });

    category.disable();

    expect(() => {
      EventPublishingPolicyService.validate([category], 100);
    }).toThrow('Event cannot be published without active ticket category');
  });
});