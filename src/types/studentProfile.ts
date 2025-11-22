export type RawSubjectBenchmark = {
  subject?: string;
  student?: number | null;
  classAvg?: number | null;
};

export type RawSubjectAverage = {
  subject?: string;
  average?: number | null;
};

export type RawStudentProfile = {
  id?: string;
  name?: string;
  grade?: string | number;
  attendance?: number | null;
  metrics?: {
    attendance?: number | null;
  };
  subjectBenchmarks?: RawSubjectBenchmark[];
  topSubjects?: RawSubjectAverage[];
  contact?: {
    email?: string | null;
    phone?: string | null;
  };
};

export type SubjectBenchmark = {
  subject: string;
  student: number;
  classAvg: number;
};

export type CleanStudentProfile = {
  id: string;
  name: string;
  grade: string;
  attendance: number;
  subjects: SubjectBenchmark[];
  contact: {
    email: string | null;
    phone: string | null;
  };
  warnings: Array<{
    field: string;
    issue: string;
  }>;
};
