import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnterpriseRoleMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        throw new UnauthorizedException('Missing authorization header');
      }

      // Soportar tanto "Token token" como "Bearer token"
      const token = authHeader.startsWith('Token ')
        ? authHeader.slice(6)
        : authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      if (!token) {
        throw new UnauthorizedException('Invalid authorization format');
      }

      const secret = this.configService.get<string>('JWT_SECRET') || 'enterprise-secret-key';
      const decoded = await this.jwtService.verifyAsync(token, { secret });

      if (!decoded || decoded.role !== 'enterprise') {
        throw new ForbiddenException('Forbidden: Enterprise access required');
      }

      (req as any).user = decoded;
      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        return res.status(403).json({
          statusCode: 403,
          message: 'Forbidden: Enterprise access required',
        });
      }
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid or expired token',
      });
    }
  }
}
