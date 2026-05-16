import { Module } from '@nestjs/common';
import { ProveedorPortalController } from './proveedor-portal.controller';
import { ProveedorPortalService } from './proveedor-portal.service';

@Module({
  controllers: [ProveedorPortalController],
  providers: [ProveedorPortalService],
})
export class ProveedorPortalModule {}
