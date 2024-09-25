import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProjectLoading() {
  return (
    <div className="w-full p-8 bg-white rounded-md border mx-auto">
      <div className="flex flex-col gap-6">
        <div className="w-[300px]">
          <Skeleton className="h-12" />
        </div>
        <div className="flex gap-6">
          <div className="w-1/2">
            <Skeleton className="h-48" />
          </div>
          <div className="w-1/2">
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
