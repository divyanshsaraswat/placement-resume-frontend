export type ResumeStatus = "draft" | "submitted" | "approved" | "rejected";

export interface ResumeVersion {
  id: string;
  type: string; // SDE, Core, Marketing
  status: ResumeStatus;
  score: number;
  updatedAt: string;
  fileUrl?: string;
  studentName?: string;
  studentEmail?: string;
  department?: string;
}

export interface Resume {
  id: string;
  userId: string;
  versions: ResumeVersion[];
  defaultVersionId: string;
}

// Mock data for student side
export const mockResumes: Resume[] = [
  {
    id: "r1",
    userId: "u1",
    versions: [
      {
        id: "v1",
        type: "SDE",
        status: "approved",
        score: 85,
        updatedAt: "2024-03-15T10:00:00Z",
      },
      {
        id: "v2",
        type: "Data Science",
        status: "submitted",
        score: 72,
        updatedAt: "2024-03-16T14:30:00Z",
      },
      {
        id: "v3",
        type: "Product Manager",
        status: "draft",
        score: 0,
        updatedAt: "2024-03-17T09:15:00Z",
      },
    ],
    defaultVersionId: "v1",
  },
];

// Mock data for Faculty validation queue
export const mockValidationQueue: ResumeVersion[] = [
  {
    id: "v101",
    studentName: "Aditya Sharma",
    studentEmail: "aditya@mnit.ac.in",
    department: "CSE",
    type: "SDE",
    status: "submitted",
    score: 82,
    updatedAt: "2024-03-17T11:20:00Z",
  },
  {
    id: "v102",
    studentName: "Ishita Gupta",
    studentEmail: "ishita@mnit.ac.in",
    department: "ECE",
    type: "Core",
    status: "submitted",
    score: 65,
    updatedAt: "2024-03-17T12:05:00Z",
  },
  {
    id: "v103",
    studentName: "Rahul Verma",
    studentEmail: "rahul@mnit.ac.in",
    department: "MECH",
    type: "Marketing",
    status: "submitted",
    score: 71,
    updatedAt: "2024-03-17T13:45:00Z",
  },
  {
    id: "v104",
    studentName: "Sanya Malhotra",
    studentEmail: "sanya@mnit.ac.in",
    department: "CSE",
    type: "SDE",
    status: "rejected",
    score: 45,
    updatedAt: "2024-03-16T09:30:00Z",
  },
];
