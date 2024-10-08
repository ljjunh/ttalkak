import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { DeploymentLogParams, DeploymentLog } from "@/types/dashboard";
import client from "@/apis/core/client";

const getLog = async (params: DeploymentLogParams): Promise<DeploymentLog> => {
  const response = await client.get<DeploymentLog>({
    url: "/log/search",
    params,
  });

  // 필요한 데이터만 추출해서 반환
  const { content, methodCounts, statusCounts } = response.data;
  return { content, methodCounts, statusCounts };
};

const useGetLog = (
  params: DeploymentLogParams,
  enabled: boolean = true
): UseQueryResult<DeploymentLog, Error> => {
  return useQuery({
    queryKey: ["log", params] as const,
    queryFn: () => getLog(params),
    enabled: enabled && params !== null && params.deploymentId !== 0,
  });
};

export default useGetLog;
