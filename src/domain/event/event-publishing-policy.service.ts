import { DomainError } from '../shared/domain-error';
import { TicketCategory } from './ticket-category.entity';

export class EventPublishingPolicyService {
  public static validate(categories: TicketCategory[], eventCapacity: number): void {
    const activeCategories = categories.filter((c) => c.isActive);

    if (activeCategories.length === 0) {
      throw new DomainError('Event cannot be published without active ticket category');
    }

    const totalQuota = categories.reduce((sum, c) => sum + c.quota, 0);

    if (totalQuota > eventCapacity) {
      throw new DomainError('Total ticket quota cannot exceed event capacity');
    }
  }
}