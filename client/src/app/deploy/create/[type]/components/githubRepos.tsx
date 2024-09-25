"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Repository, FileContent, Commit, DeployType } from "@/types/repo";
import useDeployStore from "@/store/useDeployStore";
import useAuthStore from "@/store/useAuthStore";
import Button from "@/components/Button";
import SearchBar from "@/app/deploy/create/[type]/components/SearchBar";
import RepoList from "@/app/deploy/create/[type]/components/RepoList";
import DirectoryNavigator from "@/app/deploy/create/[type]/components/DirectoryNavigator";
import FileList from "@/app/deploy/create/[type]/components/FileList";
import useGetRepos from "@/apis/repo/useGetRepos";
import { LiaGithubAlt } from "react-icons/lia";

export default function GitHubRepos() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const githubApiKey = useAuthStore((state) => state.userInfo?.accessToken);
  const { setGithubRepositoryRequest, setVersionRequest } = useDeployStore();

  const { data: repos } = useGetRepos();

  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([]); // 검색 필터링된 레포지토리 목록
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null); // 선택된 레포지토리
  const [currentPath, setCurrentPath] = useState<string>(""); // 현재 탐색 중인 경로
  const [repoContents, setRepoContents] = useState<FileContent[]>([]); // 현재 경로의 파일/폴더 목록
  const [fileContent, setFileContent] = useState<string | null>(null); // 선택된 파일의 내용
  const [commits, setCommits] = useState<Record<string, Commit>>({}); // 커밋정보
  const [branches, setBranches] = useState<string[]>([]); // 브랜치 목록
  const [selectedBranch, setSelectedBranch] = useState<string>(""); // 선택된 브랜치
  const [isFileSelected, setIsFileSelected] = useState(false); // 파일을 볼때 선택완료 버튼 disable
  const [isCommitLoading, setIsCommitLoading] = useState(false);

  // 검색어 변경시 레포지토리 필터링
  useEffect(() => {
    if (repos) {
      setFilteredRepos(
        repos.filter((repo) =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, repos]);

  useEffect(() => {
    if (repos && repos.length > 0 && !selectedRepo) {
      const initialRepo = repos[0];
      setSelectedRepo(initialRepo);
      fetchBranches(initialRepo);
    }
  }, [repos]);

  // 커밋 정보
  const fetchCommits = useCallback(
    async (repo: Repository, path: string) => {
      setIsCommitLoading(true);
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?path=${path}`,
          {
            headers: {
              Authorization: `Bearer ${githubApiKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch commit information");
        }

        const commitsData: Commit[] = await response.json();
        const latestCommit = commitsData[0];

        setCommits((prev) => ({
          ...prev,
          [path]: latestCommit,
        }));
      } catch (error) {
        console.error("Error fetching commit information:", error);
      } finally {
        setIsCommitLoading(false);
      }
    },
    [githubApiKey]
  );

  // 브랜치 목록 가져오기
  const fetchBranches = async (repo: Repository) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/branches`,
        {
          headers: {
            Authorization: `Bearer ${githubApiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch branches");
      }

      const branchesData = await response.json();
      const branchNames = branchesData.map(
        (branch: { name: string }) => branch.name
      );
      setBranches(branchNames);

      // 기본 브랜치 설정
      const defaultBranch = repo.default_branch || branchNames[0];
      setSelectedBranch(defaultBranch);

      // 기본 브랜치의 콘텐츠 가져오기
      await fetchRepoContents(repo, "", defaultBranch);
      // 루트 경로의 커밋 정보 가져오기
      await fetchCommits(repo, "");
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError("브랜치 목록 가져오기 실패");
    }
  };

  // 파일 내용 가져오기 함수
  const fetchFileContent = async (file: FileContent) => {
    setIsLoading(true);
    setIsFileSelected(true);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${selectedRepo!.full_name}/contents/${file.path}?ref=${selectedBranch}`,
        {
          headers: {
            Authorization: `Bearer ${githubApiKey}`,
            Accept: "application/vnd.github.v3.raw",
          },
        }
      );

      if (!response.ok) {
        throw new Error("파일 내용 가져오기 실패");
      }

      const content = await response.text();
      setFileContent(content);
      setCurrentPath(file.path);
    } catch (error) {
      setError("파일 내용 가져오기 실패");
      console.error("파일 내용 가져오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 레포지토리 내용 조회 함수
  const fetchRepoContents = useCallback(
    async (repo: Repository, path: string = "", branch: string = "main") => {
      setIsLoading(true);
      setError(null);
      setFileContent(null);

      try {
        const response = await fetch(
          `https://api.github.com/repos/${repo.full_name}/contents/${path}?ref=${branch}`,
          {
            headers: {
              Authorization: `Bearer ${githubApiKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch repository contents");
        }

        const data: FileContent | FileContent[] = await response.json();

        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => {
            if (a.type === b.type) {
              return a.name.localeCompare(b.name);
            }
            return a.type === "dir" ? -1 : 1;
          });

          setRepoContents(sortedData);
          setSelectedRepo(repo);
          setCurrentPath(path);

          const fetchCommitsForItems = async () => {
            for (const item of sortedData) {
              await fetchCommits(repo, item.path);
            }
          };
          fetchCommitsForItems();
        } else {
          await fetchFileContent(data);
          fetchCommits(repo, data.path);
        }
      } catch (error) {
        setError("레포지토리 내용 조회 에러.");
        console.error("Error fetching repository contents:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [githubApiKey, fetchCommits, fetchFileContent]
  );

  // 브랜치 변경
  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    setCurrentPath(""); // 브랜치 변경하면 경로도 루트로 초기화
    setIsFileSelected(false); // 브랜치 변경하면 파일 선택 상태 false
    if (selectedRepo) {
      fetchRepoContents(selectedRepo, "", branch);
    }
  };

  // 파일 또는 폴더 클릭 핸들러
  const handleItemClick = (item: FileContent) => {
    if (item.type === "dir") {
      fetchRepoContents(selectedRepo!, item.path, selectedBranch);
      setIsFileSelected(false); // 디렉토리를 선택하면 파일 선택 상태 false
    } else {
      fetchFileContent(item);
    }
  };

  // 경로 클릭 핸들러
  const handlePathClick = (pathPart: string) => {
    if (selectedRepo) {
      const newPath = currentPath
        .split("/")
        .slice(0, currentPath.split("/").indexOf(pathPart) + 1)
        .join("/");
      fetchRepoContents(selectedRepo, newPath, selectedBranch);
      setIsFileSelected(false); // 경로를 변경하면 파일 선택 상태 false
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 부수효과 없이 파일 내용만 조회하는 함수
  const getFileContent = async (
    repo: Repository,
    path: string,
    branch: string
  ) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents/${path}?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${githubApiKey}`,
            Accept: "application/vnd.github.v3.raw",
          },
        }
      );

      if (!response.ok) {
        throw new Error("파일 내용 가져오기 실패");
      }

      return await response.text();
    } catch (error) {
      console.error("파일 내용 가져오기 실패:", error);
      return null;
    }
  };

  // 도커파일 존재 여부 확인 함수
  const checkDockerfileExists = useCallback(() => {
    return repoContents.some(
      (item) => item.name.toLowerCase() === "dockerfile"
    );
  }, [repoContents]);

  // 프론트엔드 패키지매니저, 빌드 도구 확인 함수
  const checkFrontendProject = async () => {
    const hasYarnLock = repoContents.some((item) => item.name === "yarn.lock");
    const hasPackageLock = repoContents.some(
      (item) => item.name === "package-lock.json"
    );
    const hasViteConfig = repoContents.some(
      (item) => item.name === "vite.config.js" || "vite.config.ts"
    );
    const packageManager = hasYarnLock
      ? "yarn"
      : hasPackageLock
        ? "npm"
        : "unknown";
    let buildTool = "unknown";

    const packageJsonFile = repoContents.find(
      (item) => item.name === "package.json"
    );
    if (packageJsonFile && selectedRepo) {
      const content = await getFileContent(
        selectedRepo,
        packageJsonFile.path,
        selectedBranch
      );
      if (content) {
        const packageJson = JSON.parse(content);
        console.log(packageJson);
        if (packageJson.dependencies?.["react-scripts"]) {
          buildTool = "cra";
        } else if (hasViteConfig) {
          buildTool = "vite";
        }
      }
    }

    return {
      packageManager,
      buildTool,
    };
  };

  // 선택완료 버튼 클릭 핸들러
  const handleSelectComplete = () => {
    if (selectedRepo && projectId && deployType) {
      const pathToUse = currentPath || "/";
      const latestCommit = commits[pathToUse] || commits[""];

      let commitMessage = "커밋메시지가 존재하지 않습니다.";
      let commitUserName = selectedRepo.owner.login;
      let commitUserProfile = selectedRepo.owner.avatar_url;

      if (latestCommit) {
        commitMessage = latestCommit.commit.message;
        commitUserName = latestCommit.commit.author.name;
        commitUserProfile =
          latestCommit.author?.avatar_url || selectedRepo.owner.avatar_url;
      }

      const dockerfileExists = checkDockerfileExists();

      setGithubRepositoryRequest({
        repositoryOwner: selectedRepo.owner.login,
        repositoryName: selectedRepo.name,
        repositoryUrl: selectedRepo.html_url,
        rootDirectory: currentPath ? `./${currentPath}/` : "./",
        branch: selectedBranch,
      });

      setVersionRequest({
        repositoryLastCommitMessage: commitMessage,
        repositoryLastCommitUserProfile: commitUserProfile,
        repositoryLastCommitUserName: commitUserName,
      });

      if (!dockerfileExists) {
        console.log(checkFrontendProject());
      }

      router.push(`/deploy/form?projectId=${projectId}&type=${deployType}`);
    }
  };

  const projectId = searchParams.get("projectId"); // 프로젝트 ID
  const deployTypeMatch = pathname.match(
    /\/deploy\/create\/(frontend|backend)/
  );
  const deployType: DeployType = deployTypeMatch
    ? (deployTypeMatch[1].toUpperCase() as DeployType)
    : null;

  if (error) {
    return <div>에러...</div>;
  }

  return (
    <div className="container mx-auto font-sans">
      <h2 className="text-2xl font-bold mb-4">
        저장소, 브랜치, 루트 디렉토리를 선택해주세요
      </h2>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="flex bg-white rounded-lg border">
        <div
          className={`w-1/3 border-r overflow-y-auto ${
            !isLoading && filteredRepos.length === 0
              ? "flex items-center justify-center"
              : ""
          }`}
          style={{
            maxHeight: "calc(100vh - 400px)",
            minHeight: "calc(100vh - 400px)",
          }}
        >
          {!isLoading && filteredRepos.length === 0 ? (
            <div className="text-center p-4 flex flex-col items-center">
              <LiaGithubAlt className="w-20 h-20" />
              <p className="text-lg mb-2">검색한 저장소를 찾을 수가 없어요.</p>
              <p className="text-gray-600">
                다른 검색어로 검색을 해보시겠어요?
              </p>
            </div>
          ) : (
            <RepoList
              repos={filteredRepos}
              selectedRepo={selectedRepo}
              onRepoSelect={(repo) => {
                setSelectedRepo(repo);
                fetchBranches(repo);
              }}
            />
          )}
        </div>
        <div
          className="w-2/3 p-4 overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 400px)",
            minHeight: "calc(100vh - 400px)",
          }}
        >
          {selectedRepo && (
            <div>
              <DirectoryNavigator
                repoName={selectedRepo.name}
                currentPath={currentPath}
                onPathClick={handlePathClick}
                onRepoClick={() =>
                  fetchRepoContents(selectedRepo, "", selectedBranch)
                }
                branches={branches}
                selectedBranch={selectedBranch}
                onBranchChange={handleBranchChange}
              />
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : fileContent ? (
                <pre
                  data-cy="file-content"
                  className="bg-gray-100 p-4 rounded-lg overflow-x-auto"
                >
                  <code>{fileContent}</code>
                </pre>
              ) : (
                <FileList
                  repoContents={repoContents}
                  onItemClick={handleItemClick}
                  formatDate={formatDate}
                  commits={commits}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="text-right mt-6">
        <Button
          label={"선택완료"}
          size="medium"
          primary
          onClick={handleSelectComplete}
          disabled={isFileSelected || isCommitLoading}
        />
      </div>
    </div>
  );
}
