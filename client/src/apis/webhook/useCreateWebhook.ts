import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import webhookClient from "@/apis/core/webhookClient";

interface CreateWebhookParams {
  owner: string;
  repo: string;
  webhookUrl: string;
}

const createWebhook = async ({
  owner,
  repo,
  webhookUrl,
}: CreateWebhookParams) => {
  try {
    const response = await webhookClient.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: "json",
      },
      events: ["push"],
    });
    return response.data;
  } catch (error) {
    throw new Error("웹훅 생성에 실패했습니다.");
  }
};

const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWebhook,
    onSuccess: (_, variables) => {
      toast.success("웹훅이 성공적으로 생성되었습니다.");
      queryClient.invalidateQueries({
        queryKey: ["webhooks", variables.owner, variables.repo],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export default useCreateWebhook;
