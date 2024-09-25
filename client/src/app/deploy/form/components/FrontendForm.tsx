"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { ServiceType, Framework } from "@/types/deploy";
import useDeployStore from "@/store/useDeployStore";
import useCreateDeploy from "@/apis/deploy/useCreateDeploy";
import useCreateWebhook from "@/apis/webhook/useCreateWebhook";
import { LuMinusCircle } from "react-icons/lu";
import { MdAdd } from "react-icons/md";

interface FormData {
  framework: Framework;
  port: number;
  envVars: { key: string; value: string }[];
}

export default function FrontendForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId"); // 프로젝트 ID
  const typeParam = searchParams.get("type");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      framework: Framework.REACT,
      port: 3000,
      envVars: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "envVars",
  });

  const { mutate: createDeploy } = useCreateDeploy();
  const { mutate: createWebhook } = useCreateWebhook();

  const {
    githubRepositoryRequest,
    versionRequest,
    reset: resetDelpoyStore,
  } = useDeployStore();

  const onSubmit = (data: FormData) => {
    const envString = data.envVars
      .map(({ key, value }) => `${key}=${value}`)
      .join("\n");

    createDeploy(
      {
        projectId: Number(projectId),
        serviceType: serviceType as ServiceType,
        hostingPort: Number(data.port),
        githubRepositoryRequest,
        versionRequest,
        databaseCreateRequests: null,
        env: envString,
        framework: data.framework,
      },
      {
        onSuccess: (responseData) => {
          // 웹훅 생성
          createWebhook({
            owner: githubRepositoryRequest.repositoryOwner,
            repo: githubRepositoryRequest.repositoryName,
            webhookUrl: responseData.webhookUrl,
          });
          resetDelpoyStore();
          router.push(`/projects/${projectId}`);
        },
      }
    );
  };

  const serviceType: ServiceType | null =
    typeParam === "FRONTEND"
      ? ServiceType.FRONTEND
      : typeParam === "BACKEND"
        ? ServiceType.BACKEND
        : null;

  return (
    <>
      <form
        id="form"
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mx-auto p-6 bg-white rounded-lg border"
      >
        <div className="space-y-6">
          <Controller
            name="framework"
            control={control}
            render={({ field }) => (
              <div>
                <label
                  htmlFor="framework"
                  className="block text-md font-semibold text-gray-700 mb-1"
                >
                  프론트엔드 프레임워크
                </label>
                <select
                  {...field}
                  id="framework"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none"
                >
                  <option value="REACT">React.js</option>
                  <option value="NEXTJS">Next.js</option>
                </select>
              </div>
            )}
          />
          <Controller
            name="port"
            control={control}
            rules={{
              required: "포트번호를 입력해주세요.",
              pattern: {
                value: /^[0-9]+$/,
                message: "포트 번호는 숫자만 입력 가능합니다.",
              },
            }}
            render={({ field }) => (
              <div>
                <label
                  htmlFor="port"
                  className="block text-md font-semibold text-gray-700 mb-1"
                >
                  포트번호
                </label>
                <input
                  {...field}
                  id="port"
                  type="number"
                  min="0"
                  max="65535"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.port && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.port.message}
                  </p>
                )}
              </div>
            )}
          />

          <div>
            <label
              htmlFor="branch"
              className="block text-md font-semibold text-gray-700 mb-1"
            >
              브랜치
            </label>
            <input
              id="branch"
              type="text"
              value={githubRepositoryRequest.branch}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="rootDir"
              className="block text-md font-semibold text-gray-700 mb-1"
            >
              루트 디렉토리
            </label>
            <input
              id="rootDir"
              type="text"
              value={githubRepositoryRequest.rootDirectory}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="block text-md font-semibold text-gray-700 mb-1">
            환경변수
          </h3>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Controller
                  name={`envVars.${index}.key`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Key"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
                <Controller
                  name={`envVars.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2.5 rounded-md text-gray-400 border border-gray-300 hover:text-gray-600"
                >
                  <LuMinusCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append({ key: "", value: "" })}
            className="mt-3 flex items-center px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-blue-200"
          >
            <MdAdd className="mr-2" /> 추가
          </button>
        </div>
      </form>
      <div className="flex mt-8 justify-end">
        <button
          type="submit"
          form="form"
          className="py-2 px-4 border rounded-md text-md font-medium text-black focus:outline-none"
        >
          다음
        </button>
      </div>
    </>
  );
}
