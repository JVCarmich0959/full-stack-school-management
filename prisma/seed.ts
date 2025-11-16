import { Day, PrismaClient, UserSex } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type CsvRow = {
  firstName: string;
  lastName: string;
  email: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  teacher?: string;
  testingId?: string;
  cleverId: string;
  gradeLevel: number;
  esparkUsername?: string;
  esparkPassword?: string;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "\"" && (i === 0 || line[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.replace(/^\"|\"$/g, ""));
}

function readStudentCsv(): CsvRow[] {
  const filePath = path.join(process.cwd(), "prisma", "data", "wsa_students.csv");

  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at ${filePath}`);
  }

  const csv = fs.readFileSync(filePath, "utf8");
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(headerLine);

  const rows: CsvRow[] = [];

  for (const rawLine of lines) {
    const cols = parseCsvLine(rawLine);
    const row: Record<string, string> = {};

    headers.forEach((header, idx) => {
      row[header.trim()] = (cols[idx] || "").trim();
    });

    const gradeRaw = row["student_grade_level"];
    const gradeLevel = gradeRaw === "K" ? 0 : parseInt(gradeRaw || "0", 10);

    rows.push({
      firstName: row["First Name"],
      lastName: row["Last Name"],
      email: row["Student Email"],
      guardianName: row["Parent/Guardian Name"] || undefined,
      guardianEmail: row["Parent/Guardian Email"] || undefined,
      guardianPhone: row["Parent/Guardian Phone"] || undefined,
      teacher: row["Teacher"] || undefined,
      testingId: row["Student_testing_ID"] || undefined,
      cleverId: row["student_Clever_ID"],
      gradeLevel,
      esparkUsername: row["eSpark_Username"] || undefined,
      esparkPassword: row["eSpark_Password"] || undefined,
    });
  }

  return rows;
}

function splitName(fullName?: string): { name: string; surname: string } {
  if (!fullName) {
    return { name: "Guardian", surname: "" };
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { name: parts[0], surname: "" };
  }

  const [name, ...rest] = parts;
  return { name, surname: rest.join(" ") };
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50) || "unknown";
}

async function seedAdmins() {
  const admins = [
    { id: "admin1", username: "admin1" },
    { id: "admin2", username: "admin2" },
  ];

  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { id: admin.id },
      update: admin,
      create: admin,
    });
  }
}

async function seedSubjects() {
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  for (const subject of subjectData) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: subject,
      create: subject,
    });
  }
}

async function seedTeachers(rows: CsvRow[]): Promise<Map<string, string>> {
  const teacherMap = new Map<string, string>();
  const teacherNames = new Set<string>(rows.map((row) => row.teacher).filter(Boolean) as string[]);

  // Ensure a handful of default teachers exist for lessons even if CSV is sparse
  for (let i = 1; i <= 5; i++) {
    teacherNames.add(`Teacher${i}`);
  }

  for (const teacherName of teacherNames) {
    const slug = toSlug(teacherName);
    const id = `teacher-${slug}`;
    const { name, surname } = splitName(teacherName || "Teacher");

    const teacher = await prisma.teacher.upsert({
      where: { id },
      update: { shortName: teacherName },
      create: {
        id,
        username: `teacher-${slug}`,
        name,
        surname: surname || "", 
        email: `${slug}@example.com`,
        phone: null,
        address: "Unknown",
        bloodType: "Unknown",
        sex: UserSex.MALE,
        shortName: teacherName,
        birthday: new Date("1990-01-01"),
      },
    });

    teacherMap.set(teacherName, teacher.id);
  }

  return teacherMap;
}

async function seedGrades(rows: CsvRow[]): Promise<Map<number, number>> {
  const gradeLevels = new Set<number>(rows.map((row) => row.gradeLevel));

  if (gradeLevels.size === 0) {
    for (let i = 1; i <= 6; i++) {
      gradeLevels.add(i);
    }
  }

  const gradeMap = new Map<number, number>();

  for (const level of gradeLevels) {
    const grade = await prisma.grade.upsert({
      where: { level },
      update: {},
      create: { level },
    });
    gradeMap.set(level, grade.id);
  }

  return gradeMap;
}

async function seedClasses(
  rows: CsvRow[],
  gradeMap: Map<number, number>,
  teacherMap: Map<string, string>
): Promise<Map<string, number>> {
  const classMap = new Map<string, number>();

  const labelForGrade = (gradeLevel: number) => (gradeLevel === 0 ? "K" : `${gradeLevel}`);

  for (const row of rows) {
    const gradeLevel = row.gradeLevel;
    const gradeId = gradeMap.get(gradeLevel);
    if (!gradeId) continue;

    const homeroom = row.teacher || "A";
    const classKey = `${gradeLevel}-${homeroom}`;
    if (classMap.has(classKey)) {
      continue;
    }

    const className = `${labelForGrade(gradeLevel)}-${toSlug(homeroom)}`;
    const supervisorId = row.teacher && teacherMap.get(row.teacher) ? teacherMap.get(row.teacher) : undefined;

    const classRecord = await prisma.class.upsert({
      where: { name: className },
      update: {},
      create: {
        name: className,
        gradeId,
        capacity: 30,
        supervisorId: supervisorId || null,
      },
    });

    classMap.set(classKey, classRecord.id);
  }

  if (classMap.size === 0) {
    // ensure at least one class exists
    const gradeId = gradeMap.values().next().value as number;
    const classRecord = await prisma.class.upsert({
      where: { name: "1-default" },
      update: {},
      create: { name: "1-default", gradeId, capacity: 30 },
    });
    classMap.set("1-default", classRecord.id);
  }

  return classMap;
}

async function seedParents(rows: CsvRow[]): Promise<Map<string, string>> {
  const parentMap = new Map<string, string>();

  for (const row of rows) {
    const key = row.guardianEmail || row.guardianPhone || row.guardianName || row.cleverId;
    const slug = toSlug(key);
    const id = `parent-${slug}`;

    if (parentMap.has(key)) {
      continue;
    }

    const { name, surname } = splitName(row.guardianName);

    const parent = await prisma.parent.upsert({
      where: { id },
      update: {
        name,
        surname,
        email: row.guardianEmail || null,
        phone: row.guardianPhone || null,
        address: "Unknown",
        username: `guardian-${slug}`,
      },
      create: {
        id,
        username: `guardian-${slug}`,
        name,
        surname,
        email: row.guardianEmail || null,
        phone: row.guardianPhone || null,
        address: "Unknown",
      },
    });

    parentMap.set(key, parent.id);
  }

  return parentMap;
}

async function seedStudentsFromCsv(
  rows: CsvRow[],
  gradeMap: Map<number, number>,
  classMap: Map<string, number>,
  parentMap: Map<string, string>
): Promise<string[]> {
  const studentIds: string[] = [];

  for (const [index, row] of rows.entries()) {
    const gradeId = gradeMap.get(row.gradeLevel);
    if (!gradeId) continue;

    const classKey = `${row.gradeLevel}-${row.teacher || "A"}`;
    const fallbackClassKey = classMap.keys().next().value as string;
    const classId = classMap.get(classKey) ?? classMap.get(fallbackClassKey);
    if (!classId) continue;

    const parentKey = row.guardianEmail || row.guardianPhone || row.guardianName || row.cleverId;
    const parentId = parentKey ? parentMap.get(parentKey) : undefined;
    if (!parentId) continue;

    const studentUsername = row.email?.split("@")[0] || `student-${row.cleverId}`;
    const fullNameLower = `${row.firstName} ${row.lastName}`.toLowerCase();
    const hasEsparkCreds = Boolean(row.esparkUsername || row.esparkPassword);

    const student = await prisma.student.upsert({
      where: { cleverId: row.cleverId },
      update: {
        firstName: row.firstName,
        lastName: row.lastName,
        name: row.firstName,
        surname: row.lastName,
        email: row.email,
        username: studentUsername,
        gradeLevel: row.gradeLevel,
        classId,
        gradeId,
        parentId,
        fullNameLower,
        testingId: row.testingId || null,
        esparkUsername: row.esparkUsername || null,
        esparkPassword: row.esparkPassword || null,
        hasEsparkCreds,
        guardianName: row.guardianName || null,
        guardianEmail: row.guardianEmail || null,
        guardianPhone: row.guardianPhone || null,
        homeroom: row.teacher || null,
      },
      create: {
        firstName: row.firstName,
        lastName: row.lastName,
        name: row.firstName,
        surname: row.lastName,
        email: row.email,
        username: studentUsername,
        id: row.cleverId,
        phone: null,
        address: "Unknown",
        bloodType: "Unknown",
        sex: index % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date("2010-01-01"),
        gradeLevel: row.gradeLevel,
        classId,
        gradeId,
        parentId,
        fullNameLower,
        cleverId: row.cleverId,
        testingId: row.testingId || null,
        esparkUsername: row.esparkUsername || null,
        esparkPassword: row.esparkPassword || null,
        hasEsparkCreds,
        guardianName: row.guardianName || null,
        guardianEmail: row.guardianEmail || null,
        guardianPhone: row.guardianPhone || null,
        homeroom: row.teacher || null,
      },
    });

    studentIds.push(student.id);
  }

  return studentIds;
}

async function seedLessons(teacherMap: Map<string, string>, classMap: Map<string, number>) {
  const teacherIds = Array.from(new Set(Array.from(teacherMap.values())));
  const classIds = Array.from(new Set(classMap.values()));
  const subjectIds = (await prisma.subject.findMany({ select: { id: true } })).map((s) => s.id);

  if (teacherIds.length === 0 || classIds.length === 0 || subjectIds.length === 0) {
    return;
  }

  const days = Object.keys(Day) as Array<keyof typeof Day>;

  for (let i = 0; i < 10; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson ${i + 1}`,
        day: Day[days[i % days.length]],
        startTime: new Date(new Date().setHours(9 + (i % 3))),
        endTime: new Date(new Date().setHours(10 + (i % 3))),
        subjectId: subjectIds[i % subjectIds.length],
        classId: classIds[i % classIds.length],
        teacherId: teacherIds[i % teacherIds.length],
      },
    });
  }
}

async function seedAssessmentsAndAttendance(studentIds: string[]) {
  const lessons = await prisma.lesson.findMany({ select: { id: true } });
  if (lessons.length === 0 || studentIds.length === 0) {
    return;
  }

  for (let i = 0; i < Math.min(5, lessons.length); i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i + 1}`,
        startTime: new Date(),
        endTime: new Date(),
        lessonId: lessons[i].id,
      },
    });

    await prisma.assignment.create({
      data: {
        title: `Assignment ${i + 1}`,
        startDate: new Date(),
        dueDate: new Date(),
        lessonId: lessons[i].id,
      },
    });
  }

  const exams = await prisma.exam.findMany({ select: { id: true } });
  const assignments = await prisma.assignment.findMany({ select: { id: true } });

  for (let i = 0; i < Math.min(studentIds.length, 10); i++) {
    const studentId = studentIds[i];
    if (exams[i]) {
      await prisma.result.create({
        data: {
          score: 90,
          studentId,
          examId: exams[i].id,
        },
      });
    }

    if (assignments[i]) {
      await prisma.result.create({
        data: {
          score: 85,
          studentId,
          assignmentId: assignments[i].id,
        },
      });
    }

    if (lessons[i]) {
      await prisma.attendance.create({
        data: {
          date: new Date(),
          present: true,
          studentId,
          lessonId: lessons[i].id,
        },
      });
    }
  }
}

async function seedEvents() {
  const classes = await prisma.class.findMany({ select: { id: true } });
  for (let i = 0; i < Math.min(5, classes.length || 1); i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i + 1}`,
        description: `Description for Event ${i + 1}`,
        startTime: new Date(),
        endTime: new Date(),
        classId: classes[i]?.id ?? null,
      },
    });

    await prisma.announcement.create({
      data: {
        title: `Announcement ${i + 1}`,
        description: `Description for Announcement ${i + 1}`,
        date: new Date(),
        classId: classes[i]?.id ?? null,
      },
    });
  }
}

async function resetData() {
  await prisma.$transaction([
    prisma.attendance.deleteMany(),
    prisma.result.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.exam.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.student.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.class.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.event.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.admin.deleteMany(),
  ]);
}

async function main() {
  const rows = readStudentCsv();

  await resetData();
  await seedAdmins();
  await seedSubjects();
  const teacherMap = await seedTeachers(rows);
  const gradeMap = await seedGrades(rows);
  const classMap = await seedClasses(rows, gradeMap, teacherMap);
  const parentMap = await seedParents(rows);
  const studentIds = await seedStudentsFromCsv(rows, gradeMap, classMap, parentMap);

  await seedLessons(teacherMap, classMap);
  await seedAssessmentsAndAttendance(studentIds);
  await seedEvents();

  console.log("Seeding completed successfully from CSV.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
