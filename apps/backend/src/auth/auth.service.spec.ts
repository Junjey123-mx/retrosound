import * as bcrypt from 'bcrypt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from './auth.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const mockJwt = { sign: vi.fn().mockReturnValue('mock.jwt.token') };

const mockPrisma = {
  usuario: { findUnique: vi.fn(), create: vi.fn() },
  cliente: { create: vi.fn() },
  $transaction: vi.fn(),
};

const baseUsuario = {
  idUsuario: 1,
  correoUsuario: 'ana@test.com',
  contrasenaHash: 'HASH_SECRETO',
  rolUsuario: 'cliente',
  estadoUsuario: 'activo',
  idCliente: 1,
  idEmpleado: null,
  idProveedor: null,
  cliente: { nombreCliente: 'Ana', apellidoCliente: 'García' },
  empleado: null,
  proveedor: null,
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(mockPrisma as any, mockJwt as any);
  });

  describe('login', () => {
    it('devuelve access_token y user con credenciales válidas', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(baseUsuario);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ correo: 'ana@test.com', contrasena: 'secret' });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user.rol).toBe('cliente');
      expect(result.user.correo).toBe('ana@test.com');
    });

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ correo: 'noexiste@test.com', contrasena: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el usuario está inactivo', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        ...baseUsuario,
        estadoUsuario: 'inactivo',
      });

      await expect(
        service.login({ correo: 'ana@test.com', contrasena: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(baseUsuario);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ correo: 'ana@test.com', contrasena: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('no expone contrasenaHash en ninguna parte de la respuesta', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(baseUsuario);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({ correo: 'ana@test.com', contrasena: 'secret' });

      expect(JSON.stringify(result)).not.toContain('HASH_SECRETO');
      expect(JSON.stringify(result)).not.toContain('contrasenaHash');
    });
  });

  describe('register', () => {
    it('asigna rolUsuario = cliente sin importar el payload', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);

      const fakeTx = {
        cliente: {
          create: vi.fn().mockResolvedValue({
            idCliente: 10,
            nombreCliente: 'Bob',
            apellidoCliente: 'Lee',
          }),
        },
        usuario: {
          create: vi.fn().mockResolvedValue({
            idUsuario: 20,
            correoUsuario: 'bob@test.com',
            rolUsuario: 'cliente',
            estadoUsuario: 'activo',
            idCliente: 10,
            idEmpleado: null,
            idProveedor: null,
          }),
        },
      };

      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: typeof fakeTx) => Promise<unknown>) => cb(fakeTx),
      );

      const result = await service.register({
        nombre: 'Bob',
        apellido: 'Lee',
        correo: 'bob@test.com',
        contrasena: 'secret123',
      });

      expect(result.user.rol).toBe('cliente');
      expect(fakeTx.usuario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rolUsuario: 'cliente' }),
        }),
      );
    });

    it('lanza ConflictException si el correo ya existe (P2002)', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);

      const p2002 = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      mockPrisma.$transaction.mockRejectedValue(p2002);

      await expect(
        service.register({
          nombre: 'Bob',
          apellido: 'Lee',
          correo: 'bob@test.com',
          contrasena: 'secret123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
