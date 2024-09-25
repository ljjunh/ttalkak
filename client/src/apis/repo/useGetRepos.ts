import { useQuery } from "@tanstack/react-query";
import { Repository } from "@/types/repo";
import useAuthStore from "@/store/useAuthStore";
import githubClient from "@/apis/core/githubClient";

const getRepos = async (githubApiKey: string): Promise<Repository[]> => {
  //응답 데이터가 Repository 객체의 배열이라고 명시
  const client = githubClient(githubApiKey);
  const response = await client.get<Repository[]>("/user/repos", {
    params: { type: "public", per_page: 100 },
  });
  return response.data;
};

const useGetRepos = () => {
  const githubApiKey = useAuthStore.getState().userInfo?.accessToken;

  return useQuery({
    queryKey: ["repos", githubApiKey] as const,
    queryFn: () => getRepos(githubApiKey || ""),
    enabled: !!githubApiKey, // API 키가 있을 때만 쿼리 실행
  });
};

export default useGetRepos;
