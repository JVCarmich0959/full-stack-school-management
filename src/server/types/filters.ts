export type GuardianFilter = "complete" | "missing";

export type ParentFilters = {
  grade?: number;
  homeroom?: string;
  guardian?: GuardianFilter;
};

export type TeacherFilters = {
  classId?: number;
};

export type StudentFilters = {
  grade?: number;
  teacherId?: string;
};
