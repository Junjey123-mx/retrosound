import { Module } from '@nestjs/common';
import { MisOrdenesController } from './mis-ordenes.controller';
import { MisOrdenesService } from './mis-ordenes.service';

@Module({
  controllers: [MisOrdenesController],
  providers: [MisOrdenesService],
})
export class MisOrdenesModule {}
