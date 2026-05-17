import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductosService } from './productos.service';

const baseProducto = {
  idProducto: 1,
  tituloProducto: 'Dark Side of the Moon',
  descripcionProducto: null,
  anioLanzamiento: 1973,
  precioVenta: 29.99,
  stockActual: 10,
  stockMinimo: 2,
  codigoSku: 'VINYL-001',
  estadoProducto: 'activo',
  fechaInactivacion: null,
  imagenUrl: null,
  imagenPublicId: null,
  idCategoria: 1,
  idFormato: 1,
  categoria: {
    idCategoria: 1,
    nombreCategoria: 'Rock',
    descripcionCategoria: null,
    estadoCategoria: 'activo',
  },
  formato: {
    idFormato: 1,
    nombreFormato: 'Vinyl',
    descripcionFormato: null,
    estadoFormato: 'activo',
  },
  productosArtista: [],
  productosGenero: [],
};

const mockPrisma = {
  producto: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('ProductosService', () => {
  let service: ProductosService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProductosService(mockPrisma as any);
  });

  describe('findOne', () => {
    it('devuelve producto mapeado si existe', async () => {
      mockPrisma.producto.findUnique.mockResolvedValue(baseProducto);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.titulo).toBe('Dark Side of the Moon');
      expect(result.codigoSku).toBe('VINYL-001');
      expect(result.precioVenta).toBe(29.99);
      expect(result.categoria.nombre).toBe('Rock');
    });

    it('lanza NotFoundException si el producto no existe', async () => {
      mockPrisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('invoca prisma.producto.create y devuelve producto mapeado', async () => {
      mockPrisma.producto.create.mockResolvedValue(baseProducto);

      const dto = {
        titulo: 'Dark Side of the Moon',
        precioVenta: 29.99,
        stockActual: 10,
        stockMinimo: 2,
        codigoSku: 'VINYL-001',
        idCategoria: 1,
        idFormato: 1,
      };

      const result = await service.create(dto);

      expect(mockPrisma.producto.create).toHaveBeenCalledOnce();
      expect(result.codigoSku).toBe('VINYL-001');
      expect(result.titulo).toBe('Dark Side of the Moon');
    });

    it('lanza BadRequestException si el SKU ya existe (P2002)', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`codigo_sku`)',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      mockPrisma.producto.create.mockRejectedValue(error);

      await expect(
        service.create({
          titulo: 'Duplicado',
          precioVenta: 9.99,
          stockActual: 1,
          stockMinimo: 0,
          codigoSku: 'VINYL-001',
          idCategoria: 1,
          idFormato: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('hace soft delete marcando estado descontinuado y fechaInactivacion', async () => {
      mockPrisma.producto.findUnique.mockResolvedValue(baseProducto);
      const descontinuado = {
        ...baseProducto,
        estadoProducto: 'descontinuado',
        fechaInactivacion: new Date(),
      };
      mockPrisma.producto.update.mockResolvedValue(descontinuado);

      const result = await service.remove(1);

      expect(mockPrisma.producto.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estadoProducto: 'descontinuado',
          }),
        }),
      );
      expect(result.estado).toBe('descontinuado');
      expect(result.fechaInactivacion).toBeDefined();
    });

    it('lanza NotFoundException si el producto a eliminar no existe', async () => {
      mockPrisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.producto.update).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('actualiza estado del producto correctamente', async () => {
      mockPrisma.producto.findUnique.mockResolvedValue(baseProducto);
      const inactivo = { ...baseProducto, estadoProducto: 'inactivo', fechaInactivacion: new Date() };
      mockPrisma.producto.update.mockResolvedValue(inactivo);

      const result = await service.updateStatus(1, 'inactivo');

      expect(result.estado).toBe('inactivo');
      expect(mockPrisma.producto.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estadoProducto: 'inactivo' }),
        }),
      );
    });
  });
});
