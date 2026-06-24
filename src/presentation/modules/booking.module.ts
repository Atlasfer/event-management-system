import { Module } from '@nestjs/common';
import { BookingController } from '../controllers/booking.controller';
import { BookingApplicationService } from '../../infrastructure/services/booking-application.service';

@Module({
  controllers: [BookingController],
  providers: [BookingApplicationService],
  exports: [BookingApplicationService],
})
export class BookingModule {}
