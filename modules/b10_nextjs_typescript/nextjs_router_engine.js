// ============================================================================
// B10 / DEV-FE-010: NEXT.JS (APP ROUTER) + TYPESCRIPT ENGINE SIMULATOR
// Middleware Auth Guard, RSC vs Client Component Pipeline, SSR/SSG/ISR & Server Actions
// ============================================================================

/**
 * 1. Next.js Middleware Auth Guard Simulator (`middleware.ts`)
 * Kiểm tra trạng thái xác thực & chấp nhận chính sách trước khi cho phép vào trang Bài tập (B4 - B9)
 */
export class NextAuthMiddleware {
  constructor(config = {}) {
    this.protectedRoutes = config.protectedRoutes || ['/dashboard', '/lessons'];
    this.authRoutes = config.authRoutes || ['/login', '/register'];
    this.logs = [];
  }

  /**
   * Mô phỏng hàm `middleware(request: NextRequest): NextResponse`
   */
  execute(request) {
    const { pathname, token, policyAccepted } = request;
    const timestamp = new Date().toLocaleTimeString('vi-VN');

    const isProtected = this.protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = this.authRoutes.some(route => pathname.startsWith(route));

    // Nếu truy cập route bảo vệ (B4-B9 Dashboard) mà chưa có token hoặc chưa đồng ý Policy
    if (isProtected && (!token || !policyAccepted)) {
      const redirectUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}&reason=${!token ? 'unauthenticated' : 'policy_required'}`;
      const entry = {
        timestamp,
        pathname,
        status: 307,
        action: 'NextResponse.redirect',
        destination: redirectUrl,
        message: !token
          ? 'Chặn truy cập: Chưa đăng nhập -> Redirect về /login'
          : 'Chặn truy cập: Chưa chấp nhận Chính sách (Policy) -> Redirect về /login'
      };
      this.logs.unshift(entry);
      return entry;
    }

    // Nếu đã đăng nhập mà truy cập lại /login hoặc /register -> Redirect vào /dashboard (Bài tập 4-9)
    if (isAuthRoute && token && policyAccepted) {
      const entry = {
        timestamp,
        pathname,
        status: 307,
        action: 'NextResponse.redirect',
        destination: '/dashboard#b4-b9-exercises',
        message: 'Đã có phiên đăng nhập hợp lệ -> Redirect thẳng vào Dashboard Bài tập B4-B9'
      };
      this.logs.unshift(entry);
      return entry;
    }

    const entry = {
      timestamp,
      pathname,
      status: 200,
      action: 'NextResponse.next',
      destination: pathname,
      message: 'Cho phép đi tiếp (Authorized & Policy Verified)'
    };
    this.logs.unshift(entry);
    return entry;
  }

  getLogs() {
    return this.logs.slice(0, 10);
  }
}

/**
 * 2. Next.js Rendering Strategies Simulator (SSR, SSG, ISR, RSC Streaming)
 */
export async function simulateNextRenderingStrategy(strategy = 'RSC') {
  await new Promise(resolve => setTimeout(resolve, 250));

  const strategies = {
    SSR: {
      name: 'Server-Side Rendering (Dynamic Rendering)',
      directive: "export const dynamic = 'force-dynamic'",
      ttfbMs: 145,
      clientJsKb: 42.5,
      seoReady: true,
      description: 'Render HTML mới trên Server ở mỗi request. Phù hợp trang Dashboard cá nhân hóa theo Cookie/Auth.'
    },
    SSG: {
      name: 'Static Site Generation (Prerendered)',
      directive: 'generateStaticParams()',
      ttfbMs: 18,
      clientJsKb: 38.0,
      seoReady: true,
      description: 'Build sẵn HTML tĩnh lúc compile time (npm run build). Phục vụ tức thì từ CDN (18ms).'
    },
    ISR: {
      name: 'Incremental Static Regeneration',
      directive: 'export const revalidate = 60',
      ttfbMs: 22,
      clientJsKb: 38.0,
      seoReady: true,
      description: 'Trả bản cache tĩnh ngay lập tức và tự động re-generate ngầm trên Server sau mỗi 60 giây.'
    },
    RSC: {
      name: 'React Server Components + Streaming Suspense',
      directive: 'Async Server Component (Mặc định trong App Router)',
      ttfbMs: 35,
      clientJsKb: 14.2,
      seoReady: true,
      description: 'Fetch dữ liệu trực tiếp trên Server với 0kB JS gửi xuống trình duyệt cho phần tĩnh, chỉ hydrate các Client Component ("use client").'
    }
  };

  return strategies[strategy] || strategies.RSC;
}

/**
 * 3. Server Action Simulator (`'use server'`) với TypeScript ActionState
 */
export async function executeServerAction(formDataObj) {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!formDataObj.email || !formDataObj.email.includes('@')) {
    return {
      success: false,
      errorCode: 'INVALID_EMAIL',
      message: 'Email không hợp lệ từ Server Action validation.',
      timestamp: Date.now()
    };
  }

  return {
    success: true,
    data: {
      userId: 'usr_' + Math.random().toString(36).substring(2, 8),
      email: formDataObj.email,
      role: formDataObj.role || 'INTERN',
      renderedBy: 'Next.js 15 App Router Server Action'
    },
    message: 'Server Action thực thi thành công & đã gọi revalidatePath("/dashboard")!',
    timestamp: Date.now()
  };
}

export const nextAuthMiddleware = new NextAuthMiddleware();

