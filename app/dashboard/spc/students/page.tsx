'use client'
import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Eye, Clock, Users, ArrowRight, Loader2, SlidersHorizontal, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Metallurgical & Materials Engineering",
];

export default function SPCStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"year" | "branch">("year");
  const [filters, setFilters] = useState({
    year: undefined as number | undefined,
    department: undefined as string | undefined,
  });

  const debouncedSearch = useDebounce(search, 500);

  const fetchStudents = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await adminApi.getStudents({
        search: debouncedSearch,
        year: filters.year,
        department: filters.department
      }, signal);
      setStudents(data);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error(err);
      toast.error("Failed to load students list");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStudents(controller.signal);
    return () => controller.abort();
  }, [fetchStudents]);

  const statusColors: Record<string, string> = {
    approved: "text-emerald-500 bg-emerald-500/10",
    submitted: "text-amber-500 bg-amber-500/10",
    rejected: "text-rose-500 bg-rose-500/10",
    draft: "text-slate-500 bg-slate-500/10",
    not_created: "text-slate-400 bg-slate-400/5",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-display font-bold text-primary">Student Tracking</h1>
        <p className="text-muted-foreground font-light text-lg">Monitor student resume progress and validation status across all departments.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Students", value: students.length > 0 ? "248" : "0", icon: Users, color: "text-primary" },
          { label: "Validated", value: students.length > 0 ? "156" : "0", icon: CheckCircle, color: "text-emerald-500" },
          { label: "Pending", value: students.length > 0 ? "42" : "0", icon: Clock, color: "text-amber-500" },
          { label: "Not Started", value: students.length > 0 ? "50" : "0", icon: XCircle, color: "text-slate-400" },
        ].map((stat, i) => (
          <div key={i} className="nm-flat p-6 rounded-3xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
            </div>
            <div className={cn("nm-inset p-3 rounded-xl", stat.color)}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Tracking Section */}
      <div className="nm-flat rounded-[3rem] p-8 space-y-8 relative">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="w-full md:w-96 nm-inset px-6 py-3 rounded-2xl flex items-center gap-4">
            <Search size={18} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search students, departments..." 
              className="bg-transparent border-none outline-none w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4 relative">
             <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "nm-convex px-6 py-3 rounded-2xl flex items-center gap-2 text-sm transition-all h-12",
                (filters.year || filters.department) ? "text-primary nm-inset" : "text-muted-foreground hover:nm-inset"
              )}
             >
               <Filter size={18} />
               <span>Filters</span>
             </button>
             
             {/* Filter Dialog */}
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
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-16 right-0 w-80 nm-flat bg-background rounded-[2rem] p-6 z-50 space-y-6 shadow-2xl overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-border/10 pb-4">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal size={14} className="text-primary" />
                          <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                        </div>
                        <div className="flex nm-inset p-1 rounded-xl">
                          <button 
                            onClick={() => setActiveTab("year")}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                              activeTab === "year" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
                            )}
                          >
                            Year
                          </button>
                          <button 
                            onClick={() => setActiveTab("branch")}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                              activeTab === "branch" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
                            )}
                          >
                            Branch
                          </button>
                        </div>
                      </div>

                      <div className="min-h-[180px]">
                        <AnimatePresence mode="wait">
                          {activeTab === "year" ? (
                            <motion.div 
                              key="year-tab"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="space-y-4"
                            >
                              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Select Academic Year</p>
                              <div className="grid grid-cols-2 gap-3">
                                {[3, 4].map(y => (
                                  <button 
                                    key={y}
                                    onClick={() => setFilters(f => ({ ...f, year: f.year === y ? undefined : y }))}
                                    className={cn(
                                      "py-4 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1",
                                      filters.year === y ? "nm-inset text-primary" : "nm-convex text-muted-foreground hover:text-primary"
                                    )}
                                  >
                                    <span className="text-lg">{y}</span>
                                    <span>{y === 3 ? "3rd" : "4th"} Year</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="branch-tab"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar"
                            >
                              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Select Department</p>
                              <div className="space-y-2">
                                {DEPARTMENTS.map(dept => (
                                  <button 
                                    key={dept}
                                    onClick={() => setFilters(f => ({ ...f, department: f.department === dept ? undefined : dept }))}
                                    className={cn(
                                      "w-full px-4 py-3 rounded-xl text-[10px] text-left font-bold transition-all",
                                      filters.department === dept ? "nm-inset text-primary" : "nm-convex text-muted-foreground hover:text-primary"
                                    )}
                                  >
                                    {dept}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-border/10">
                        <button 
                          onClick={() => setFilters({ year: undefined, department: undefined })}
                          className="text-[10px] text-muted-foreground hover:text-primary font-bold uppercase tracking-wider"
                        >
                          Reset
                        </button>
                        <button 
                          onClick={() => setIsFilterOpen(false)}
                          className="nm-primary px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-slate-200" size={32} />
            <p className="text-xs text-slate-300 font-light">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-40">
            <Users size={48} strokeWidth={0.5} />
            <p className="text-sm font-light">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                  <th className="px-6 py-2">Student</th>
                  <th className="px-6 py-2">Department</th>
                  <th className="px-6 py-2 text-center">Score</th>
                  <th className="px-6 py-2">Status</th>
                  <th className="px-6 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="nm-flat bg-background hover:scale-[1.01] transition-transform cursor-pointer group"
                  >
                    <td className="px-6 py-5 rounded-l-[1.5rem]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {student.name?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-xs font-medium">{student.department}</p>
                        <p className="text-[10px] text-muted-foreground">{student.year}rd Year</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-lg font-display font-medium text-primary">
                        {student.resumeScore > 0 ? `${student.resumeScore}%` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        statusColors[student.status] || statusColors.not_created
                      )}>
                        {student.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right rounded-r-[1.5rem]">
                       <Link href={`/dashboard/faculty/validate/`}>
                          <button className="nm-convex p-3 rounded-xl text-primary hover:nm-inset transition-all" title="View Student Profile">
                            <Eye size={18} />
                          </button>
                        </Link>
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
