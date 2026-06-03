export interface TicketDto {
  id: string;
  bookingId: string;
  eventId: string;
  code: string;
  status: string;
  checkedInAt: Date | null;
}