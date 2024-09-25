import {
  useQueryClient,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { PatchProjectParams } from "@/types/project";
import client from "@/apis/core/client";

const modifyProject = async ({
  projectId,
  data,
}: PatchProjectParams): Promise<void> => {
  const response = await client.patch({
    url: `project/${projectId}`,
    data,
  });
  if (!response.success) {
    throw new Error(response.message || "프로젝트 수정에 실패했습니다.");
  }
};

const useModifyProject = (): UseMutationResult<
  void,
  Error,
  PatchProjectParams,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modifyProject,
    onSuccess: (_, variables) => {
      toast.success("프로젝트가 성공적으로 수정되었습니다.");
      // 수정된 프로젝트와 관련된 쿼리들을 무효화
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export default useModifyProject;
