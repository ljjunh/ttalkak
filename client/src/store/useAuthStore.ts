import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserInfo } from "@/types/userInfo";
import Cookies from "js-cookie";

interface AuthState {
  accessToken: string | null;
  userInfo: UserInfo | null;
  isLogin: boolean;
  setAccessToken: (token: string | null) => void;
  setUserInfo: (info: UserInfo | null) => void;
  logout: () => void;
}

// zustand 스토어 생성
const useAuthStore = create<AuthState>()(
  // 상태를 지속적으로 저장하기 위해 persist 미들웨어 사용
  persist(
    (set, get) => ({
      // 초기상태와 상태를 변경하는 함수들을 정의
      accessToken: null,
      userInfo: null,
      isLogin: false,
      setAccessToken: (token) => {
        set({ accessToken: token, isLogin: !!token });
        if (token) {
          Cookies.set("isLogin", "true", { sameSite: "strict" });
        } else {
          Cookies.remove("isLogin");
        }
      },
      setUserInfo: (info) => set({ userInfo: info }),
      logout: () => {
        set({
          accessToken: null,
          userInfo: null,
          isLogin: false,
        });
        Cookies.remove("isLogin");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        isLogin: state.isLogin,
        userInfo: state.userInfo,
      }),
    }
  )
);

export default useAuthStore;
