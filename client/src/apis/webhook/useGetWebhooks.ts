import { useQuery } from "@tanstack/react-query";
import webhookClient from "@/apis/core/webhookClient";

interface Webhook {
  id: number;
  config: {
    url: string;
  };
}

interface GetWebhooksParams {
  owner: string;
  repo: string;
}

const getWebhooks = async ({
  owner,
  repo,
}: GetWebhooksParams): Promise<Webhook[]> => {
  try {
    const response = await webhookClient.repos.listWebhooks({
      owner,
      repo,
    });
    return response.data as Webhook[];
  } catch (error: any) {
    if (error.state === 404) {
      return [];
    }
    throw new Error("웹훅 목록을 가져오는데 실패했습니다.");
  }
};

const useGetWebhooks = (owner: string, repo: string) => {
  return useQuery<Webhook[], Error>({
    queryKey: ["webhooks", owner, repo],
    queryFn: () => getWebhooks({ owner, repo }),
    enabled: !!owner && !!repo,
    staleTime: 0,
  });
};

export default useGetWebhooks;
