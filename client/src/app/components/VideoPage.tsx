"use client";

import { useState, useEffect, useRef } from "react";
import { throttle } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import NavigationMenu from "@/app/components/NavigationMenu";
import VideoSection from "@/app/components/VideoSection";
import IntroSection from "@/app/components/IntroSection";

const videoSources = [
  "/videos/earth.mp4",
  "/videos/log.mp4",
  "/videos/pay.mp4",
  "/videos/block.mp4",
];

export const texts = [
  {
    title: "간편한 배포 서비스",
    subtitle: "클릭만으로 완성되는 배포 자동화",
    description:
      "이제 복잡한 배포 과정에서 벗어나세요. 우리 서비스는 클릭 몇 번으로 자동으로 모든 배포 단계를 처리하여, 신속하고 안정적인 배포 환경을 제공합니다. 간단한 설정만으로 복잡한 인프라 관리 없이도 배포를 완료할 수 있으며, 효율적인 배포 프로세스를 통해 시간과 리소스를 절약할 수 있습니다.",
  },
  {
    title: "AI 기반 실시간 로그 분석",
    subtitle: "비즈니스 성공을 위한 필수 도구",
    description:
      "AI 기반 실시간 로그 분석은 이제 단순한 데이터 관리 도구를 넘어 비즈니스 전략을 지원하는 핵심 기술로 자리 잡고 있습니다. 이 기술을 통해 기업은 더 나은 의사결정을 내리고, 운영 최적화와 비용 절감을 실현할 수 있습니다. AI가 제공하는 예리한 인사이트는 기업이 경쟁에서 한발 앞서나가는 데 필수적인 차별화된 경쟁력이 될 것입니다.",
  },
  {
    title: "최적의 사용, 정확한 결제",
    subtitle: "스마트한 결제 시스템의 결합",
    description:
      "사용자는 자신이 소비한 만큼만 요금을 지불하면서도, 자동 결제 설정을 통해 결제 과정에서 발생할 수 있는 번거로움을 없앨 수 있습니다. 이러한 스마트 결제 시스템은 서비스 운영에 있어 편리함과 경제성을 동시에 제공합니다.",
  },
  {
    title: "블록체인 기반 수익 창출",
    subtitle: "자원 공유로 얻는 디지털 보상",
    description:
      "유휴 자원을 공유해 소득을 창출하세요. 당신의 컴퓨터가 서버가 되어 블록체인 기반으로 디지털 코인을 얻을 수 있는 혁신적인 기회를 제공합니다",
  },
];

export default function VideoPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const totalSlides = videoSources.length + 1;

  useEffect(() => {
    const handleWheel = throttle((e: WheelEvent) => {
      if (!isScrolling.current) {
        isScrolling.current = true;
        if (e.deltaY > 0 && currentSlide < totalSlides - 1) {
          setCurrentSlide((prev) => prev + 1);
        } else if (e.deltaY < 0 && currentSlide > 0) {
          setCurrentSlide((prev) => prev - 1);
        }
        setTimeout(() => {
          isScrolling.current = false;
        }, 1000);
      }
    }, 100);

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentSlide, totalSlides]);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden">
      <div ref={containerRef} className="h-full">
        <AnimatePresence>
          {currentSlide === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute top-0 left-0 w-full h-full"
            >
              <IntroSection
                isActive={true}
                onNextSlide={() => setCurrentSlide(1)}
              />
            </motion.div>
          )}
          {videoSources.map(
            (src, index) =>
              currentSlide === index + 1 && (
                <motion.div
                  key={`video-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute top-0 left-0 w-full h-full"
                >
                  <VideoSection
                    videoSrc={src}
                    text={texts[index]}
                    isActive={true}
                    onScrollToTop={() => setCurrentSlide(0)}
                  />
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
      {currentSlide > 0 && (
        <NavigationMenu
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
      )}
    </div>
  );
}