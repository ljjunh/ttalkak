"use client";

import { useEffect } from "react";
import { ErrorFallBackProps } from "@/types/errorType";

export default function GetProjectsErrorFallBack({
  error,
  reset,
}: ErrorFallBackProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>프로젝트 목록을 불러올 수 없습니다</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
