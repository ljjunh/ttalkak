interface DirectoryNavigatorProps {
  repoName: string | undefined;
  currentPath: string;
  onPathClick: (path: string) => void;
  onRepoClick: () => void;
  branches: string[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
}

export default function DirectoryNavigator({
  repoName,
  currentPath,
  onPathClick,
  onRepoClick,
  branches,
  selectedBranch,
  onBranchChange,
}: DirectoryNavigatorProps) {
  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div
      data-cy="directory-navigator"
      className="flex items-center mb-4 flex-wrap justify-between"
    >
      <div className="flex items-center flex-wrap">
        <button
          onClick={onRepoClick}
          className="text-blue-500 hover:underline ml-1"
        >
          {repoName}
        </button>
        {pathParts.map((part, index) => (
          <span key={index}>
            <span className="mx-1">/</span>
            {index < pathParts.length - 1 ? (
              <button
                onClick={() => onPathClick(part)}
                className="text-blue-500 hover:underline"
              >
                {part}
              </button>
            ) : (
              <span className="text-gray-700">{part}</span>
            )}
          </span>
        ))}
      </div>
      <div className="ml-4">
        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
