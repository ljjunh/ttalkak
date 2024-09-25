import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DeployData,
  Framework,
  GithubRepositoryRequest,
  DatabaseCreateRequest,
  VersionRequest,
} from "@/types/deploy";

interface DeployStoreState extends DeployData {
  setFramework: (framework: Framework) => void;
  setGithubRepositoryRequest: (data: Partial<GithubRepositoryRequest>) => void;
  setDatabaseCreateRequests: (data: DatabaseCreateRequest[] | null) => void;
  addDatabaseCreateRequest: (data: DatabaseCreateRequest) => void;
  removeDatabaseCreateRequest: (index: number) => void;
  setVersionRequest: (data: Partial<VersionRequest>) => void;
  setHostingPort: (hostingPort: number | null) => void;
  setEnvironment: (env: string | null) => void;
  reset: () => void;
}

const initialState: DeployData = {
  framework: Framework.SPRINGBOOT,
  githubRepositoryRequest: {
    repositoryOwner: "",
    repositoryName: "",
    repositoryUrl: "",
    rootDirectory: "./",
    branch: "",
  },
  versionRequest: {
    repositoryLastCommitMessage: "",
    repositoryLastCommitUserProfile: "",
    repositoryLastCommitUserName: "",
  },
  databaseCreateRequests: null,
  hostingPort: null,
  env: null,
};

const useDeployStore = create(
  persist<DeployStoreState>(
    (set) => ({
      ...initialState,
      setFramework: (framework) => set({ framework }),
      setGithubRepositoryRequest: (data) =>
        set((state) => ({
          githubRepositoryRequest: {
            ...state.githubRepositoryRequest,
            ...data,
          },
        })),
      setDatabaseCreateRequests: (data) =>
        set({ databaseCreateRequests: data }),
      addDatabaseCreateRequest: (data) =>
        set((state) => ({
          databaseCreateRequests: state.databaseCreateRequests
            ? [...state.databaseCreateRequests, data]
            : [data],
        })),
      removeDatabaseCreateRequest: (index) =>
        set((state) => ({
          databaseCreateRequests: state.databaseCreateRequests
            ? state.databaseCreateRequests.filter((_, i) => i !== index)
            : null,
        })),
      setVersionRequest: (data) =>
        set((state) => ({
          ...state,
          versionRequest: state.versionRequest
            ? { ...state.versionRequest, ...data }
            : (data as VersionRequest),
        })),
      setHostingPort: (hostingPort) => set({ hostingPort }),
      setEnvironment: (env) => set({ env }),
      reset: () => set(initialState),
    }),
    {
      name: "deploy-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useDeployStore;
