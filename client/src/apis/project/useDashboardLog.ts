import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { DeploymentLogParams, DeploymentLog } from "@/types/dashboard";
import client from "@/apis/core/client";

const dashboardLog = async (
  params: DeploymentLogParams
): Promise<DeploymentLog> => {
  const response = await client.get<DeploymentLog>({
    url: "/log/search",
    params,
  });

  console.log(params);

  // 필요한 데이터만 추출해서 반환
  const { content, methodCounts, statusCounts } = response.data;
  return { content, methodCounts, statusCounts };
};

const useDashboardLog = (
  params: DeploymentLogParams,
  enabled: boolean = true
): UseQueryResult<DeploymentLog, Error> => {
  return useQuery({
    queryKey: ["deploy", params] as const,
    queryFn: () => dashboardLog(params),
    enabled,
  });
};

export default useDashboardLog;
