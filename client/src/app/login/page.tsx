"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = (): void => {
    setIsLoading(true);
    const redirectUri = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_REDIRECT_URI}/auth/callback`
    );
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/authorization/github?oauth_redirect_uri=${redirectUri}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="w-full max-w-md px-6">
        <div className="text-4xl font-bold text-center mb-5">딸깍 로그인</div>
        <div className="text-center text-[#414141] mb-10 text-lg slide-down">
          깃허브 계정으로 쉽고 빠르게 로그인하세요
        </div>
        <button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center font-semibold py-3 bg-black text-white rounded-md hover:bg-[#2b2b2b] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {isLoading ? "로그인 중" : <>GitHub로 계속하기</>}
        </button>
      </div>
    </div>
  );
}
