import { Module } from '@nestjs/common';
import { RefundController } from '../controllers/refund.controller';
import { RefundApplicationService } from '../../infrastructure/services/refund-application.service';

@Module({
  controllers: [RefundController],
  providers: [RefundApplicationService],
  exports: [RefundApplicationService],
})
export class RefundModule {}
