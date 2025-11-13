import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
    private readonly logger = new Logger(ProxyMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.url.startsWith('/enterprise') || req.url === '/enterprise') {
                return createProxyMiddleware({
                    target: process.env.ENTERPRISE_SERVICE_URL || 'http://localhost:5001',
                    changeOrigin: true,
                    pathRewrite: { '^/enterprise': '' },
                })(req, res, (err) => this.handleError(err, res, 'Enterprise', next));
            }

            if (req.url.startsWith('/product') || req.url === '/product') {
                return createProxyMiddleware({
                    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002',
                    changeOrigin: true,
                    pathRewrite: { '^/product': '' },
                })(req, res, (err) => this.handleError(err, res, 'Product', next));
            }

            if (req.url.startsWith('/category') || req.url === '/category') {
                return createProxyMiddleware({
                    target: process.env.CATEGORY_SERVICE_URL || 'http://localhost:5003',
                    changeOrigin: true,
                    pathRewrite: { '^/category': '' },
                })(req, res, (err) => this.handleError(err, res, 'Category', next));
            }

            next();
        } catch (error) {
            this.logger.error(`Unexpected error in proxy middleware: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(500).json({
                statusCode: 500,
                message: 'Internal server error in gateway',
            });
        }
    }

    private handleError(error: any, res: Response, service: string, next: NextFunction): void {
        if (!error) {
            return next();
        }

        this.logger.error(`${service} service error: ${error.message}`);

        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                statusCode: 503,
                message: `${service} service is unavailable`,
            });
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
            res.status(504).json({
                statusCode: 504,
                message: `${service} service request timeout`,
            });
        } else {
            res.status(502).json({
                statusCode: 502,
                message: `Error connecting to ${service} service`,
            });
        }
    }
}
