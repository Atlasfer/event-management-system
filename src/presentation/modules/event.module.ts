import { Module } from '@nestjs/common';
import { EventController } from '../controllers/event.controller';
import { EventApplicationService } from '../../infrastructure/services/event-application.service';

@Module({
  controllers: [EventController],
  providers: [EventApplicationService],
  exports: [EventApplicationService],
})
export class EventModule {}
