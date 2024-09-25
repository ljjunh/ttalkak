import {
  useSuspenseQuery,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { Project } from "@/types/project";
import client from "@/apis/core/client";

const getProject = async (projectId: number): Promise<Project> => {
  const response = await client.get<Project>({
    url: `/project/${projectId}`,
  });
  return response.data;
};

const checkDeploymentStatus = (project: Project | null | undefined) => {
  return (
    project?.deployments?.some(
      (deployment) => deployment.status === "PENDING"
    ) ?? false
  );
};

const useGetProject = (
  projectId: number
): UseSuspenseQueryResult<Project, Error> => {
  return useSuspenseQuery({
    queryKey: ["project", projectId] as const,
    queryFn: () => getProject(projectId),
    refetchInterval: (query) => {
      const project = query.state.data;
      return checkDeploymentStatus(project) ? 5000 : false;
    },
  });
};

export default useGetProject;
