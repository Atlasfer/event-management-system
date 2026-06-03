export interface TicketCategoryDto {
  id: string;
  eventId: string;
  name: string;
  price: number;
  currency: string;
  quota: number;
  remainingQuota: number;
  salesStart: Date;
  salesEnd: Date;
  isActive: boolean;
}

export interface EventDto {
  id: string;
  organizerId: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  maxCapacity: number;
  status: string;
  categories: TicketCategoryDto[];
}