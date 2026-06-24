import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/database/prisma.modules';
import { BookingModule } from './presentation/modules/booking.module';
import { EventModule } from './presentation/modules/event.module';
import { RefundModule } from './presentation/modules/refund.module';
import { TicketModule } from './presentation/modules/ticket.module';

@Module({
  imports: [
    PrismaModule,
    EventModule,
    BookingModule,
    RefundModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
