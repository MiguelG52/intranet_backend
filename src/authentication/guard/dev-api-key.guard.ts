import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class DevApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('DEV_API_KEY');

    // Si no hay API Key configurada en el servidor, permitimos el acceso (o bloqueamos segun preferencia, asumimos proteccion activa solo si hay clave)
    if (!validApiKey) {
        return true; 
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException(' valida requerida para acceder a entorno de pruebas');
    }

    return true;
  }
}
