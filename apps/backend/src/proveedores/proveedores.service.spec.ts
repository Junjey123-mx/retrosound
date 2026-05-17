import { NotFoundException } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';

const baseProveedor = {
  idProveedor: 1,
  nombreProveedor: 'Distribuidora Vinyl',
  telefonoProveedor: '555-1234',
  correoProveedor: 'vinyl@dist.com',
  direccionProveedor: null,
  nombreContactoProveedor: 'Juan Pérez',
  estadoProveedor: 'activo',
  fechaInactivacion: null,
  productosProveedor: [],
  comprasProveedor: [],
};

const mockPrisma = {
  proveedor: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  productoProveedor: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  compraProveedor: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

describe('ProveedoresService', () => {
  let service: ProveedoresService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProveedoresService(mockPrisma as any);
  });

  describe('findOne', () => {
    it('lanza NotFoundException si el proveedor no existe', async () => {
      mockPrisma.proveedor.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('devuelve proveedor mapeado con productos y compras', async () => {
      mockPrisma.proveedor.findUnique.mockResolvedValue(baseProveedor);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.nombre).toBe('Distribuidora Vinyl');
      expect(result.correo).toBe('vinyl@dist.com');
      expect(result.estado).toBe('activo');
      expect(result.productos).toEqual([]);
      expect(result.compras).toEqual([]);
    });
  });

  describe('create', () => {
    it('crea proveedor invocando prisma.proveedor.create y devuelve datos mapeados', async () => {
      mockPrisma.proveedor.create.mockResolvedValue(baseProveedor);

      const result = await service.create({
        nombre: 'Distribuidora Vinyl',
        correo: 'vinyl@dist.com',
      });

      expect(mockPrisma.proveedor.create).toHaveBeenCalledOnce();
      expect(mockPrisma.proveedor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nombreProveedor: 'Distribuidora Vinyl' }),
        }),
      );
      expect(result.id).toBe(1);
      expect(result.nombre).toBe('Distribuidora Vinyl');
    });
  });

  describe('remove', () => {
    it('marca el proveedor como inactivo con fechaInactivacion (soft delete)', async () => {
      mockPrisma.proveedor.findUnique.mockResolvedValue(baseProveedor);
      const inactivo = {
        ...baseProveedor,
        estadoProveedor: 'inactivo',
        fechaInactivacion: new Date(),
      };
      mockPrisma.proveedor.update.mockResolvedValue(inactivo);

      const result = await service.remove(1);

      expect(mockPrisma.proveedor.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estadoProveedor: 'inactivo' }),
        }),
      );
      expect(result.estado).toBe('inactivo');
      expect(result.fechaInactivacion).toBeDefined();
    });

    it('lanza NotFoundException si el proveedor a eliminar no existe', async () => {
      mockPrisma.proveedor.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.proveedor.update).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('actualiza el estado del proveedor', async () => {
      mockPrisma.proveedor.findUnique.mockResolvedValue(baseProveedor);
      const actualizado = { ...baseProveedor, estadoProveedor: 'inactivo' };
      mockPrisma.proveedor.update.mockResolvedValue(actualizado);

      const result = await service.updateStatus(1, 'inactivo');

      expect(result.estado).toBe('inactivo');
      expect(mockPrisma.proveedor.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estadoProveedor: 'inactivo' }),
        }),
      );
    });
  });

  describe('findProductosByProveedor', () => {
    it('lanza NotFoundException si el proveedor no existe', async () => {
      mockPrisma.proveedor.findUnique.mockResolvedValue(null);

      await expect(service.findProductosByProveedor(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve array vacío cuando el proveedor no tiene productos', async () => {
      mockPrisma.proveedor.findUnique.mockResolvedValue(baseProveedor);
      mockPrisma.productoProveedor.findMany.mockResolvedValue([]);

      const result = await service.findProductosByProveedor(1);

      expect(result).toEqual([]);
    });
  });
});
