"use client";
import Image from "next/image";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthStore from "@/store/useAuthStore";
import getUserInfo from "@/apis/user/useGetUserInfo";
import getValidation from "@/apis/user/useGetValidation";

export default function CallbackPage() {
  const router = useRouter();
  const { setAccessToken, setUserInfo, setValidation } = useAuthStore();

  const fetchUserInfoAndSetState = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");

    if (accessToken) {
      setAccessToken(accessToken);

      try {
        // UserInfo 가져오기
        const userInfoResponse = await getUserInfo();
        const userInfo = userInfoResponse.data;
        setUserInfo(userInfo);

        // Validation 가져오기
        // const validationResponse = await getValidation();
        // const validationInfo = validationResponse.data;
        setValidation({
          hasKey: true,
          hasContract: true,
          hasAdmin: true
        });

        router.push("/");
        toast.success("로그인에 성공했습니다.");
      } catch (error) {
        toast.error("로그인에 실패했습니다.");
        await useAuthStore.getState().logout().catch(console.error);
        router.push("/login");
      }
    } else {
      console.error("url에서 accessToken 찾을 수 없음");
      router.push("/login");
    }
  }, [router, setAccessToken, setUserInfo, setValidation]);

  useEffect(() => {
    fetchUserInfoAndSetState();
  }, [fetchUserInfoAndSetState]);
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-268px)]">
      <div className="flex flex-col items-center">
        <Image src="/logo.png" alt="Logo" width={128} height={128} />
        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-2">
          로그인 중
        </h2>
      </div>
    </div>
  );
}
