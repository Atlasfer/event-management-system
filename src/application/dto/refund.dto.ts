export interface RefundDto {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  reason: string | null;
  rejectionReason: string | null;
  paymentReference: string | null;
  requestedAt: Date;
}