'use client'
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Search, UserPlus, MoreVertical, Shield, ShieldCheck, ShieldAlert, Filter, Loader2, X, SlidersHorizontal, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { AddUserDialog } from "@/components/dashboard/AddUserDialog";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, right: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers(roleFilter === "all" ? undefined : roleFilter, signal);
      
      // Map to ensure id is always available (handling both Mongo _id and alias id)
      const mapped = data.map((u: any) => ({
        ...u,
        id: u.id || u._id
      }));

      const filtered = mapped.filter((u: any) => 
        u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.department?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      
      setUsers(filtered);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchUsers]);

  useLayoutEffect(() => {
    if (openMenuId && buttonRefs.current[openMenuId]) {
      const rect = buttonRefs.current[openMenuId]!.getBoundingClientRect();
      const menuHeight = 320; // Estimated height for the menu
      const menuWidth = 224;  // w-56
      
      let top = rect.top;
      let right = window.innerWidth - rect.left + 12;

      // Vertical overflow check: shift up if it would go off-screen
      if (top + menuHeight > window.innerHeight) {
        top = Math.max(20, window.innerHeight - menuHeight - 20);
      }

      // Horizontal overflow check: shift right if it would go off-screen on the left
      if (window.innerWidth - right - menuWidth < 10) {
        right = Math.max(10, window.innerWidth - menuWidth - 10);
      }

      setMenuPosition({ top, right });
    } else {
      setMenuPosition(null);
    }
  }, [openMenuId]);

  useEffect(() => {
    const handleClose = () => setOpenMenuId(null);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, []);

  const handleDeleteUser = async (userId: string) => {
    setOpenMenuId(null);
    setConfirmConfig({
      isOpen: true,
      title: "Delete User Account",
      message: "Are you sure you want to permanently delete this user? All associated data and access will be revoked. This action is irreversible.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await adminApi.deleteUser(userId);
          toast.success("User successfully removed from system");
          fetchUsers();
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete user record");
        }
      }
    });
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const newStatus = !user.is_active;
      await adminApi.updateUser(user.id, { is_active: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status");
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user role");
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      await adminApi.createUser(data);
      toast.success("User created successfully!");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create user");
    }
  };

  const roleIcons: Record<string, any> = {
    student: { icon: Shield, color: "text-slate-400" },
    faculty: { icon: ShieldCheck, color: "text-emerald-500" },
    spc: { icon: ShieldAlert, color: "text-amber-500" },
    admin: { icon: ShieldCheck, color: "text-primary" },
  };

  const roles: (UserRole | "all")[] = ["all", "student", "faculty", "spc"];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold text-primary dark:text-blue-500">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-light text-lg">Manage platform users, assign roles, and control access levels.</p>
        </div>
        <button 
          onClick={() => setIsAddUserOpen(true)}
          className="nm-primary h-14 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl whitespace-nowrap"
        >
          <UserPlus size={20} />
          <span>Add User</span>
        </button>
      </div>

      <div className="nm-flat rounded-[3.5rem] p-8 pb-16 space-y-8 min-h-[500px]">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="w-full lg:flex-1 max-w-2xl nm-inset bg-slate-50/50 dark:bg-slate-900/30 px-6 py-4 rounded-[2rem] flex items-center gap-4 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors shrink-0" />
            <input 
              type="text" 
              placeholder="Search by name, email, department..." 
              className="bg-transparent border-none outline-none w-full text-sm font-bold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full lg:w-auto gap-3 relative">
             <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "nm-convex flex-1 lg:flex-none px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest transition-all",
                roleFilter !== "all" ? "text-primary nm-inset" : "text-muted-foreground hover:nm-inset"
              )}
             >
               <Filter size={16} />
               <span>{roleFilter === "all" ? "Filter Role" : roleFilter}</span>
             </button>

             <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsFilterOpen(false)}
                      className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-16 right-0 w-64 nm-flat bg-background/95 backdrop-blur-xl rounded-[2rem] p-4 z-50 shadow-2xl border border-white/20"
                    >
                      <div className="flex items-center gap-2 mb-4 px-3 text-primary">
                        <SlidersHorizontal size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Filter Access</span>
                      </div>
                      <div className="space-y-1.5">
                        {roles.map(r => (
                          <button
                            key={r}
                            onClick={() => {
                              setRoleFilter(r);
                              setIsFilterOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all",
                              roleFilter === r ? "nm-inset text-primary" : "hover:bg-slate-50 dark:hover:bg-slate-900 text-muted-foreground"
                            )}
                          >
                            <span>{r === "all" ? "All Users" : r}</span>
                            {roleFilter === r && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
             </AnimatePresence>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Fetching users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
            <Shield size={64} strokeWidth={0.5} />
            <p className="text-lg font-light">No users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Headers - Desktop Only */}
            <div className="hidden md:grid grid-cols-[1.5fr_1fr_0.8fr_0.4fr] px-10 text-slate-500/60 dark:text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <div>User</div>
              <div>Role & Department</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="space-y-4">
              {users.map((user, i) => (
                <motion.div 
                  key={user.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative nm-flat bg-background hover:nm-convex transition-all cursor-pointer group rounded-[2.5rem] overflow-hidden group/card"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_0.8fr_0.4fr] items-center p-6 md:px-10">
                    {/* User Header Section (Left on Desktop) */}
                    <div className="flex items-center gap-5 pr-12 md:pr-0">
                      <div className="w-14 h-14 rounded-full nm-inset flex items-center justify-center text-primary font-bold text-lg bg-gradient-to-br from-primary/10 to-transparent shrink-0">
                        {user.name?.[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 text-left space-y-0.5">
                        <p className="font-bold text-base text-slate-800 dark:text-white group-hover/card:text-primary transition-colors truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate tracking-tight">{user.email}</p>
                      </div>
                    </div>

                    {/* Desktop Content Columns continue... */}
                    
                    {/* Role & Status Row - Structured on Mobile */}
                    <div className="mt-6 md:mt-0 flex flex-wrap items-center gap-4 lg:gap-8">
                       {/* Role Badge */}
                       <div className="flex items-center gap-3 nm-convex px-4 py-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                          {(() => {
                            const RoleUI = roleIcons[user.role] || roleIcons.student;
                            return (
                              <div className={cn("p-1.5 rounded-lg", RoleUI.color, "nm-inset")}>
                                <RoleUI.icon size={12} />
                              </div>
                            );
                          })()}
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">{user.role}</span>
                             <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">{user.department || "General"}</span>
                          </div>
                       </div>

                       {/* Status Badge - Inline on Mobile */}
                       <div className="md:hidden lg:block">
                          <span className={cn(
                            "inline-flex px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm",
                            user.is_active ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                          )}>
                            {user.is_active ? "active" : "inactive"}
                          </span>
                       </div>
                    </div>

                    {/* Status Placeholder for Tablet - Hidden on Desktop/Mobile row which already has it */}
                    <div className="hidden md:block lg:hidden">
                       {/* Status Badge only shows in this col on Tablet widths */}
                        <span className={cn(
                          "inline-flex px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm",
                          user.is_active ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                        )}>
                          {user.is_active ? "active" : "inactive"}
                        </span>
                    </div>
                    
                    {/* Desktop Status Col - Only for large screens where status isn't in role row */}
                    <div className="hidden lg:block">
                        {/* Status already rendered in role row for desktop via lg:block above */}
                    </div>

                    {/* Actions */}
                    <div className="absolute right-6 top-8 md:relative md:right-0 md:top-0 flex justify-end items-center">
                      <button 
                        ref={el => { buttonRefs.current[user.id] = el; }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === user.id ? null : user.id);
                        }}
                        className={cn(
                          "nm-convex p-3.5 rounded-2xl text-muted-foreground hover:nm-inset hover:text-primary transition-all active:scale-95 group/btn",
                          openMenuId === user.id && "nm-inset text-primary"
                        )}
                      >
                        <MoreVertical size={18} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Single Portal for Menu */}
      {openMenuId && menuPosition && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100]">
          <div 
            className="absolute inset-0 bg-transparent" 
            onClick={() => setOpenMenuId(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            style={{ 
              position: 'fixed',
              top: menuPosition.top,
              right: menuPosition.right,
            }}
            className="w-56 nm-flat bg-background rounded-3xl p-3 shadow-2xl border border-white/10 text-left"
          >
            {(() => {
              const activeUser = users.find(u => u.id === openMenuId);
              if (!activeUser) return null;
              
              return (
                <div className="space-y-1">
                  <button
                    onClick={() => handleToggleStatus(activeUser)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <Shield size={14} className={activeUser.is_active ? "text-rose-500" : "text-emerald-500"} />
                    <span>{activeUser.is_active ? "Deactivate User" : "Activate User"}</span>
                  </button>
                  
                  <div className="h-px bg-border/5 my-1" />
                  
                  <p className="px-4 py-2 text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Change Role</p>
                  {roles.filter(r => r !== "all" && r !== activeUser.role).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(activeUser.id, role as UserRole)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <ArrowRight size={14} />
                      <span>To {role}</span>
                    </button>
                  ))}

                  <div className="h-px bg-border/5 my-1" />

                  <button
                    onClick={() => handleDeleteUser(activeUser.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500/5 transition-colors"
                  >
                    <X size={14} />
                    <span>Delete Record</span>
                  </button>
                </div>
              );
            })()}
          </motion.div>
        </div>,
        document.body
      )}

      <AddUserDialog 
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={handleCreateUser}
      />

      <ConfirmationDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
