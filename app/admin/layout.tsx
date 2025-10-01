import { ReactNode } from "react";
import NavBar from "@/components/admin/NavBar";
import SideBar from "@/components/admin/SideBar";
interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 scrollbar scrollbar-w-3 scrollbar-thumb-rounded-[0.25rem] scrollbar-track-slate-200 scrollbar-thumb-gray-400 min-h-screen">
      {/* Nav & Sidebar */}
      <NavBar />
      <SideBar />

      {/* Main Content */}
      <div className="flex bg-gray-50 dark:bg-gray-900">
        <div
          id="main-content"
          className="relative mb-10 w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900 min-h-screen"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
