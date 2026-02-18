import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';

const APP_DOMAINS = new Set([
    'localhost',
    '127.0.0.1',
    'up.railway.app',
]);

function extractSlug(host: string): string | null {
    const hostname = host.split(':')[0];

    for (const domain of APP_DOMAINS) {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
            return null;
        }
    }

    const parts = hostname.split('.');
    if (parts.length < 3) return null;

    return parts[0];
}

export const subdomainSeoMiddleware = (indexHtmlPath: string) => {
    let cachedHtml: string | null = null;

    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/uploads')) {
            return next();
        }

        const slug = extractSlug(req.headers.host || '');
        if (!slug) return next();

        try {
            const landing = await prisma.landingPage.findUnique({
                where: { slug },
                select: {
                    enabled: true,
                    headline: true,
                    seo: true,
                    logoUrl: true,
                    heroImageUrl: true,
                    tenant: { select: { name: true } },
                },
            });

            if (!landing || !landing.enabled) return next();

            if (!cachedHtml) {
                cachedHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
            }

            const seo = (landing.seo as any) || {};
            const title = seo.title || landing.headline || landing.tenant.name;
            const description = seo.description || landing.headline || '';
            const ogImage = seo.ogImage || landing.heroImageUrl || landing.logoUrl || '';

            let html = cachedHtml;
            html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);

            const metaTags = [
                `<meta name="description" content="${escapeHtml(description)}" />`,
                `<meta property="og:title" content="${escapeHtml(title)}" />`,
                `<meta property="og:description" content="${escapeHtml(description)}" />`,
                ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : '',
                `<meta property="og:type" content="website" />`,
                `<meta name="twitter:card" content="summary_large_image" />`,
            ].filter(Boolean).join('\n    ');

            html = html.replace('</head>', `    ${metaTags}\n  </head>`);

            res.set('Cache-Control', 'public, max-age=300');
            res.send(html);
        } catch {
            next();
        }
    };
};

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
