import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DeployCommand } from "@/types/deploy";
import client from "@/apis/core/client";

interface DeployStatusRequest {
  deploymentId: string;
  command: DeployCommand;
}

const modifyDeployStatus = async (data: DeployStatusRequest): Promise<void> => {
  const response = await client.post({
    url: "/deployment/command",
    data,
  });
  if (!response.success) {
    throw new Error(response.message!!);
  }
};

const useModifyDeployStatus = () => {
  return useMutation({
    mutationFn: modifyDeployStatus,
    onSuccess: () => {
      toast.success("요청에 성공했습니다.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export default useModifyDeployStatus;
