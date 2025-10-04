"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);

  // Handle scroll hide/show effect
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (headerRef.current) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          headerRef.current.style.transform = "translateY(-100%)";
        } else {
          headerRef.current.style.transform = "translateY(0)";
        }
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#notificationsToggle")) {
        setNotificationsOpen(false);
      }
      if (!(e.target as HTMLElement).closest("#userMenuButton")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>(
          'input[placeholder="Search..."]'
        )?.focus();
      }
      if (e.key === "Escape") {
        setNotificationsOpen(false);
        setUserMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <nav
      ref={headerRef}
      className="fixed z-30 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50 shadow-sm transition-transform duration-300"
    >
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 rounded-xl lg:hidden hover:text-primary hover:bg-primary/10 focus:bg-primary/10 transition-all duration-200 dark:text-gray-400 dark:hover:bg-primary/20 dark:hover:text-primary"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <a href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-105 transition-transform duration-200">
                L
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-200">
                LoudOwls
              </span>
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 text-gray-500 rounded-xl lg:hidden hover:text-primary hover:bg-primary/10 transition-all duration-200 dark:text-gray-400 dark:hover:bg-primary/20 dark:hover:text-primary"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                id="notificationsToggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
                className="p-2 text-gray-500 rounded-xl hover:text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 dark:text-gray-400 dark:hover:bg-primary/20 dark:hover:text-primary"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <span className="text-sm text-primary cursor-pointer">
                      Mark all as read
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 flex space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          New user registered
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          John Doe just signed up
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 flex space-x-3">
                      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          New blog post published
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          &ldquo;How to build modern UIs&rdquo; is now live
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href="/admin/notifications"
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="p-2 text-gray-500 rounded-xl hover:text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 dark:text-gray-400 dark:hover:bg-primary/20 dark:hover:text-primary">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                id="userMenuButton"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-3 p-1.5 text-sm bg-white rounded-xl border-2 border-transparent hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 dark:bg-gray-800"
              >
                <img
                  className="w-8 h-8 rounded-lg object-cover"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?...q=80"
                  alt="User avatar"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    admin@loudowls.com
                  </p>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex space-x-3">
                    <img
                      className="w-10 h-10 rounded-lg object-cover"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?...q=80"
                      alt="User avatar"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Admin User
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        admin@loudowls.com
                      </p>
                      <span className="inline-block px-2 py-1 mt-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        Administrator
                      </span>
                    </div>
                  </div>
                  <div className="py-2">
                    <a
                      href="/admin/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      My Profile
                    </a>
                    <a
                      href="/admin/settings"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Account Settings
                    </a>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      className="flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileSearchOpen && (
        <div className="lg:hidden px-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
      )}
    </nav>
  );
}
