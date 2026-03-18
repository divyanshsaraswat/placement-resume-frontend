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

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, right: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers(roleFilter === "all" ? undefined : roleFilter, signal);
      
      // Local search filtering if backend doesn't support it for this specific endpoint yet
      // (Backend read_users doesn't support search yet, so we filter locally for now)
      const filtered = data.filter((u: any) => 
        u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
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
      // Position the menu to the left of the button
      setMenuPosition({
        top: rect.top,
        right: window.innerWidth - rect.left + 12
      });
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
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    } finally {
      setOpenMenuId(null);
    }
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
        <button className="nm-primary h-14 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl whitespace-nowrap">
          <UserPlus size={20} />
          <span>Add User</span>
        </button>
      </div>

      <div className="nm-flat rounded-[3.5rem] p-8 pb-16 space-y-8 min-h-[500px]">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="w-full md:w-96 nm-inset px-6 py-4 rounded-3xl flex items-center gap-4">
            <Search size={18} className="text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, email, department..." 
              className="bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 focus:border-primary outline-none w-full text-sm font-medium transition-all rounded-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4 relative">
             <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "nm-convex px-8 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold transition-all",
                roleFilter !== "all" ? "text-primary nm-inset" : "text-muted-foreground hover:nm-inset"
              )}
             >
               <Filter size={18} />
               <span>{roleFilter === "all" ? "Filter Role" : roleFilter.toUpperCase()}</span>
             </button>

             <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsFilterOpen(false)}
                      className="fixed inset-0 z-40 bg-black/5"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-16 right-0 w-64 nm-flat bg-background rounded-3xl p-4 z-50 shadow-2xl border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-4 px-2 text-primary">
                        <SlidersHorizontal size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Filter by Role</span>
                      </div>
                      <div className="space-y-1">
                        {roles.map(r => (
                          <button
                            key={r}
                            onClick={() => {
                              setRoleFilter(r);
                              setIsFilterOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all",
                              roleFilter === r ? "nm-inset text-primary" : "hover:bg-slate-50 dark:hover:bg-slate-900 text-muted-foreground"
                            )}
                          >
                            <span className="capitalize">{r === "all" ? "All Users" : r}</span>
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
          <div className="overflow-x-auto custom-scrollbar overflow-y-visible">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-500/60 dark:text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-8 py-2">User</th>
                  <th className="px-8 py-2">Role & Department</th>
                  <th className="px-8 py-2">Status</th>
                  <th className="px-8 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="nm-flat bg-background hover:scale-[1.005] transition-all cursor-pointer group"
                  >
                    <td className="px-8 py-6 rounded-l-[2rem]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full nm-inset flex items-center justify-center text-primary font-bold text-sm bg-gradient-to-br from-primary/5 to-transparent">
                          {user.name?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         {(() => {
                           const RoleUI = roleIcons[user.role] || roleIcons.student;
                           return (
                             <div className={cn("nm-inset p-2 rounded-lg", RoleUI.color)}>
                               <RoleUI.icon size={14} />
                             </div>
                           );
                         })()}
                         <div className="flex flex-col">
                            <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">{user.role}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{user.department || "General"}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm",
                        user.is_active ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                      )}>
                        {user.is_active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right rounded-r-[2rem]">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          ref={el => { buttonRefs.current[user.id] = el; }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === user.id ? null : user.id);
                          }}
                          className={cn(
                            "nm-convex p-3 rounded-2xl text-muted-foreground hover:nm-inset hover:text-primary transition-all active:scale-90",
                            openMenuId === user.id && "nm-inset text-primary"
                          )}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Portal-based Menu */}
                        {openMenuId === user.id && menuPosition && typeof document !== 'undefined' && createPortal(
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
                              <div className="space-y-1">
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                  <Shield size={14} className={user.is_active ? "text-rose-500" : "text-emerald-500"} />
                                  <span>{user.is_active ? "Deactivate User" : "Activate User"}</span>
                                </button>
                                
                                <div className="h-px bg-border/5 my-1" />
                                
                                <p className="px-4 py-2 text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Change Role</p>
                                {roles.filter(r => r !== "all" && r !== user.role).map(role => (
                                  <button
                                    key={role}
                                    onClick={() => handleRoleChange(user.id, role as UserRole)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                                  >
                                    <ArrowRight size={14} />
                                    <span>To {role}</span>
                                  </button>
                                ))}

                                <div className="h-px bg-border/5 my-1" />

                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500/5 transition-colors"
                                >
                                  <X size={14} />
                                  <span>Delete Record</span>
                                </button>
                              </div>
                            </motion.div>
                          </div>,
                          document.body
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
