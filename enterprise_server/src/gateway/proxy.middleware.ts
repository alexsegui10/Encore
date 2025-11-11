import { Injectable, NestMiddleware } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (req.url.startsWith('/enterprise')) {
            return createProxyMiddleware({
                target: 'http://localhost:5001',
                changeOrigin: true,
                pathRewrite: { '^/enterprise': '' },
            })(req, res, next);
        }

        if (req.url.startsWith('/product')) {
            return createProxyMiddleware({
                target: 'http://localhost:5002',
                changeOrigin: true,
                pathRewrite: { '^/product': '' },
            })(req, res, next);
        }

        if (req.url.startsWith('/category')) {
            return createProxyMiddleware({
                target: 'http://localhost:5003',
                changeOrigin: true,
                pathRewrite: { '^/category': '' },
            })(req, res, next);
        }

        next();
    }
}
