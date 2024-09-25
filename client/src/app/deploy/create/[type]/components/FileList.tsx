import { FileContent } from "@/types/repo";
import { AiOutlineFile } from "react-icons/ai";
import { FaFolder } from "react-icons/fa";

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}

interface FileListProps {
  repoContents: FileContent[];
  onItemClick: (item: FileContent) => void;
  formatDate: (dateString: string) => string;
  commits: Record<string, Commit>;
}

export default function FileList({
  repoContents,
  onItemClick,
  formatDate,
  commits,
}: FileListProps) {
  return (
    <table className="w-full table-fixed" data-cy="file-list">
      <thead className="border border-gray bg-gray-100">
        <tr>
          <th className="text-left px-3 py-3 w-3/10">파일 / 폴더명</th>
          <th className="text-left px-3 py-2 w-5/10">최근 커밋 메시지</th>
          <th className="text-left px-20 py-2 w-2/10">최근 커밋 날짜</th>
        </tr>
      </thead>
      <tbody>
        {repoContents.map((item) => {
          const commit = commits[item.path];
          return (
            <tr
              key={item.path}
              className="cursor-pointer hover:bg-gray-100 border border-gray"
              onClick={() => onItemClick(item)}
              data-cy="file-item"
            >
              <td className="py-2 px-3 flex items-center gap-2">
                {item.type === "file" ? (
                  <AiOutlineFile className="text-gray-500 w-5 h-5 flex-shrink-0" />
                ) : (
                  <FaFolder className="text-blue-400 w-5 h-5 flex-shrink-0" />
                )}
                <span className="truncate" data-cy="file-name">
                  {item.name}
                </span>
              </td>
              <td
                className="py-2 px-3 text-gray-600 truncate"
                data-cy="file-commit-message"
              >
                {commit ? commit.commit.message : "커밋 정보 로딩 중..."}
              </td>
              <td
                className="py-2 px-20 text-gray-600 truncate"
                data-cy="file-commit-date"
              >
                {commit
                  ? formatDate(commit.commit.author.date)
                  : "날짜 로딩 중..."}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
