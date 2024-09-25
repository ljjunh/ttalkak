"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { DatabaseType, ServiceType, Framework } from "@/types/deploy";
import useDeployStore from "@/store/useDeployStore";
import useCreateDeploy from "@/apis/deploy/useCreateDeploy";
import useCreateWebhook from "@/apis/webhook/useCreateWebhook";

interface DatabaseForm {
  databaseType: DatabaseType;
  databasePort: string;
  databaseUsername?: string;
  databasePassword?: string;
}

interface FormData {
  port: string;
  rootDir: string;
  useDatabase: boolean;
  databases: DatabaseForm[];
}

export default function BackendForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");
  const typeParam = searchParams.get("type");

  const {
    githubRepositoryRequest,
    versionRequest,
    reset: resetDeployStore,
  } = useDeployStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      port: "8080",
      useDatabase: false,
      databases: [{ databaseType: DatabaseType.MYSQL, databasePort: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "databases",
  });

  const databaseTypes = useWatch({
    control,
    name: "databases",
    defaultValue: [],
  });

  const useDatabase = watch("useDatabase");

  const { mutate: createDeploy } = useCreateDeploy();
  const { mutate: createWebhook } = useCreateWebhook();

  useEffect(() => {
    if (!useDatabase) {
      setValue("databases", []);
    } else if (fields.length === 0) {
      append({ databaseType: DatabaseType.MYSQL, databasePort: "" });
    }
  }, [useDatabase, setValue, fields.length, append]);

  const onSubmit = (data: FormData) => {
    const databaseCreateRequests = data.useDatabase
      ? data.databases.map((db) => ({
          databaseName: db.databaseType,
          databasePort: Number(db.databasePort),
          username:
            db.databaseType === "REDIS" ? "" : db.databaseUsername || "",
          password: db.databasePassword || "",
        }))
      : null;

    createDeploy(
      {
        projectId: Number(projectId),
        serviceType: serviceType as ServiceType,
        hostingPort: Number(data.port),
        githubRepositoryRequest,
        versionRequest,
        databaseCreateRequests,
        env: null,
        framework: Framework.SPRINGBOOT,
      },
      {
        onSuccess: (responseData) => {
          // 웹훅 생성
          createWebhook({
            owner: githubRepositoryRequest.repositoryOwner,
            repo: githubRepositoryRequest.repositoryName,
            webhookUrl: responseData.webhookUrl,
          });
          resetDeployStore();
          router.push(`/projects/${projectId}`);
        },
      }
    );
  };

  const serviceType: ServiceType | null =
    typeParam === "FRONTEND" || typeParam === "BACKEND"
      ? (typeParam as ServiceType)
      : null;

  return (
    <>
      <form
        id="form"
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mx-auto p-6 bg-white rounded-lg border"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-md font-semibold text-gray-700 mb-1">
              백엔드 프레임워크
            </label>
            <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-100">
              SpringBoot
            </div>
          </div>

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

          <Controller
            name="useDatabase"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="flex items-center gap-2">
                <input
                  {...field}
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="useDatabase"
                  className="block text-md font-semibold text-gray-700 mb-1"
                >
                  데이터베이스 사용여부
                </label>
              </div>
            )}
          />

          {useDatabase && (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-300 rounded-md"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">
                      Database {index + 1}
                    </h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="py-2 px-4 border border-red-500 text-red-500 rounded-md focus:outline-none"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Controller
                      name={`databases.${index}.databaseType`}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label
                            htmlFor={`databases.${index}.databaseType`}
                            className="block text-md font-semibold text-gray-700 mb-1"
                          >
                            데이터베이스
                          </label>
                          <select
                            {...field}
                            id={`databases.${index}.databaseType`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="MYSQL">MySQL</option>
                            <option value="MARIADB">MariaDB</option>
                            <option value="MONGODB">MongoDB</option>
                            <option value="POSTGRESQL">PostgreSQL</option>
                            <option value="REDIS">Redis</option>
                          </select>
                        </div>
                      )}
                    />

                    {databaseTypes[index]?.databaseType !== "REDIS" && (
                      <Controller
                        name={`databases.${index}.databaseUsername`}
                        control={control}
                        rules={{
                          required: "데이터베이스 아이디를 입력해주세요.",
                          pattern: {
                            value: /^[A-Za-z0-9]+$/,
                            message: "영어와 숫자만 입력 가능합니다.",
                          },
                        }}
                        render={({ field }) => (
                          <div>
                            <label
                              htmlFor={`databases.${index}.databaseUsername`}
                              className="block text-md font-semibold text-gray-700 mb-1"
                            >
                              데이터베이스 아이디
                            </label>
                            <input
                              {...field}
                              id={`databases.${index}.databaseUsername`}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.databases?.[index]?.databaseUsername && (
                              <p className="text-red-500 text-sm mt-2">
                                {
                                  errors.databases[index].databaseUsername
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                        )}
                      />
                    )}

                    <Controller
                      name={`databases.${index}.databasePassword`}
                      control={control}
                      rules={{
                        required: "데이터베이스 비밀번호를 입력해주세요.",
                      }}
                      render={({ field }) => (
                        <div>
                          <label
                            htmlFor={`databases.${index}.databasePassword`}
                            className="block text-md font-semibold text-gray-700 mb-1"
                          >
                            데이터베이스 비밀번호
                          </label>
                          <input
                            {...field}
                            id={`databases.${index}.databasePassword`}
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.databases?.[index]?.databasePassword && (
                            <p className="text-red-500 text-sm mt-2">
                              {
                                errors.databases[index].databasePassword
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name={`databases.${index}.databasePort`}
                      control={control}
                      rules={{
                        required: "포트번호를 입력해주세요.",
                        pattern: {
                          value: /^\d+$/,
                          message: "숫자만 입력가능합니다.",
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <label
                            htmlFor={`databases.${index}.databasePort`}
                            className="block text-md font-semibold text-gray-700 mb-1"
                          >
                            데이터베이스 포트번호
                          </label>
                          <input
                            {...field}
                            id={`databases.${index}.databasePort`}
                            type="number"
                            min="0"
                            max="65535"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {error && (
                            <p className="text-red-500 text-sm mt-2">
                              {error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  append({ databaseType: DatabaseType.MYSQL, databasePort: "" })
                }
                className="mt-4 py-2 px-4 border text-black rounded-md focus:outline-none"
              >
                추가
              </button>
            </div>
          )}
        </div>
      </form>
      <div className="flex mt-8 justify-end">
        <button
          type="submit"
          form="form"
          className="py-2 px-4 bg-black border rounded-md text-md font-medium text-white focus:outline-none"
        >
          다음
        </button>
      </div>
    </>
  );
}
