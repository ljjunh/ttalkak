import ProjectContent from "@/app/projects/[id]/components/ProjectContent";

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ProjectContent id={params.id} />;
}
