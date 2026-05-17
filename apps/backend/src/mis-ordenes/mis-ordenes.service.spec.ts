import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MisOrdenesService } from './mis-ordenes.service';

const mockDb = {
  query: vi.fn(),
};

describe('MisOrdenesService.findById', () => {
  let service: MisOrdenesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MisOrdenesService(mockDb as any);
  });

  it('lanza ForbiddenException si idCliente es null', async () => {
    await expect(service.findById(null, 1)).rejects.toThrow(ForbiddenException);
    expect(mockDb.query).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException si la venta no existe para ese cliente', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    await expect(service.findById(5, 99)).rejects.toThrow(NotFoundException);
  });

  it('lanza NotFoundException si la venta pertenece a otro cliente', async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [] });

    await expect(service.findById(5, 10)).rejects.toThrow(NotFoundException);
  });

  it('devuelve la orden completa con items cuando pertenece al cliente', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [
          {
            id_venta: 10,
            fecha_venta: new Date('2025-01-15'),
            estado_venta: 'completada',
            metodo_pago: 'tarjeta',
            descuento_venta: '0.00',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id_detalle_venta: 1,
            id_producto: 3,
            titulo_producto: 'Dark Side of the Moon',
            artistas: ['Pink Floyd'],
            formato: 'Vinilo',
            cantidad_vendida: 1,
            precio_unitario_venta: '50.00',
            descuento_detalle: '0.00',
            imagen_url: null,
          },
        ],
      });

    const result = await service.findById(5, 10);

    expect(result.idVenta).toBe(10);
    expect(result.estadoVenta).toBe('completada');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].tituloProducto).toBe('Dark Side of the Moon');
    expect(result.items[0].precioUnitario).toBe(50);
    expect(result.totalConIva).toBeGreaterThan(0);
  });

  it('no expone contrasenaHash ni campos de password en la respuesta', async () => {
    mockDb.query
      .mockResolvedValueOnce({
        rows: [
          {
            id_venta: 7,
            fecha_venta: new Date(),
            estado_venta: 'pendiente',
            metodo_pago: 'efectivo',
            descuento_venta: '0',
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });

    const result = await service.findById(2, 7);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('contrasena');
    expect(serialized).not.toContain('hash');
    expect(serialized).not.toContain('password');
  });
});
