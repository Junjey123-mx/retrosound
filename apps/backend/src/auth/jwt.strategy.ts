import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: number;
  correo: string;
  rol: string;
  idCliente: number | null;
  idEmpleado: number | null;
  idProveedor: number | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
      idCliente: payload.idCliente ?? null,
      idEmpleado: payload.idEmpleado ?? null,
      idProveedor: payload.idProveedor ?? null,
    };
  }
}
