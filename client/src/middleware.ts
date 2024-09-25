import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 보호된 경로 정의
  const protectedPaths = [
    "/projects",
    "/deploy",
    "/dashboard",
    "/usage",
    "/activity",
    "/mypage",
  ];

  // 현재 경로가 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // 쿠키 확인
    const isLoggedIn = request.cookies.get("isLogin")?.value === "true";

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 인증된 사용자거나 보호되지 않은 경로면 요청을 계속 진행
  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
