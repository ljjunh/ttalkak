import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GetDeployResponse } from "@/types/deploy";
import client from "@/apis/core/client";

const getDeploy = async (deployId: number): Promise<GetDeployResponse> => {
  const response = await client.get<GetDeployResponse>({
    url: `/deployment/${deployId}`,
  });

  return response.data;
};

const useGetDeploy = (
  deployId: number
): UseQueryResult<GetDeployResponse, Error> => {
  return useQuery({
    queryKey: ["deploy", deployId] as const,
    queryFn: () => getDeploy(deployId),
  });
};

export default useGetDeploy;
