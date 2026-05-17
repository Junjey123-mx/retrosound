import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';

const mockPrisma = {
  $queryRaw: vi.fn(),
  venta: { findUnique: vi.fn() },
};

const baseVenta = {
  idVenta: 42,
  fechaVenta: new Date('2026-05-16'),
  metodoPago: 'efectivo',
  estadoVenta: 'completada',
  descuentoVenta: 0,
  cliente: {
    idCliente: 1,
    nombreCliente: 'Ana',
    apellidoCliente: 'García',
    correoCliente: 'ana@test.com',
  },
  detalles: [
    {
      idProducto: 10,
      cantidadVendida: 2,
      precioUnitarioVenta: 29.99,
      descuentoDetalle: 0,
      producto: {
        idProducto: 10,
        tituloProducto: 'Dark Side of the Moon',
        codigoSku: 'VINYL-001',
      },
    },
  ],
};

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CheckoutService(mockPrisma as any);
  });

  describe('checkout', () => {
    it('lanza BadRequestException si idCliente es null', async () => {
      await expect(
        service.checkout(null, { metodoPago: 'efectivo' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('checkout exitoso invoca prisma.$queryRaw y devuelve respuesta estructurada', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ p_id_venta_generada: 42 }]);
      mockPrisma.venta.findUnique.mockResolvedValue(baseVenta);

      const result = await service.checkout(1, { metodoPago: 'efectivo' });

      expect(mockPrisma.$queryRaw).toHaveBeenCalledOnce();
      expect(result.mensaje).toBe('Checkout realizado exitosamente');
      expect(result.idVenta).toBe(42);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].sku).toBe('VINYL-001');
      expect(result.recibo.total).toBeGreaterThan(0);
    });

    it('traduce error de stock insuficiente a ConflictException', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(
        new Error('insufficient stock for product'),
      );

      await expect(
        service.checkout(1, { metodoPago: 'efectivo' }),
      ).rejects.toThrow(ConflictException);
    });

    it('traduce error de carrito inactivo a NotFoundException', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('no active cart found'));

      await expect(
        service.checkout(1, { metodoPago: 'efectivo' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('traduce error de carrito vacío a BadRequestException', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('cart is empty'));

      await expect(
        service.checkout(1, { metodoPago: 'efectivo' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si la venta no puede recuperarse tras el SP', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ p_id_venta_generada: 99 }]);
      mockPrisma.venta.findUnique.mockResolvedValue(null);

      await expect(
        service.checkout(1, { metodoPago: 'efectivo' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
