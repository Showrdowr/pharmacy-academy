import { NextRequest, NextResponse } from 'next/server';

function findNestedStaticPath(pathname: string, marker: '/assets/' | '/images/'): string | null {
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex > 0) {
        return pathname.slice(markerIndex);
    }
    return null;
}

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // Skip internal/static/API routes that should never be rewritten.
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/') ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml'
    ) {
        return NextResponse.next();
    }

    const nestedAssetsPath = findNestedStaticPath(pathname, '/assets/');
    if (nestedAssetsPath) {
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = nestedAssetsPath;
        rewriteUrl.search = search;
        return NextResponse.rewrite(rewriteUrl);
    }

    const nestedImagesPath = findNestedStaticPath(pathname, '/images/');
    if (nestedImagesPath) {
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = nestedImagesPath;
        rewriteUrl.search = search;
        return NextResponse.rewrite(rewriteUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};

