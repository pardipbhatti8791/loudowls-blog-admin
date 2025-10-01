"use client";

import { useEffect, useState } from "react";
import { LucideMoveDiagonal } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
    const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: authData } = await supabase.auth.getUser();
      console.log('authData', authData)
      if (!authData?.user) {
        router.push("/auth/login");
      }
      setLoading(false);
    }
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    const confirmed = confirm("Are you sure you want to sign out?");
    if (confirmed) {
      await supabase.auth.signOut();
      router.push("/auth/logout");
    }
  };

  if (loading) return null;

  return (
    <>
      <aside
        id="sidebar"
        className={clsx(
          "fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 h-full pt-16 font-normal bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 shadow-xl transition-all duration-300 transform",
          mobileOpen ? "" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="relative flex flex-col flex-1 min-h-0 pt-0">
          <div className="flex flex-col flex-1 overflow-y-auto scrollbar">
            <div className="flex-1 px-4 space-y-2">
              <Section title="Content">
                <NavItem
                  href="/admin/blog"
                  label="Blog Posts"
                  icon={
                    <svg
                      className="mr-3 h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  }
                  active={pathname.startsWith("/admin/blog")}
                />

                <NavItem
                  href="/admin/media"
                  label="Media Library"
                  icon={<LucideMoveDiagonal className="mr-3 h-5 w-5" />}
                  active={pathname.startsWith("/admin/media")}
                />
              </Section>
            </div>

            <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={handleSignOut}
                    className="group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <span className="mr-3">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-900/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 pt-4">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        className={clsx(
          "group flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-all duration-200 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
          active && "bg-primary text-white"
        )}
      >
        {icon}
        <span>{label}</span>
      </a>
    </li>
  );
}
