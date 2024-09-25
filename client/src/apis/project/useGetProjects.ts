import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GetProjectsParams, GetProjectsResponse } from "@/types/project";
import client from "@/apis/core/client";

const getProjects = async (
  params: GetProjectsParams
): Promise<GetProjectsResponse> => {
  const response = await client.get<GetProjectsResponse>({
    url: "/project/search",
    params,
  });
  // 필요한 데이터만 추출해서 반환
  const { content, totalPages, totalElements } = response.data;
  return { content, totalPages, totalElements };
};

const useGetProjects = (
  params: GetProjectsParams
): UseQueryResult<GetProjectsResponse, Error> => {
  return useQuery({
    queryKey: ["projects", params] as const,
    queryFn: () => getProjects(params),
    throwOnError: true,
  });
};

export default useGetProjects;
