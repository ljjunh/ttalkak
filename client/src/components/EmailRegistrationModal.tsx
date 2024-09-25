"use client";

import { useState, ChangeEvent, useEffect } from "react";
import client from "@/apis/core/client";
import { IoMdClose } from "react-icons/io";
import useAuthStore from "@/store/useAuthStore";

interface EmailRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailRegistrationModal({
  isOpen,
  onClose,
}: EmailRegistrationModalProps) {
  const { userInfo, setUserInfo } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  // 만료 시간 관리
  useEffect(() => {
    if (isSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSent, timeLeft]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  // 인증 메일 발송 요청
  const sendVerificationEmail = async () => {
    if (!email) return;

    const response = await client.post({
      url: "notification/email/code",
      data: { email, nickname: userInfo?.username },
    });

    if (!response.success) {
      throw new Error(response.message || "인증 메일 전송 실패");
    }

    console.log("인증 메일 전송");
    setIsSent(true);
    setTimeLeft(300);
  };

  // 발급 코드 확인 및 userInfo 업데이트
  const verifyCode = async () => {
    if (!userInfo || !userInfo.userId) {
      throw new Error("유저 정보가 없습니다.");
    }

    const response = await client.post({
      url: "notification/email/confirm",
      data: { userId: userInfo.userId, email, code: verificationCode },
    });

    if (!response.success) {
      throw new Error(response.message || "인증에 실패했습니다.");
    }

    // 이메일 인증 성공 시, zustand의 userInfo 업데이트
    const updatedUserInfo = {
      ...userInfo,
      email: email,
      emailVerified: true,
    };

    setUserInfo(updatedUserInfo); // userInfo 업데이트
    alert("이메일 인증에 성공했습니다.");
    setIsVerified(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl relative w-96">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <IoMdClose />
        </button>

        <h2 className="text-center text-xl mb-6">이메일 등록</h2>

        <form className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="example@gmail.com"
              disabled={isSent}
              className="border border-gray-300 px-4 py-2 w-full rounded-md"
            />
            <div
              onClick={sendVerificationEmail}
              className="bg-gray-200 py-2 w-32 rounded-md cursor-pointer flex justify-center"
            >
              인증하기
            </div>
          </div>

          <input
            type="text"
            value={verificationCode}
            onChange={handleCodeChange}
            placeholder="인증번호 6자리를 입력해주세요"
            className="border border-gray-300 px-4 py-2 w-full rounded-md"
          />

          <div
            onClick={verifyCode}
            className="bg-black text-white py-2 flex w-full justify-center rounded-md cursor-pointer"
          >
            완료하기
          </div>

          {isSent ? (
            <div className="text-gray-500 text-center text-red-400 text-sm">
              {Math.floor(timeLeft / 60)}분 {timeLeft % 60}초
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
