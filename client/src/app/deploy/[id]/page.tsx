"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import Tooltip from "@/components/Tooltip";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ConfirmModal";
import { DeployStatus } from "@/types/deploy";
import useGetDeploy from "@/apis/deploy/useGetDeploy";
import useGetWebhooks from "@/apis/webhook/useGetWebhooks";
import useCreateWebhook from "@/apis/webhook/useCreateWebhook";
import useDeleteWebhook from "@/apis/webhook/useDeleteWebhook";
import useDeleteDeploy from "@/apis/deploy/useDeleteDeploy";
import useThrottle from "@/hooks/useThrottle";
import useStatusColor from "@/hooks/useStatusColor";
import { getStatusTooptip } from "@/utils/getStatusTooltip";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaCodeBranch, FaCodeCommit } from "react-icons/fa6";
import { IoChevronBack } from "react-icons/io5";

export default function DeployDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deployId = params.id;

  const { data } = useGetDeploy(Number(deployId));
  const { data: webhooksData } = useGetWebhooks(
    data?.repositoryOwner || "",
    data?.repositoryName || ""
  );
  const { mutate: createWebhook } = useCreateWebhook();
  const { mutate: deleteWebhook } = useDeleteWebhook();
  const { mutate: deleteDeploy } = useDeleteDeploy();

  const [deleteModal, setDeleteModal] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [isWebhookLoading, setIsWebhookLoading] = useState(false); // 웹훅 생성,삭제 중 실행 막기

  // 웹훅 목록을 기반으로 payloadURL과 일치하는 웹훅을 찾아서 자동업데이트 버튼 상태 설정
  useEffect(() => {
    if (webhooksData && data?.payloadURL) {
      const hasMatchingWebhook = webhooksData.some(
        (webhook) => webhook.config.url === data.payloadURL
      );
      setIsToggled(hasMatchingWebhook);
    }
  }, [webhooksData, data]);

  // 웹훅 생성, 삭제 토글 처리
  const handleWebhookToggle = () => {
    if (isWebhookLoading) return; // 이미 요청 실행중이면 함수 실행 중지
    // 웹훅 삭제
    if (isToggled) {
      const webhookToDelete = webhooksData?.find(
        (webhook) => webhook.config.url === data?.payloadURL
      );
      if (webhookToDelete) {
        deleteWebhook(
          {
            owner: data?.repositoryOwner || "",
            repo: data?.repositoryName || "",
            hook_id: webhookToDelete.id,
          },
          {
            onSuccess: () => {
              toast.success("웹훅이 성공적으로 삭제되었습니다.");
              setIsToggled(false);
              setIsWebhookLoading(false);
            },
            onError: () => {
              setIsWebhookLoading(false);
              toast.error("웹훅 삭제에 실패했습니다.");
            },
          }
        );
      }
    } else {
      // 웹훅 생성
      createWebhook(
        {
          owner: data?.repositoryOwner || "",
          repo: data?.repositoryName || "",
          webhookUrl: data?.payloadURL || "",
        },
        {
          onSuccess: () => {
            setIsToggled(true);
            setIsWebhookLoading(false);
          },
          onError: () => {
            setIsWebhookLoading(false);
          },
        }
      );
    }
  };

  // deploy 삭제
  const handleDeleteConfirm = useThrottle(() => {
    console.log("클릭!");
    deleteDeploy(Number(data?.deploymentId), {
      onSuccess: () => {
        if (isToggled) {
          handleWebhookToggle();
        }
        router.push(`/project/${data?.projectId}`);
      },
    });
  }, 3000);

  // 도메인 처리
  const formatDomain = (serviceType?: string, detailDomainName?: string) => {
    if (!serviceType || !detailDomainName) return "";
    return `${detailDomainName}.ttalkak.com`;
  };
  // status 아이콘 색 처리
  const statusColor = useStatusColor(data?.status as DeployStatus);

  // 포멧된 도메인주소
  const formattedDomain = formatDomain(
    data?.serviceType,
    data?.hostingResponse?.detailDomainName
  );

  if (!data) {
    return null;
  }

  const sortedVersions = [...data.versions].sort(
    (a, b) => b.version - a.version
  );
  const previousVersions = sortedVersions.slice(1);

  return (
    <div>
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoChevronBack
            onClick={() => router.back()}
            className="w-9 h-9 hover:scale-110 cursor-pointer"
          />
          <h1 className="text-3xl font-bold">배포</h1>
        </div>
        <Button
          label="삭제"
          onClick={() => setDeleteModal(true)}
          primary
        ></Button>
      </div>
      <div className="border rounded-lg shadow-sm p-6">
        {data.status === DeployStatus.RUNNING && (
          <iframe
            src={`https://${formattedDomain}`}
            title="Website Preview"
            className="w-[100%] h-[400px] mb-6"
          />
        )}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-600 mb-3">상태</p>
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${statusColor}`} />
              <span className="font-semibold">{data.status}</span>
              <Tooltip
                content={getStatusTooptip(data.statusMessage, "프로젝트")}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-gray-600">저장소</p>
            <Link
              href={data?.repositoryUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-all duration-200 flex items-center gap-2"
            >
              <FaExternalLinkAlt className="w-5 h-4" />
              <p className="font-medium">{data?.repositoryName}</p>
            </Link>
            <div className="flex items-center gap-2">
              <FaCodeBranch className="w-5 h-4" />
              <p className="font-medium">{data?.branch}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-1">도메인</p>
            <Link
              href={`https://${formattedDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-all duration-200 flex items-center gap-2"
            >
              <p className="font-medium">{formattedDomain}</p>
              <FaExternalLinkAlt className="w-5 h-4" />
            </Link>
          </div>

          <div>
            <p className="text-gray-600 mb-1">최근 커밋 메시지</p>
            <div className="flex gap-2">
              <FaCodeCommit className="w-5 h-5" />
              <p className="font-medium max-w-[400px] truncate flex gap-1">
                {data?.versions?.[0]?.repositoryLastCommitMessage} by{" "}
                {data?.versions?.[0]?.repositoryLastCommitUserName}
                {data?.versions?.[0]?.repositoryLastCommitUserProfile && (
                  <Image
                    src={data.versions[0].repositoryLastCommitUserProfile}
                    alt={`${data.versions[0].repositoryLastCommitUserName}'s profile`}
                    width={20}
                    height={20}
                    className="inline-block rounded-full"
                  />
                )}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-1">서비스 타입</p>
            <p className="font-medium">{data?.serviceType || "FrontEnd"}</p>
          </div>

          <div>
            <p className="text-gray-600 mb-1">자동 업데이트</p>
            <div>
              <div
                className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer ${
                  isToggled ? "bg-green-400" : "bg-gray-300"
                }`}
                onClick={handleWebhookToggle}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${
                    isToggled ? "translate-x-8" : ""
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {previousVersions.length > 0 && (
        <div className="border rounded-lg shadow-sm px-6 pt-6 mt-3">
          <h2 className="text-xl font-semibold mb-4">버전내역</h2>
          {previousVersions.map((version) => (
            <div
              key={version.version}
              className="flex items-center mb-4 pb-4 border-b last:border-b-0"
            >
              <span className="font-medium w-24 flex-shrink-0">
                Version: {version.version}
              </span>
              <div className="flex items-center justify-center flex-grow mx-4">
                <FaCodeCommit className="w-4 h-4 flex-shrink-0 mr-2" />
                <p className="font-medium truncate">
                  커밋 메시지 : {version.repositoryLastCommitMessage}
                </p>
              </div>
              <span className="text-sm text-gray-500 flex items-center w-36 justify-end flex-shrink-0">
                by {version.repositoryLastCommitUserName}
                {version.repositoryLastCommitUserProfile && (
                  <Image
                    src={version.repositoryLastCommitUserProfile}
                    alt={`${version.repositoryLastCommitUserName}'s profile`}
                    width={20}
                    height={20}
                    className="inline-block rounded-full ml-2"
                  />
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        message="삭제하시겠습니까?"
      />
    </div>
  );
}
