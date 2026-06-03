export interface CategorySalesDto {
  categoryId: string;
  categoryName: string;
  ticketsSold: number;
  revenue: number;
  currency: string;
}

export interface SalesReportDto {
  eventId: string;
  categorySales: CategorySalesDto[];
  bookingCountByStatus: {
    pendingPayment: number;
    paid: number;
    expired: number;
    refunded: number;
  };
  totalRevenue: number;
  currency: string;
}

export interface ParticipantDto {
  customerId: string;
  ticketCategoryId: string;
  ticketCategoryName: string;
  ticketCode: string;
  checkInStatus: string;
}
