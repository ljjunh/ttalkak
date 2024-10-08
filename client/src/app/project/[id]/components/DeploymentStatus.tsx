import Link from "next/link";
import Image from "next/image";
import { Deployment } from "@/types/project";
import { DeployCommand, ServiceType, DeployStatus } from "@/types/deploy";
import Tooltip from "@/components/Tooltip";
import useModifyDeployStatus from "@/apis/deploy/useModifyDeployStatus";
import useThrottle from "@/hooks/useThrottle";
import useStatusColor from "@/hooks/useStatusColor";
import { getStatusTooptip } from "@/utils/getStatusTooltip";
import { FaPlay } from "react-icons/fa6";
import { VscDebugRestart } from "react-icons/vsc";
import { FaStop } from "react-icons/fa";

interface DeploymentStatusProps {
  type: ServiceType;
  deploy: Deployment | null;
  projectId: number;
}

export default function DeploymentStatus({
  type,
  deploy,
  projectId,
}: DeploymentStatusProps) {
  const { mutate: modifyDeployStatus } = useModifyDeployStatus();
  const statusColor = useStatusColor(deploy?.status as DeployStatus);

  const throttledModifyDeployStatus = useThrottle(
    (deploymentId: string, command: DeployCommand) => {
      modifyDeployStatus({
        deploymentId,
        command,
      });
    },
    5000
  );

  const handleButtonClick =
    (command: DeployCommand) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (deploy?.deploymentId) {
        throttledModifyDeployStatus(String(deploy.deploymentId), command);
      }
    };

  if (deploy) {
    return (
      <Link
        href={`/deploy/${deploy.deploymentId}`}
        className="flex flex-col gap-4 border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow duration-300 ease-in-out"
      >
        <h3 className="font-semibold text-lg">{type}</h3>
        <p className="text-md">{deploy.repositoryName}</p>
        <div className="flex items-center mb-3">
          <div
            className={`inline-block w-3 h-3 rounded-full mr-2 ${statusColor}`}
          />
          <div className="text-md">{deploy.status}</div>
          <Tooltip
            content={getStatusTooptip(deploy.statusMessage, "프로젝트")}
            spanClassName="ml-1"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center max-w-[60%]">
            <Image
              src={deploy.repositoryLastCommitUserProfile}
              alt={`${deploy.repositoryLastCommitUserName}'s profile`}
              width={26}
              height={26}
              className="inline-block rounded-full mr-2 flex-shrink-0"
            />
            <span className="text-sm text-gray-500 truncate">
              {deploy.repositoryLastCommitUserName} -{" "}
              {deploy.repositoryLastCommitMessage}
            </span>
          </div>

          <div className="flex gap-2">
            {deploy.status === DeployStatus.STOPPED && (
              <button
                onClick={handleButtonClick(DeployCommand.START)}
                className="border flex items-center gap-1 px-2 py-1 shadow-md rounded-full cursor-pointer hover:scale-110 duration-300 ease-in-out transform"
              >
                <FaPlay color="#3eb127" className="w-3 h-3" />
                <span className="text-xs">start</span>
              </button>
            )}
            {deploy.status === DeployStatus.RUNNING && (
              <>
                <button
                  onClick={handleButtonClick(DeployCommand.RESTART)}
                  className="border flex items-center gap-1 px-2 py-1 shadow-md rounded-full cursor-pointer hover:scale-110 duration-300 ease-in-out transform"
                >
                  <VscDebugRestart color="#7A7A7A" className="w-3 h-3" />
                  <span className="text-xs">restart</span>
                </button>
                <button
                  onClick={handleButtonClick(DeployCommand.STOP)}
                  className="border flex items-center gap-1 px-2 py-1 shadow-md rounded-full cursor-pointer hover:scale-110 duration-300 ease-in-out transform"
                >
                  <FaStop color="#d03939" className="w-3 h-3" />
                  <span className="text-xs">stop</span>
                </button>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }
  return (
    <div className="flex flex-col gap-6 border rounded-lg p-6">
      <h3 className="font-semibold text-lg">{type}</h3>
      <p className="text-md">배포된 서버가 없습니다.</p>
      <div className="flex justify-end">
        <Link
          href={`/deploy/create/${type.toLowerCase()}?projectId=${projectId}`}
          className="font-semibold w-24 bg-black text-center text-white px-4 py-2 rounded-lg text-md"
        >
          배포하기
        </Link>
      </div>
    </div>
  );
}
