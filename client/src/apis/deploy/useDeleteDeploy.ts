import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import client from "@/apis/core/client";

const deleteDeploy = async (deploymentId: number): Promise<void> => {
  const response = await client.delete({
    url: `/deployment/${deploymentId}`,
  });

  if (!response.success) {
    throw new Error(response.message || "배포 삭제 실패");
  }
};

const useDeleteDeploy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDeploy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast.success("성공적으로 삭제되었습니다.");
    },
    onError: (error) => {
      toast.success(error.message);
    },
  });
};

export default useDeleteDeploy;
