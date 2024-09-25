"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import React, { useEffect, useState, useRef } from "react";
import { formatTimestamp } from "@/utils/getDate";

ChartJS.register(ArcElement, Tooltip, Legend);

// DoughnutChart 색상 정의
const backgroundColors = [
  "rgba(255, 99, 132, 0.5)",
  "rgba(54, 162, 235, 0.5)",
  "rgba(255, 206, 86, 0.5)",
  "rgba(75, 192, 192, 0.5)",
  "rgba(153, 102, 255, 0.5)",
];

const borderColors = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
];

const getPercentageData = (counts: Record<string, number>) => {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return {
      data: [1], // 데이터가 없을 때 기본 원형
      labels: ["No Data"],
      backgroundColor: ["rgba(211, 211, 211, 0.5)"],
      borderColor: ["rgba(211, 211, 211, 1)"],
    };
  }

  return {
    data: Object.values(counts),
    labels: Object.keys(counts),
    backgroundColor: backgroundColors,
    borderColor: borderColors,
  };
};

const DoughnutChart = ({
  selectedType,
  counts,
  logs,
  fetchMoreLogs,
  hasMoreLogs,
  isRefresh,
  selectedStatus,
  selectedMethod,
  handleStatusToggle,
  handleMethodToggle,
}: {
  selectedType: string;
  counts: Record<string, number>;
  logs: any[];
  fetchMoreLogs: () => void;
  hasMoreLogs: boolean;
  isRefresh: boolean;
  selectedStatus: string[];
  selectedMethod: string[];
  handleStatusToggle: (status: string) => void; // status 토글 핸들러
  handleMethodToggle: (method: string) => void;
}) => {
  const [sortedLogs, setSortedLogs] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // 최신순으로 로그 정렬
  useEffect(() => {
    const sorted = logs.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
    setSortedLogs(sorted);

    // 새로고침일 때만 스크롤을 상단으로 이동
    if (isRefresh && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = 0;
    }
  }, [logs, isRefresh]); // isRefresh에 의존하여 새로고침 시만 처리

  // 무한 스크롤
  const handleScroll = () => {
    if (logsContainerRef.current && !isFetching && hasMoreLogs) {
      const { scrollTop, scrollHeight, clientHeight } =
        logsContainerRef.current;

      const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

      if (percentage >= 80) {
        setIsFetching(true);
        fetchMoreLogs();

        setTimeout(() => {
          setIsFetching(false);
        }, 2000);
      }
    }
  };

  const chartData = getPercentageData(counts);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        backgroundColor: chartData.backgroundColor,
        borderColor: chartData.borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(2) + "%";
            return `${label}: ${value} (${percentage})`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <>
      {selectedType === "status" ? (
        <div>
          {Object.keys(counts).map((status, index) => (
            <button
              key={status}
              style={{
                backgroundColor: selectedStatus.includes(status[0])
                  ? backgroundColors[index]
                  : "lightgray",
                color: selectedStatus.includes(status[0]) ? "white" : "gray",
                textDecoration: selectedStatus.includes(status[0])
                  ? "none"
                  : "line-through",
                textAlign: "center",
                padding: "5px",
                margin: "5px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => handleStatusToggle(status[0])}
            >
              {status[0]}00
            </button>
          ))}
        </div>
      ) : (
        <div>
          {Object.keys(counts).map((method, index) => (
            <button
              key={method}
              style={{
                backgroundColor: selectedMethod.includes(method)
                  ? backgroundColors[index]
                  : "lightgray",
                color: selectedMethod.includes(method) ? "white" : "gray",
                textDecoration: selectedMethod.includes(method)
                  ? "none"
                  : "line-through",
                textAlign: "center",
                padding: "5px",
                margin: "5px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => handleMethodToggle(method)}
            >
              {method}
            </button>
          ))}
        </div>
      )}
      <div className="flex">
        <div style={{ width: "300px", height: "300px" }}>
          <Doughnut data={data} options={options} />
        </div>

        <div
          className="w-2/3 h-80 overflow-y-auto"
          ref={logsContainerRef}
          onScroll={handleScroll}
        >
          {sortedLogs.length > 0 ? (
            sortedLogs.map((log, index) => (
              <div key={index} className="flex border-b py-3.5">
                <div className="w-52">{formatTimestamp(log.timestamp)}</div>
                <div>method: {log.method}</div>
                <div>status: {log.status}</div>
                <div>path: {log.path}</div>
                <div>duration: {log.duration}s</div>
                <hr />
              </div>
            ))
          ) : (
            <p>No logs available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DoughnutChart;
