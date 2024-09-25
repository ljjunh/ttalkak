import { Suspense } from "react";
import { notFound } from "next/navigation";
import BackendForm from "@/app/deploy/form/components/BackendForm";
import FrontendForm from "@/app/deploy/form/components/FrontendForm";
import SkeletonUI from "@/app/deploy/form/components/SkeletonUI";

export default function deployFormPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const type = searchParams.type as string | undefined;

  if (!type || (type !== "BACKEND" && type !== "FRONTEND")) {
    notFound();
  }

  return (
    <div>
      <Suspense fallback={<SkeletonUI />}>
        {type === "BACKEND" ? <BackendForm /> : <FrontendForm />}
      </Suspense>
    </div>
  );
}
