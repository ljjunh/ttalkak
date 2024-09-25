"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthStore from "@/store/useAuthStore";
import getUserInfo from "@/apis/user/useGetUserInfo";

export default function CallbackPage() {
  const router = useRouter();
  const { setAccessToken, setUserInfo } = useAuthStore();

  const fetchUserInfoAndSetState = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");

    if (accessToken) {
      setAccessToken(accessToken);

      try {
        const response = await getUserInfo();
        const userInfo = response.data;
        setUserInfo(userInfo);
        console.log(response);

        router.push("/");
        toast.success("로그인에 성공했습니다.");
      } catch (error) {
        toast.success("로그인에 실패했습니다.");
        useAuthStore.getState().logout();
        router.push("/login");
      }
    } else {
      console.error("url에서 accessToken 찾을 수 없음");
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchUserInfoAndSetState();
  }, [router, setAccessToken, setUserInfo]);
  return <div>로그인중</div>;
}
