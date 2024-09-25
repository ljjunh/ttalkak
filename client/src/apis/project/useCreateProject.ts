import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CreateProjectParams } from "@/types/project";
import client from "@/apis/core/client";

const createProject = async (data: CreateProjectParams): Promise<void> => {
  const response = await client.post({
    url: "/project",
    data,
  });

  if (!response.success) throw new Error(response.message!!);
};

const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // 프로젝트 생성 성공 시 projects 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("프로젝트가 성공적으로 생성되었습니다.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export default useCreateProject;
