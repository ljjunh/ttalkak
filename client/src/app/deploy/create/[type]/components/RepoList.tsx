import React from "react";
import Image from "next/image";
import { Repository } from "@/types/repo";

interface RepoListProps {
  repos: Repository[];
  selectedRepo: Repository | null;
  onRepoSelect: (repo: Repository) => void;
}

export default function RepoList({
  repos,
  selectedRepo,
  onRepoSelect,
}: RepoListProps) {
  return (
    <ul className="divide-y" data-cy="repo-list">
      {repos.map((repo) => (
        <li
          data-cy="repo-item"
          key={repo.id}
          className={`cursor-pointer hover:bg-gray-100 p-3 ${
            selectedRepo?.id === repo.id ? "bg-gray-100" : ""
          }`}
          onClick={() => onRepoSelect(repo)}
        >
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-2">
              <Image
                data-cy="repo-image"
                src={repo.owner.avatar_url}
                alt={`${repo.owner.login}'s avatar`}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            </div>
            <div data-cy="repo-name" className="font-semibold">
              {repo.full_name}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
