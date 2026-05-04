import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { VentasModule } from './ventas/ventas.module';
import { ClientesModule } from './clientes/clientes.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { ReportesModule } from './reportes/reportes.module';
import { CarritoModule } from './carrito/carrito.module';
import { CheckoutModule } from './checkout/checkout.module';
import { MisOrdenesModule } from './mis-ordenes/mis-ordenes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
    VentasModule,
    ClientesModule,
    EmpleadosModule,
    ProveedoresModule,
    CatalogsModule,
    ReportesModule,
    CarritoModule,
    CheckoutModule,
    MisOrdenesModule,
  ],
})
export class AppModule {}
