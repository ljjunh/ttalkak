import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import webhookClient from "@/apis/core/webhookClient";

interface DeleteWebhookParams {
  owner: string;
  repo: string;
  hook_id: number;
}

const deleteWebhook = async ({ owner, repo, hook_id }: DeleteWebhookParams) => {
  try {
    await webhookClient.repos.deleteWebhook({ owner, repo, hook_id });
  } catch (error) {
    throw new Error("웹훅 삭제에 실패했습니다.");
  }
};

const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWebhook,
    onSuccess: (_, variables) => {
      toast.success("웹훅이 성공적으로 삭제되었습니다.");
      queryClient.invalidateQueries({
        queryKey: ["webhooks", variables.owner, variables.repo],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export default useDeleteWebhook;
