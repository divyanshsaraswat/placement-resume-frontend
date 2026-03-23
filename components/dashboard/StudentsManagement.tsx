'use client'
import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Eye, Clock, Users, Loader2, SlidersHorizontal, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/context/auth-context";

const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Metallurgical and Materials Engineering",
  "Artificial Intelligence and Data Engineering",
  "Architecture and Planning",
];

export function StudentsManagement() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"year" | "branch">("year");
  const [filters, setFilters] = useState({
    years: [] as number[],
    departments: [] as string[],
  });

  const debouncedSearch = useDebounce(search, 500);

  const fetchStudents = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const [studentsData, analyticsData] = await Promise.all([
        adminApi.getStudents({
          search: debouncedSearch,
          year: filters.years.length > 0 ? filters.years : undefined,
          department: filters.departments.length > 0 ? filters.departments : undefined
        }, signal),
        adminApi.getStudentAnalytics(signal)
      ]);
      setStudents(studentsData);
      setAnalytics(analyticsData);
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

  const activeFiltersCount = filters.years.length + filters.departments.length;

  const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
    approved: { color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    submitted: { color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    rejected: { color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    draft: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
    not_created: { color: "text-slate-400", bg: "bg-slate-400/5", border: "border-slate-400/20" },
  };

  const statCards = [
    { label: "Total Students", value: analytics?.total_students?.toString() || "0", icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Validated", value: analytics?.status_distribution?.approved?.toString() || "0", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Pending", value: analytics?.status_distribution?.submitted?.toString() || "0", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Not Started", value: analytics?.status_distribution?.not_created?.toString() || "0", icon: XCircle, color: "text-slate-400", bg: "bg-slate-400/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Student Management
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-800 dark:text-white">
            Student Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
            Monitor student resume progress and validation status across all departments.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "p-4 sm:p-5 flex flex-col items-center justify-center bg-white dark:bg-slate-900/40 text-center",
              i === 0 && "border-b border-r lg:border-b-0 border-slate-100 dark:border-slate-800",
              i === 1 && "border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800",
              i === 2 && "border-r border-slate-100 dark:border-slate-800",
            )}
          >
            <div className={cn("inline-flex p-1.5 sm:p-2 rounded-lg mb-2", stat.bg)}>
              <stat.icon size={14} className={stat.color} strokeWidth={2} />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-white leading-none">
              {stat.value}
            </p>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 mt-1.5">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="rounded-lg bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
          {/* Search */}
          <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 focus-within:border-primary/40 transition-colors">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search students, departments..." 
              className="bg-transparent w-full text-sm font-light placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none border-none focus:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Action row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "w-full sm:w-auto px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                activeFiltersCount > 0 ? "border-primary/30 bg-primary/5 text-primary" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/30 hover:text-primary"
              )}
            >
              <Filter size={14} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-full shrink-0">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="hidden sm:block sm:flex-1" />
          </div>
        </div>

        {/* Filter Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,22rem)] bg-white dark:bg-slate-900 rounded-2xl p-5 z-50 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800"
              >
                {/* Filter header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={13} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">Filters</span>
                  </div>
                  {/* Tab Toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                      onClick={() => setActiveTab("year")}
                      className={cn(
                        "px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                        activeTab === "year" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Year
                    </button>
                    <button 
                      onClick={() => setActiveTab("branch")}
                      className={cn(
                        "px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                        activeTab === "branch" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Branch
                    </button>
                  </div>
                </div>

                {/* Filter content */}
                <AnimatePresence mode="wait">
                  {activeTab === "year" ? (
                    <motion.div 
                      key="year-tab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-3"
                    >
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex justify-between">
                        <span>Academic Years</span>
                        {filters.years.length > 0 && <span className="text-primary">{filters.years.length} selected</span>}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5].map(y => (
                          <button 
                            key={y}
                            onClick={() => setFilters(f => ({ 
                              ...f, 
                              years: f.years.includes(y) ? f.years.filter(year => year !== y) : [...f.years, y] 
                            }))}
                            className={cn(
                              "py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5",
                              filters.years.includes(y) ? "bg-primary/10 text-primary border border-primary/30" : "bg-slate-50 dark:bg-slate-800 text-slate-500 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            )}
                          >
                            <span className="text-lg font-bold">{y}</span>
                            <span className="text-[9px]">{y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : y === 4 ? "4th" : "5th"} Year</span>
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
                      className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar"
                    >
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex justify-between mb-3">
                        <span>Departments</span>
                        {filters.departments.length > 0 && <span className="text-primary">{filters.departments.length} selected</span>}
                      </p>
                      {DEPARTMENTS.map(dept => (
                        <button 
                          key={dept}
                          onClick={() => setFilters(f => ({ 
                            ...f, 
                            departments: f.departments.includes(dept) ? f.departments.filter(d => d !== dept) : [...f.departments, dept] 
                          }))}
                          className={cn(
                            "w-full px-4 py-3 rounded-lg text-[11px] text-left font-semibold transition-all border",
                            filters.departments.includes(dept) ? "bg-primary/5 text-primary border-primary/20" : "text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          {dept}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter footer */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setFilters({ years: [], departments: [] })}
                    className="text-[10px] text-slate-400 hover:text-rose-500 font-bold uppercase tracking-wider transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="px-6 py-2 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Table / Content */}
        {isLoading ? (
          <div className="h-72 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-800" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-5">
            <div className="w-20 h-20 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
              <Users size={32} strokeWidth={1} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No students found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-light">
                Try adjusting your search or filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-b-lg">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold">Student</th>
                  <th className="px-5 py-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold">Department</th>
                  <th className="px-5 py-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-center">Score</th>
                  <th className="px-5 py-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold">Status</th>
                  <th className="px-5 py-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {students.map((student, i) => {
                  const sc = statusConfig[student.status] || statusConfig.not_created;
                  return (
                    <motion.tr 
                      key={student.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px] shrink-0 uppercase overflow-hidden">
                            {student.picture ? (
                              <img src={student.picture} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              (() => {
                                const names = student.name?.trim().split(/\s+/) || [];
                                if (names.length === 0) return "?";
                                if (names.length === 1) return names[0][0];
                                return names[0][0] + names[names.length - 1][0];
                              })()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{student.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]" title={student.department || "Not Assigned"}>
                            {student.department || "Not Assigned"}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {student.year ? (
                                student.year === 1 ? "1st" : 
                                student.year === 2 ? "2nd" : 
                                student.year === 3 ? "3rd" : 
                                student.year === 4 ? "4th" : 
                                student.year === 5 ? "5th" : `${student.year}th`
                            ) + " Year" : "Year Not Set"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {student.score > 0 ? `${student.score}%` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] border whitespace-nowrap",
                          sc.bg, sc.color, sc.border
                        )}>
                          {student.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {student.resume_id ? (
                          <Link href={`/dashboard/${user?.role === 'spc' ? 'spc' : 'faculty'}/validate/${student.resume_id}`}>
                            <button className="p-2 rounded-lg text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all" title="View Primary Resume">
                              <Eye size={15} />
                            </button>
                          </Link>
                        ) : (
                          <button 
                            disabled 
                            className="p-2 rounded-lg text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed" 
                            title="No resume created"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
