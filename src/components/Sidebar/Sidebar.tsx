"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react"; // ✅ next-auth থেকে signOut
import { LogoutModal } from "../modal/LogoutModal";

const navigation = [
  { name: "Experiences", href: "/dashboard", icon: LayoutDashboard },
  { name: "Add Experiences", href: "/dashboard/add-exprences", icon: LayoutDashboard },
  { name: "Planning", href: "/dashboard/planning", icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsModalOpen(false);

    try {
      await signOut({ callbackUrl: "/login" }); 
      // 👆 লগআউট হলে /login এ redirect হবে
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex h-screen sticky bottom-0 top-0 w-[350px] flex-col bg-[#212121] z-50">
      {/* Logo */}
      <div className="h-[80px] flex items-center justify-start px-6 ml-3">
        <span className="text-white ml-10 text-2xl font-semibold">
          Karmandia
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 flex flex-col items-center justify-start px-3 overflow-y-auto mt-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex w-[90%] mx-auto items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-black"
                  : "text-slate-300 hover:bg-slate-600/50 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6",
                  isActive ? "text-black" : ""
                )}
              />
              <span
                className={cn(
                  "text-base",
                  isActive ? "text-black font-medium" : ""
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3">
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex gap-1 text-red-700 items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-slate-600/50 hover:text-white cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-base">Log Out</span>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
