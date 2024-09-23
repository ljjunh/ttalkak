"use client";

import useGetDeploy from "@/apis/deploy/useGetDeploy";
import { useParams } from "next/navigation";

export default function DeployDetailPage() {
  const params = useParams();
  const deployId = params.id;
  


  const { data } = useGetDeploy(Number(deployId));

  return (
    <div className="border">
      <h1>Deploy {deployId} 상세페이지</h1>
      <p>Deployment ID: {data?.deploymentId}</p>
      <p>Project ID: {data?.projectId}</p>
      <p>Status: {data?.status}</p>
      <p>PayloadURL : {data?.payloadURL}</p>
      <p>Service Type: {data?.serviceType}</p>
      <p>Repository: {data?.repositoryName}</p>
      <p>Repository URL: {data?.repositoryUrl}</p>
      <p>Branch: {data?.branch}</p>
      <p>Repository Owner: {data?.repositoryOwner}</p>
      <p>Framework: {data?.framework}</p>
      <h2>Hosting Information</h2>
      <p>Hosting ID: {data?.hostingResponse.hostingId}</p>
      <p>Domain Name: {data?.hostingResponse.detailDomainName}</p>
      <p>Hosting Port: {data?.hostingResponse.hostingPort}</p>
    </div>
  );
}
