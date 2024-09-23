"use client";

import { Suspense, useEffect } from "react";
import ProjectContent from "@/app/projects/[id]/components/ProjectContent";
import SkeletonUI from "@/app/projects/[id]/components/SkeletonUI";
import useWeb3 from "@/hooks/useWeb3";
import axios from "axios";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { account, amount, connectWallet, signTransaction } = useWeb3();

  useEffect(() => {
    connectWallet();
  }, [connectWallet])
  console.log(account);

  return (
    <Suspense fallback={<SkeletonUI />}>
      <button onClick={async () => {
        const transaction = await signTransaction("0x2Ec4c72bEdCdEa67776AF695B52386c264e6b0Dd");
        axios.post("http://127.0.0.1:5555/payment/signature", {
          amount: amount,
          deploymentId: 1,
          transaction: transaction,
          receipientId: 3,
        }, {
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3IiwiYXV0aG9yaXRpZXMiOiJQUk9WSURFUiIsImlhdCI6MTcyNjU3MTA0OSwiZXhwIjoxNzI2NTcxMTA5fQ.2VHBljonWGklhv4oAPuv7_yWfbX2Uipki3BUSorGoYM`
          }
        })
      }}>test</button>
      {/* <ProjectContent id={params.id} /> */}
    </Suspense>
  );
}
