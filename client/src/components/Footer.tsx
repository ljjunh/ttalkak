import Link from "next/link";
import Image from "next/image";
import { IoLogoGithub } from "react-icons/io";

export default function Footer() {
  return (
    <footer className="bg-[#f2f2f2] text-[#5e5e5e] mt-auto w-full text-sm relative z-[-1]">
      <div className="px-10">
        <div className="py-4 flex flex-col md:flex-row items-start justify-between">
          <div>
            Ttalkak
            <span className="px-1 text-[#c2c2c2]">|</span>
            <span className="text-xs">(주)</span>Jun Company
            <span className="ml-12">
              문의 :{" "}
              <Link
                href="mailto: sunsuking@gmail.com"
                className="hover:text-black"
              >
                sunsuking@gmail.com
              </Link>
            </span>
          </div>
          <div className="flex">
            <div className="flex">
              <Link href="/guide" className="hover:text-black">
                이용약관
              </Link>
              <span className="px-5 text-[#c2c2c2]">|</span>
              <Link href="/mypage" className="hover:text-black">
                결제내역
              </Link>
              <span className="px-5 text-[#c2c2c2]">|</span>
              <Link href="/guide/desktopinfo" className="hover:text-black">
                앱 다운로드
              </Link>
            </div>
            <span className="ml-16 flex items-center">
              <Image
                src="/favicon.png"
                alt="딸깍 아이콘"
                width={16}
                height={16}
                className="opacity-50 mr-2.5 z-[-2]"
              />
              <IoLogoGithub className="mr-2" size={18} />
              Ttalkak is always with Github.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
