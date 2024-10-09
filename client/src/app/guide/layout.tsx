import Sidebar from "./components/Sidebar";
import NavSpacer from "./components/NavSpacer";
export const inlinelayout =
  "relative w-full h-full items-center justify-center";

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full fixed top-0 left-0 ">
      <NavSpacer />
      <div className="w-full flex flex-col">
        <div className="w-full flex items-center justify-center">
          <Sidebar />
          <main className="w-full overflow-y-auto custom-scrollbar bg-white">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
