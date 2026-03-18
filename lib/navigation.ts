import { 
  LayoutDashboard, 
  FileText, 
  UserCheck, 
  Settings, 
  ShieldCheck, 
  Users, 
  History,
  Sparkles
} from "lucide-react";
import { UserRole } from "@/types/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

export const dashboardNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["student", "faculty", "spc", "admin"],
  },
  {
    title: "My Resumes",
    href: "/dashboard/student/resumes",
    icon: FileText,
    roles: ["student"],
  },
  {
    title: "Validation Queue",
    href: "/dashboard/faculty/validate",
    icon: UserCheck,
    roles: ["faculty"],
  },
  {
    title: "Validation Queue",
    href: "/dashboard/spc/validate",
    icon: UserCheck,
    roles: ["spc"],
  },
  {
    title: "Students",
    href: "/dashboard/spc/students",
    icon: Users,
    roles: ["spc"],
  },
  {
    title: "Placement Analytics",
    href: "/dashboard/admin/students",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Audit Logs",
    href: "/dashboard/admin/logs",
    icon: History,
    roles: ["admin"],
  },
  {
    title: "User Management",
    href: "/dashboard/admin/users",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["student", "faculty", "spc", "admin"],
  },
];
