"use client";

import { Suspense, useEffect } from "react";
import ProjectContent from "@/app/projects/[id]/components/ProjectContent";
import SkeletonUI from "@/app/projects/[id]/components/SkeletonUI";
import useWeb3 from "@/hooks/useWeb3";
import axios from "axios";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { account, amount, connectWallet, signTransaction, signToSend, createSourceCodeToken } = useWeb3();

  useEffect(() => {
    connectWallet();
  }, [connectWallet])
  console.log(account);

  return (
    <Suspense fallback={<SkeletonUI />}>
      <button onClick={async () => {
        const transaction = await signTransaction("0x25D4BCE86828E434e99fc42B2C74fdEe98F5c91e");
        axios.post("http://127.0.0.1:5555/payment/signature", {
          amount: amount,
          deploymentId: 1,
          transaction: transaction,
          receipientId: 5,
        }, {
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI4IiwiYXV0aG9yaXRpZXMiOiJQUk9WSURFUiIsImlhdCI6MTcyNzIyOTAxNiwiZXhwIjoxNzI5MjI5MDE2fQ.CkDerOFNyp4IJzTRME5dHqaZrAieIEIdrCyv1KyyZB0`
          }
        })
      }}>test</button>

      <button  onClick={async () => signToSend()}>사인</button>

      <button onClick={async () => createSourceCodeToken(
        "project name",
        "20a99b048b84897fbf673d363ee3831adb891c0b",
        1,
        [
          "20a99b048b84897fbf673d363ee3831adb891c0b",
          "20a99b048b84897fbf673d363ee3831adb891c0b"
        ]
      )}>민팅 테스트</button>
      {/* <ProjectContent id={params.id} /> */}
    </Suspense>
  );
}
