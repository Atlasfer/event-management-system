import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BookingApplicationService } from '../../infrastructure/services/booking-application.service';
import {
  CreateBookingCommand,
  ExpireBookingCommand,
  PayBookingCommand,
} from '../../application/Booking/booking.commands';
import {
  GetBookingDetailQuery,
  GetCustomerBookingsQuery,
} from '../../application/Booking/booking.queries';
import {
  CreateBookingRequest,
  PayBookingRequest,
} from '../request/booking.request';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() request: CreateBookingRequest,
  ): Promise<{ bookingId: string }> {
    const bookingId = randomUUID();

    const command = new CreateBookingCommand(
      bookingId,
      request.customerId,
      request.eventId,
      request.categoryId,
      request.quantity,
    );

    await this.bookingService.createBooking(command);

    return { bookingId };
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const query = new GetBookingDetailQuery(id);
    return this.bookingService.getBookingDetail(query);
  }

  @Get('customer/:customerId')
  async getByCustomer(@Param('customerId', ParseUUIDPipe) customerId: string) {
    const query = new GetCustomerBookingsQuery(customerId);
    return this.bookingService.getCustomerBookings(query);
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  async pay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() request: PayBookingRequest,
  ): Promise<{ status: string }> {
    const command = new PayBookingCommand(
      id,
      request.paymentAmount,
      request.currency,
    );
    await this.bookingService.payBooking(command);
    return { status: 'paid' };
  }

  @Post(':id/expire')
  @HttpCode(HttpStatus.OK)
  async expire(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ status: string }> {
    const command = new ExpireBookingCommand(id);
    await this.bookingService.expireBooking(command);
    return { status: 'expired' };
  }
}
