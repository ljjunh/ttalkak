import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Project } from "@/types/project";
import client from "@/apis/core/client";

const getProject = async (projectId: number): Promise<Project> => {
  const response = await client.get<Project>({
    url: `/project/${projectId}`,
  });
  return response.data;
};

const useGetProjectToLog = (
  projectId: number,
  enabled: boolean = true
): UseQueryResult<Project, Error> => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled,
  });
};

export default useGetProjectToLog;
