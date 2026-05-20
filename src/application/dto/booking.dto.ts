export interface BookingDto {
  id: string;
  customerId: string;
  eventId: string;
  categoryId: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentDeadline: Date;
}
 
export interface BookingDetailDto extends BookingDto {
  tickets: {
    id: string;
    code: string;
    status: string;
    checkedInAt: Date | null;
  }[];
}