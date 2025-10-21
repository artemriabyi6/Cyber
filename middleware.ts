import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Додаткова логіка перевірки ролей
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Перевірка доступу до coach-dashboard
        if (req.nextUrl.pathname.startsWith('/coach-dashboard')) {
          return token?.role === 'coach'
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/coach-dashboard/:path*']
}