"use client";

import { useState } from "react";
import { Search, UserPlus, MoreVertical, Shield, ShieldCheck, ShieldAlert, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "active" | "inactive";
}

const mockUsers: AdminUser[] = [
  { id: "u1", name: "Divyansh Saraswat", email: "divyansh@mnit.ac.in", role: "student", department: "CSE", status: "active" },
  { id: "u2", name: "Dr. Ankit Negi", email: "ankit@mnit.ac.in", role: "faculty", department: "ECE", status: "active" },
  { id: "u3", name: "Vikram Singh", email: "vikram@mnit.ac.in", role: "spc", department: "MECH", status: "active" },
  { id: "u4", name: "System Admin", email: "admin@mnit.ac.in", role: "admin", department: "ADMIN", status: "active" },
  { id: "u5", name: "Sneha Reddy", email: "sneha@mnit.ac.in", role: "student", department: "EE", status: "inactive" },
];

export default function UserManagementPage() {
  const [users] = useState(mockUsers);

  const roleIcons = {
    student: { icon: Shield, color: "text-slate-400" },
    faculty: { icon: ShieldCheck, color: "text-emerald-500" },
    spc: { icon: ShieldAlert, color: "text-amber-500" },
    admin: { icon: ShieldCheck, color: "text-primary" },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold text-primary">User Management</h1>
          <p className="text-muted-foreground font-light text-lg">Manage platform users, assign roles, and control access levels.</p>
        </div>
        <button className="nm-primary h-14 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl">
          <UserPlus size={20} />
          <span>Add User</span>
        </button>
      </div>

      <div className="nm-flat rounded-[3rem] p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="w-full md:w-96 nm-inset px-6 py-3 rounded-2xl flex items-center gap-4">
            <Search size={18} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, email, role..." 
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </div>
          <div className="flex gap-4">
             <button className="nm-convex px-6 py-3 rounded-2xl flex items-center gap-2 text-sm text-muted-foreground hover:nm-inset transition-all">
               <Filter size={18} />
               Role
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-2">User</th>
                <th className="px-6 py-2">Role & Department</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="nm-flat bg-background transition-transform cursor-pointer group"
                >
                  <td className="px-6 py-5 rounded-l-[1.5rem]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       {(() => {
                         const RoleUI = roleIcons[user.role];
                         return <RoleUI.icon size={14} className={RoleUI.color} />;
                       })()}
                       <span className="text-sm font-medium capitalize">{user.role}</span>
                       <span className="text-muted-foreground opacity-20 mx-2">|</span>
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{user.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      user.status === "active" ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right rounded-r-[1.5rem]">
                    <button className="nm-convex p-3 rounded-xl text-muted-foreground hover:nm-inset transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
