"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import CreateModal from "@/app/database/components/CreateModal";
import DetailModal from "@/app/database/components/DetailModal";
import DetailLoading from "@/app/database/components/DetailLoading";
import DetailError from "@/app/database/components/DetailError";
import useGetDatabases from "@/apis/database/useGetDatabases";
import useCreateDatabase from "@/apis/database/useCreateDatabase";
import useDeleteDatabase from "@/apis/database/useDeleteDatabase";
import { getDatabaseIcon, getDatabaseName } from "@/utils/getDatabaseIcons";
import {
  CreateDatabaseRequest,
  GetDatabasesParams,
  GetDatabasesContentResponse,
} from "@/types/database";
import { IoIosSearch } from "react-icons/io";
import { FaSort } from "react-icons/fa";

export default function DatabasePage() {
  const queryClient = useQueryClient();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [direction, setDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(
    null
  );

  const { mutate: createDatabase } = useCreateDatabase();
  const { mutate: deleteDatabase } = useDeleteDatabase();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const params: GetDatabasesParams = {
    page: currentPage,
    size: 9,
    sort: "createdAt",
    direction: direction.toUpperCase(),
    searchKeyword,
  };

  const { data } = useGetDatabases(params);

  const handleCreateDatabase = (data: CreateDatabaseRequest) => {
    createDatabase(data, {
      onSuccess: () => {
        setCreateModalOpen(false);
      },
    });
  };

  const handleDeleteDatabase = () => {
    if (!selectedDatabaseId) return;
    deleteDatabase(selectedDatabaseId, {
      onSuccess: () => {
        setDetailModalOpen(false);
      },
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-grow mr-4">
          <input
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            placeholder="데이터베이스를 검색해주세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <IoIosSearch className="absolute left-3 top-2.5 text-gray-400 text-xl" />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 text-gray-700"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          >
            <option value="desc">최신순</option>
            <option value="asc">오래된순</option>
          </select>
          <FaSort className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl font-bold">데이터베이스</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="border border rounded-lg px-4 py-2"
        >
          생성
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.content.map((database: GetDatabasesContentResponse) => {
          const Icon = getDatabaseIcon(database.type);
          return (
            <div
              key={database.id}
              className="border rounded-lg p-6 cursor-pointer"
              onClick={() => {
                setSelectedDatabaseId(database.id);
                setDetailModalOpen(true);
              }}
            >
              <div className="flex items-center mb-2 cursor-pointer">
                <Icon className="w-10 h-10 mr-3 text-gray-600" />
                <div>
                  <h2 className="font-semibold">{database.name}</h2>
                  <p className="text-sm text-gray-500">
                    {getDatabaseName(database.type)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <nav className="inline-flex rounded-md gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            이전
          </button>
          {Array.from({ length: data?.totalPages || 0 }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page - 1)}
                className={`px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium ${
                  page === currentPage + 1
                    ? "bg-gray-900 text-white border-gray-900"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min((data?.totalPages ?? 1) - 1, prev + 1)
              )
            }
            disabled={currentPage === (data?.totalPages ?? 1) - 1}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            다음
          </button>
        </nav>
      </div>

      <CreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateDatabase}
      />
      {detailModalOpen && (
        <ErrorBoundary
          FallbackComponent={({ error, resetErrorBoundary }) => (
            <DetailError
              error={error}
              resetErrorBoundary={resetErrorBoundary}
              onClose={() => setDetailModalOpen(false)}
            />
          )}
          onReset={() => {
            queryClient.invalidateQueries({
              queryKey: ["database", selectedDatabaseId],
            });
          }}
        >
          <Suspense fallback={<DetailLoading />}>
            <DetailModal
              isOpen={detailModalOpen}
              onClose={() => setDetailModalOpen(false)}
              onDelete={handleDeleteDatabase}
              databaseId={selectedDatabaseId}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
