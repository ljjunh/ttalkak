interface DirectoryNavigatorProps {
  repoName: string | undefined;
  currentPath: string;
  onPathClick: (path: string) => void;
  onRepoClick: () => void;
}

export function DirectoryNavigator({
  repoName,
  currentPath,
  onPathClick,
  onRepoClick,
}: DirectoryNavigatorProps) {
  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div
      data-cy="directory-navigator"
      className="flex items-center mb-4 flex-wrap"
    >
      <button
        onClick={onRepoClick}
        className="text-blue-500 hover:underline ml-1"
      >
        {repoName}
      </button>
      {pathParts.map((part, index) => (
        <span key={index}>
          <span className="mx-1">/</span>
          <button
            onClick={() => onPathClick(part)}
            className="text-blue-500 hover:underline"
          >
            {part}
          </button>
        </span>
      ))}
    </div>
  );
}