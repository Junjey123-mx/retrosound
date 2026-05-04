import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCarritoItemDto } from './dto/add-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';

// Selección reutilizable de campos de producto para items del carrito
const productoSelect = {
  id: true,
  titulo: true,
  precioVenta: true,
  stockActual: true,
  estado: true,
} as const;

// Include reutilizable para cargar carrito con items y producto
const carritoInclude = {
  items: {
    include: { producto: { select: productoSelect } },
  },
} as const;

@Injectable()
export class CarritoService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helper: resuelve id_cliente desde id_usuario del token ────────────────
  // CurrentUser devuelve { id: id_usuario, correo, rol }.
  // Para operar el carrito se necesita id_cliente, que se obtiene del Usuario.
  private async resolveIdCliente(idUsuario: number): Promise<number> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
      select: { idCliente: true },
    });
    if (!usuario || usuario.idCliente === null) {
      throw new ForbiddenException(
        'El usuario autenticado no tiene un perfil de cliente asociado',
      );
    }
    return usuario.idCliente;
  }

  // ── Helper: serializa un carrito con items a respuesta JSON ───────────────
  private serializarCarrito(carrito: {
    id: number;
    estado: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    items: Array<{
      id: number;
      cantidad: number;
      precioUnitarioSnapshot: unknown;
      fechaAgregado: Date;
      producto: {
        id: number;
        titulo: string;
        precioVenta: unknown;
        stockActual: number;
        estado: string;
      };
    }>;
  }) {
    const items = carrito.items.map((item) => {
      const precioSnapshot = Number(item.precioUnitarioSnapshot);
      const subtotal = Math.round(item.cantidad * precioSnapshot * 100) / 100;
      return {
        idCarritoItem: item.id,
        idProducto: item.producto.id,
        titulo: item.producto.titulo,
        estadoProducto: item.producto.estado,
        stockActual: item.producto.stockActual,
        precioVenta: Number(item.producto.precioVenta),
        cantidad: item.cantidad,
        precioUnitarioSnapshot: precioSnapshot,
        subtotal,
        fechaAgregado: item.fechaAgregado,
      };
    });

    const subtotal =
      Math.round(
        items.reduce((acc, i) => acc + i.subtotal, 0) * 100,
      ) / 100;

    return {
      idCarrito: carrito.id,
      estado: carrito.estado,
      fechaCreacion: carrito.fechaCreacion,
      fechaActualizacion: carrito.fechaActualizacion,
      items,
      subtotal,
    };
  }

  // ── GET /carrito ──────────────────────────────────────────────────────────
  // Devuelve el carrito activo con sus items y subtotales calculados.
  // Si no hay carrito activo devuelve estructura vacía (no crea carrito nuevo).
  async getCarrito(idUsuario: number) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    const carrito = await this.prisma.carrito.findFirst({
      where: { idCliente, estado: 'activo' },
      include: carritoInclude,
    });

    if (!carrito) {
      return { idCarrito: null, estado: null, items: [], subtotal: 0 };
    }

    return this.serializarCarrito(carrito);
  }

  // ── POST /carrito/items ───────────────────────────────────────────────────
  // Agrega un producto al carrito activo del cliente.
  // Si no hay carrito activo, lo crea junto con el item en una transacción.
  // Si el producto ya existe en el carrito, acumula la cantidad (suma).
  // El stock NO se descuenta — solo se valida que haya disponibilidad.
  async addItem(idUsuario: number, dto: AddCarritoItemDto) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    // Validaciones de producto fuera de transacción (lectura rápida)
    const producto = await this.prisma.producto.findUnique({
      where: { id: dto.idProducto },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    if (producto.estado === 'descontinuado' || producto.estado === 'inactivo') {
      throw new BadRequestException(
        `El producto "${producto.titulo}" no está disponible`,
      );
    }
    if (producto.stockActual <= 0) {
      throw new BadRequestException(
        `El producto "${producto.titulo}" no tiene stock disponible`,
      );
    }

    const carritoFinal = await this.prisma.$transaction(async (tx) => {
      // Buscar carrito activo; si no existe, crear uno
      let carrito = await tx.carrito.findFirst({
        where: { idCliente, estado: 'activo' },
      });

      if (!carrito) {
        carrito = await tx.carrito.create({
          data: { idCliente, estado: 'activo' },
        });
      }

      // Verificar si el producto ya está en el carrito
      const itemExistente = await tx.carritoItem.findUnique({
        where: {
          idCarrito_idProducto: {
            idCarrito: carrito.id,
            idProducto: dto.idProducto,
          },
        },
      });

      if (itemExistente) {
        // Acumular cantidad: suma la solicitada a la ya existente en carrito
        const nuevaCantidad = itemExistente.cantidad + dto.cantidad;
        if (nuevaCantidad > producto.stockActual) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.titulo}": ` +
              `disponible=${producto.stockActual}, en carrito=${itemExistente.cantidad}, ` +
              `solicitado adicional=${dto.cantidad}`,
          );
        }
        await tx.carritoItem.update({
          where: { id: itemExistente.id },
          data: { cantidad: nuevaCantidad },
        });
      } else {
        // Nuevo item: validar que la cantidad solicitada no supere stock
        if (dto.cantidad > producto.stockActual) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.titulo}": ` +
              `disponible=${producto.stockActual}, solicitado=${dto.cantidad}`,
          );
        }
        await tx.carritoItem.create({
          data: {
            idCarrito: carrito.id,
            idProducto: dto.idProducto,
            cantidad: dto.cantidad,
            // Snapshot del precio actual — queda fijo para este item
            precioUnitarioSnapshot: producto.precioVenta,
          },
        });
      }

      // Devolver carrito completo con items actualizados
      return tx.carrito.findUniqueOrThrow({
        where: { id: carrito.id },
        include: carritoInclude,
      });
    });

    return this.serializarCarrito(carritoFinal);
  }

  // ── PATCH /carrito/items/:id ──────────────────────────────────────────────
  // Actualiza la cantidad de un item del carrito activo del cliente.
  // Verifica que el item pertenezca al carrito activo de este cliente.
  async updateItem(
    idUsuario: number,
    idCarritoItem: number,
    dto: UpdateCarritoItemDto,
  ) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    // Buscar item verificando que pertenece al carrito activo de este cliente
    const item = await this.prisma.carritoItem.findFirst({
      where: {
        id: idCarritoItem,
        carrito: { idCliente, estado: 'activo' },
      },
      include: { producto: { select: productoSelect } },
    });
    if (!item) {
      throw new NotFoundException(
        'Item no encontrado en tu carrito activo',
      );
    }

    // Validar stock para la nueva cantidad
    if (dto.cantidad > item.producto.stockActual) {
      throw new BadRequestException(
        `Stock insuficiente para "${item.producto.titulo}": ` +
          `disponible=${item.producto.stockActual}, solicitado=${dto.cantidad}`,
      );
    }

    const actualizado = await this.prisma.carritoItem.update({
      where: { id: idCarritoItem },
      data: { cantidad: dto.cantidad },
      include: { producto: { select: productoSelect } },
    });

    const precioSnapshot = Number(actualizado.precioUnitarioSnapshot);
    const subtotal =
      Math.round(actualizado.cantidad * precioSnapshot * 100) / 100;

    return {
      idCarritoItem: actualizado.id,
      idProducto: actualizado.producto.id,
      titulo: actualizado.producto.titulo,
      estadoProducto: actualizado.producto.estado,
      stockActual: actualizado.producto.stockActual,
      cantidad: actualizado.cantidad,
      precioUnitarioSnapshot: precioSnapshot,
      subtotal,
    };
  }

  // ── DELETE /carrito/items/:id ─────────────────────────────────────────────
  // Elimina un item del carrito activo del cliente.
  // Verifica que el item pertenezca al carrito activo de este cliente.
  async removeItem(idUsuario: number, idCarritoItem: number) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    const item = await this.prisma.carritoItem.findFirst({
      where: {
        id: idCarritoItem,
        carrito: { idCliente, estado: 'activo' },
      },
    });
    if (!item) {
      throw new NotFoundException(
        'Item no encontrado en tu carrito activo',
      );
    }

    await this.prisma.carritoItem.delete({ where: { id: idCarritoItem } });

    return { message: 'Item eliminado del carrito' };
  }

  // ── DELETE /carrito ───────────────────────────────────────────────────────
  // Vacía y cancela el carrito activo del cliente.
  // Decisión: marca el carrito como 'cancelado' (preserva registro histórico)
  // y elimina los items con deleteMany explícito.
  // No se usa CASCADE automático para mantener control explícito de la operación.
  async cancelarCarrito(idUsuario: number) {
    const idCliente = await this.resolveIdCliente(idUsuario);

    const carrito = await this.prisma.carrito.findFirst({
      where: { idCliente, estado: 'activo' },
    });
    if (!carrito) {
      throw new NotFoundException('No tienes un carrito activo para cancelar');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Eliminar todos los items del carrito
      await tx.carritoItem.deleteMany({ where: { idCarrito: carrito.id } });
      // 2. Marcar carrito como cancelado (conserva el registro para historial)
      await tx.carrito.update({
        where: { id: carrito.id },
        data: { estado: 'cancelado' },
      });
    });

    return {
      message: 'Carrito cancelado exitosamente',
      idCarrito: carrito.id,
    };
  }
}
