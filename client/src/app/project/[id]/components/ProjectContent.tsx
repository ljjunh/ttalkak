"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ServiceType } from "@/types/deploy";
import { Deployment } from "@/types/project";
import { CreateProjectParams } from "@/types/project";
import ConfirmModal from "@/components/ConfirmModal";
import Modal from "@/app/project/components/Modal";
import DeploymentStatus from "@/app/project/[id]/components/DeploymentStatus";
import useGetProject from "@/apis/project/useGetProject";
import useDeleteProject from "@/apis/project/useDeleteProject";
import useModifyProject from "@/apis/project/useModifyProject";
import useGetMultipleWebhooks from "@/apis/webhook/useGetMultipleWebhooks";
import useDeleteWebhook from "@/apis/webhook/useDeleteWebhook";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";

interface ProjectContentProps {
  id: string;
}

export default function ProjectContent({ id }: ProjectContentProps) {
  const router = useRouter();

  const { data: project } = useGetProject(Number(id));

  const { mutate: modifyProject } = useModifyProject();
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: deleteWebhook } = useDeleteWebhook();

  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleteClicked, setIsDeleteClicked] = useState(false);

  const repos = useMemo(
    () =>
      project.deployments?.map((deploy) => ({
        owner: deploy.repositoryOwner,
        repo: deploy.repositoryName,
      })) ?? [],
    [project.deployments]
  );

  const webhookQueries = useGetMultipleWebhooks(repos, isDeleteClicked);

  const handleEditSubmit = (data: CreateProjectParams) => {
    modifyProject({
      projectId: project.id,
      data,
    });
    setEditModal(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteClicked(true);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (project.deployments.length >= 1) {
      const deletePromises = webhookQueries.flatMap((query, index) => {
        if (!query.data) return [];
        const repo = repos[index];
        return query.data
          .filter((webhook) =>
            webhook.config.url.includes(project.webhookToken)
          )
          .map((webhook) =>
            deleteWebhook({
              owner: repo.owner,
              repo: repo.repo,
              hook_id: webhook.id,
            })
          );
      });

      await Promise.all(deletePromises);
    }

    // 프로젝트 삭제
    deleteProject(id, {
      onSuccess: () => {
        setDeleteModal(false);
        setIsDeleteClicked(false);
        router.push("/project");
      },
    });
  };

  const getLatestDeploy = (
    deployments: Deployment[] | null,
    type: ServiceType
  ): Deployment | null => {
    if (!deployments) {
      return null;
    }
    return (
      deployments
        .filter((deploy) => deploy.serviceType === type)
        .sort((a, b) => b.deploymentId - a.deploymentId)[0] || null
    );
  };

  return (
    <div className="container mx-auto my-10 p-6 border rounded-lg overflow-hidden">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold mb-3">{project.projectName}</h1>
        <FaRegEdit
          onClick={() => setEditModal(true)}
          className="w-6 h-6 cursor-pointer"
        />
        <RiDeleteBin5Line
          onClick={handleDeleteClick}
          className="w-7 h-7 cursor-pointer"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-grow">
            <div className="grid grid-cols-2 gap-4">
              <DeploymentStatus
                type={ServiceType.FRONTEND}
                deploy={getLatestDeploy(
                  project.deployments,
                  ServiceType.FRONTEND
                )}
                projectId={project.id}
              />
              <DeploymentStatus
                type={ServiceType.BACKEND}
                deploy={getLatestDeploy(
                  project.deployments,
                  ServiceType.BACKEND
                )}
                projectId={project.id}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onSubmit={handleEditSubmit}
        project={project}
        mode="edit"
      />
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        message="프로젝트를 삭제하시겠습니까?"
      />
    </div>
  );
}