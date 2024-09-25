"use client";

import { useEffect, useState } from "react";
import DoughnutChart from "./components/DoughnutChart";
import useGetProjectToLog from "@/apis/project/useGetProjectToLog";
import useGetProjects from "@/apis/project/useGetProjects";
import useGetLog from "@/apis/project/useGetLog";
import {
  getNowDate,
  getStartDate,
  formatTimestamp,
  toISOWithTimezone,
} from "@/utils/getDate";
import useAuthStore from "@/store/useAuthStore";
import { GetProjectsParams, Project, Deployment } from "@/types/project";
import { DeploymentLogParams, DeploymentLog } from "@/types/dashboard";
import { IoRefresh } from "react-icons/io5";

export default function CallbackPage() {
  const { userInfo } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [selectedDeployId, setSelectedDeployId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("today");
  const [selectedType, setSelectedType] = useState<string>("method");
  const [fromDate, setFromDate] = useState<string>(getStartDate());
  const [toDate, setToDate] = useState<string>(getNowDate());
  const [logParams, setLogParams] = useState<DeploymentLogParams | null>(null);
  const [logData, setLogData] = useState<DeploymentLog | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMoreLogs, setHasMoreLogs] = useState<boolean>(true);
  const [selectedMethod, setSelectedMethod] = useState<string[]>([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
  ]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([
    "2",
    "3",
    "4",
    "5",
  ]);

  const params: GetProjectsParams = {
    page: 0,
    size: 999,
    sort: "createdAt",
    direction: "DESC",
    userId: userInfo?.userId ?? 1,
    searchKeyword: "",
  };

  const { data: projectData } = useGetProjects(params);
  const { data: selectedProjectData, isLoading } = useGetProjectToLog(
    selectedProjectId || 0,
    !!selectedProjectId
  );
  const { data: deployLog } = useGetLog(
    logParams as DeploymentLogParams,
    !!logParams && !!selectedDeployId
  );

  // Project 선택
  useEffect(() => {
    if (projectData) setProjects(projectData.content);
  }, [projectData]);

  // Deploy 선택
  useEffect(() => {
    if (selectedProjectData) {
      setProject(selectedProjectData);
    } else {
      setProject(null);
    }
  }, [selectedProjectData]);

  // LogData 저장 및 추가 로드 시 데이터 병합
  useEffect(() => {
    if (deployLog && logParams) {
      console.log("로그 데이터", deployLog);
      console.log("로그 파람스", logParams);

      setLogData((prevLogData) => {
        const updatedContent =
          logParams.page === 0
            ? deployLog.content // 새로고침일 경우 덮어쓰기
            : [...(prevLogData?.content || []), ...deployLog.content]; // 페이지가 0이 아닐 경우 데이터 병합

        if (deployLog.content.length < 50) {
          setHasMoreLogs(false); // 로그가 50개 미만일 경우 더 이상 로드하지 않음
        }

        return { ...deployLog, content: updatedContent };
      });
    }
  }, [deployLog]);

  // 로그 파라미터 업데이트 함수
  const updateLogParams = (page: number = 0) => {
    if (selectedProjectId && selectedDeployId && project) {
      setLogParams({
        from: toISOWithTimezone(fromDate),
        to: toISOWithTimezone(toDate),
        method: selectedMethod,
        status: selectedStatus,
        deploymentId: selectedDeployId,
        sort: "DESC",
        page: page,
      });
    }
  };

  const resetData = () => {
    setCurrentPage(0);
    setHasMoreLogs(true);
  };

  // 초기 데이터 요청
  useEffect(() => {
    updateLogParams();
  }, [
    selectedProjectId,
    selectedDeployId,
    selectedDate,
    project,
    selectedStatus,
    selectedMethod,
  ]);

  // Project 선택
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProjectId(Number(e.target.value));
    resetData();
  };

  // Deploy 선택
  const handleDeployChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeployId(Number(e.target.value));
    resetData();
  };

  // 날짜 선택
  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedDate(selected);
    setSelectedStatus(["2", "3", "4", "5"]);
    setSelectedMethod(["GET", "POST", "PUT", "PATCH", "DELETE"]);

    if (selected === "today") {
      setFromDate(getStartDate());
      setToDate(getNowDate());
    } else if (selected === "week") {
      setFromDate(getStartDate("week"));
      setToDate(getNowDate());
    } else if (selected === "total") {
      setToDate(getNowDate());
    }

    resetData();
  };

  // Type 선택 (method 또는 status)
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);

    if (e.target.value === "status") {
      setSelectedMethod(["GET", "POST", "PUT", "PATCH", "DELETE"]);
    } else if (e.target.value === "method") {
      setSelectedStatus(["2", "3", "4", "5"]);
    }
  };

  // 무한 스크롤을 위한 추가 로그 요청
  const fetchMoreLogs = () => {
    if (hasMoreLogs) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateLogParams(nextPage);
    }
  };

  // 새로고침
  const handleRefresh = () => {
    setSelectedStatus(["2", "3", "4", "5"]);
    setSelectedMethod(["GET", "POST", "PUT", "PATCH", "DELETE"]);
    resetData();
    updateLogParams(0);
  };

  // Status 토글
  const handleStatusToggle = (status: string) => {
    setSelectedStatus((prevStatus) =>
      prevStatus.includes(status)
        ? prevStatus.filter((s) => s !== status)
        : [...prevStatus, status]
    );
  };

  // Method 토글
  const handleMethodToggle = (method: string) => {
    setSelectedMethod((prevMethod) =>
      prevMethod.includes(method)
        ? prevMethod.filter((m) => m !== method)
        : [...prevMethod, method]
    );
  };

  const chartData =
    selectedType === "method"
      ? Object.entries(logData?.methodCounts || {}).reduce(
          (acc, [key, value]) => ({ ...acc, [key]: Number(value) }),
          {} as Record<string, number>
        )
      : Object.entries(logData?.statusCounts || {}).reduce(
          (acc, [key, value]) => ({ ...acc, [key]: Number(value) }),
          {} as Record<string, number>
        );

  const flexClass = "flex items-center justify-between";

  return (
    <>
      <div className={flexClass}>
        <div className={flexClass}>
          <select
            onChange={handleProjectChange}
            value={selectedProjectId ?? ""}
          >
            <option value="">프로젝트</option>
            {projects.map((project: Project) => (
              <option key={project.id} value={project.id}>
                {project.projectName}
              </option>
            ))}
          </select>

          <select
            onChange={handleDeployChange}
            value={selectedDeployId ?? ""}
            disabled={!selectedProjectId || isLoading}
          >
            <option value="">배포 유형</option>
            {project &&
              project.deployments &&
              project.deployments.map((deployment: Deployment) => (
                <option
                  key={deployment.deploymentId}
                  value={deployment.deploymentId}
                >
                  {deployment.serviceType}
                </option>
              ))}
          </select>
        </div>
        <div className={flexClass}>
          <select onChange={handleDateChange} value={selectedDate}>
            <option value="">직접 선택</option>
            <option value="today">오늘</option>
            <option value="week">이번 주</option>
            <option value="total">전체</option>
          </select>

          <div className="flex">
            <input
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(formatTimestamp(e.target.value))}
              onBlur={() => updateLogParams(0)}
              disabled={!!selectedDate}
            />
            <span> ~ </span>
            <input
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(formatTimestamp(e.target.value))}
              onBlur={() => updateLogParams(0)}
              disabled={!!selectedDate}
            />
          </div>

          <IoRefresh onClick={handleRefresh} className="cursor-pointer" />
        </div>
      </div>

      <div className="border">
        <select onChange={handleTypeChange} value={selectedType}>
          <option value="method">Method</option>
          <option value="status">Status</option>
        </select>

        <DoughnutChart
          selectedType={selectedType}
          counts={chartData || {}}
          logs={logData?.content || []}
          fetchMoreLogs={fetchMoreLogs}
          hasMoreLogs={hasMoreLogs}
          isRefresh={currentPage === 0}
          selectedStatus={selectedStatus}
          selectedMethod={selectedMethod}
          handleStatusToggle={handleStatusToggle}
          handleMethodToggle={handleMethodToggle}
        />
      </div>
    </>
  );
}
