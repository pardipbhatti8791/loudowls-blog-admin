import React from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Users, 
  Image,
  Database,
  Package
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const AdminNavigation: React.FC = () => {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "CMS",
      href: "/admin/cms",
      icon: <Database className="w-5 h-5" />,
      children: [
        {
          label: "Content Types",
          href: "/admin/cms/content-types",
          icon: <Package className="w-5 h-5" />,
        },
        {
          label: "Components",
          href: "/admin/cms/components",
          icon: <Package className="w-5 h-5" />,
        },
      ],
    },
    {
      label: "Blog",
      href: "/admin/blog",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Jobs",
      href: "/admin/jobs",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      label: "Applied Jobs",
      href: "/admin/applied-jobs",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      label: "Media",
      href: "/admin/media",
      icon: <Image className="w-5 h-5" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  return (
    <nav className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-800"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
            
            {item.children && isActive(item.href) && (
              <ul className="ml-6 mt-2 space-y-1">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <a
                      href={child.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        isActive(child.href)
                          ? "bg-gray-700 text-white"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminNavigation;