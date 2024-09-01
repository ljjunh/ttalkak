"use client";

import { useState, useEffect } from "react";
import { routes } from "@/constants/routeURL";
import NavLink from "@/components/NavLink";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";

const navItems = [
  { name: "개요", path: routes.overview },
  { name: "배포", path: routes.deploy },
  { name: "사용량", path: routes.usage },
  { name: "활동내역", path: routes.activity },
  { name: "가이드", path: routes.guide },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-7 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-24">
            <div className="flex items-center gap-2">
              <Image src="/click.png" alt="로고" width={23} height={23} />
              <Link href={routes.home} className="text-xl font-bold">
                딸깍
              </Link>
            </div>
            <div className="hidden lg:flex space-x-10">
              {navItems.map((item) => (
                <NavLink key={item.name} href={item.path}>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden lg:block bg-black px-3 py-1 rounded-md font-bold">
            <Link href={routes.login} className="text-white">
              로그인
            </Link>
          </div>
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-20 transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-grow">
            {navItems.map((item) => (
              <NavLink
                className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                key={item.name}
                href={item.path}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
          <div className="p-4">
            <div className="bg-black px-3 py-3 rounded-md font-bold text-center cursor-pointer">
              <Link href={routes.login} className="text-white">
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </nav>
  );
}