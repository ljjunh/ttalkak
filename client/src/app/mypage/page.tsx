"use client";

import Image from "next/image";
import React, { useState } from "react";
import EmailRegistrationModal from "@/components/EmailRegistrationModal";
import useAuthStore from "@/store/useAuthStore";

export default function MyPage() {
  const { userInfo } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const profile = "rounded-full w-16 h-16 mr-12 bg-gray-200";
  const thStyle = "font-normal w-20 text-left text-gray-400";

  return (
    <>
      <div className="w-full border rounded p-6">
        <h2 className="font-semibold text-lg mb-3.5">내 정보</h2>
        <div className="flex">
          {userInfo ? (
            <Image
              src={userInfo.profileImage}
              width={64}
              height={64}
              alt="profile_img"
              className={profile}
            />
          ) : (
            <div className={profile}></div>
          )}
          <div className="flex flex-col justify-around">
            <div className="flex items-center">
              <div className={thStyle}>닉네임</div>
              <div>{userInfo?.username}</div>
            </div>
            <div className="flex items-center">
              <div className={thStyle}>이메일</div>
              {userInfo && userInfo.emailVerified ? (
                <div>{userInfo.email}</div>
              ) : (
                <div className="flex items-center">
                  <div className="text-gray-700 text-sm">
                    등록된 이메일이 없습니다.
                  </div>
                  <button
                    className="bg-black text-white rounded px-3.5 py-0.5 text-sm ml-6"
                    onClick={openModal}
                  >
                    등록하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border rounded p-6 mt-8">
        <h2 className="font-semibold text-lg mb-3.5">청구 예정 금액</h2>
      </div>
      <EmailRegistrationModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
