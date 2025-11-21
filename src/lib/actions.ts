"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";

import prisma from "./prisma";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    if (data.supervisorId) {
      const existingClassWithSupervisor = await prisma.class.findFirst({
        where: { supervisorId: data.supervisorId },
      });

      if (existingClassWithSupervisor) {
        return { success: false, error: true };
      }
    }

    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    if (data.supervisorId) {
      const existingClassWithSupervisor = await prisma.class.findFirst({
        where: {
          supervisorId: data.supervisorId,
          NOT: { id: data.id },
        },
      });

      if (existingClassWithSupervisor) {
        return { success: false, error: true };
      }
    }

    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const teacherId = data.id ?? randomUUID();
    await prisma.teacher.create({
      data: {
        id: teacherId,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId, 10),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId, 10),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.teacher.delete({
      where: {
        id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const studentId = data.id ?? randomUUID();

    const gradeLevelFromGrade = await prisma.grade.findUnique({
      where: { id: data.gradeId },
      select: { level: true },
    });

    const firstName = data.name;
    const lastName = data.surname;
    const email =
      data.email?.trim() || `${data.username || studentId}@example.com`;
    const cleverId = data.cleverId?.trim() || `${studentId}-clever`;
    const testingId = data.testingId?.trim() || null;
    const esparkUsername = data.esparkUsername?.trim() || null;
    const esparkPassword = data.esparkPassword?.trim() || null;
    const hasEsparkCreds = Boolean(esparkUsername || esparkPassword);
    const guardianName = data.guardianName?.trim() || null;
    const guardianEmail = data.guardianEmail?.trim() || null;
    const guardianPhone = data.guardianPhone?.trim() || null;
    const homeroom = data.homeroom?.trim() || null;
    const gradeLevel = data.gradeLevel ?? gradeLevelFromGrade?.level ?? 0;

    await prisma.student.create({
      data: {
        id: studentId,
        username: data.username,
        name: data.name,
        surname: data.surname,
        firstName,
        lastName,
        email,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
        fullNameLower: `${firstName} ${lastName}`.toLowerCase(),
        gradeLevel,
        cleverId,
        testingId,
        esparkUsername,
        esparkPassword,
        hasEsparkCreds,
        guardianName,
        guardianEmail,
        guardianPhone,
        homeroom,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id: data.id },
      select: {
        cleverId: true,
        gradeLevel: true,
        email: true,
        firstName: true,
        lastName: true,
        hasEsparkCreds: true,
        testingId: true,
        esparkUsername: true,
        esparkPassword: true,
        guardianName: true,
        guardianEmail: true,
        guardianPhone: true,
        homeroom: true,
        gradeId: true,
      },
    });

    if (!existingStudent) {
      return { success: false, error: true };
    }

    const gradeLevelFromGrade =
      data.gradeId && data.gradeId !== existingStudent.gradeId
        ? await prisma.grade.findUnique({
            where: { id: data.gradeId },
            select: { level: true },
          })
        : null;

    const firstName = data.name || existingStudent.firstName;
    const lastName = data.surname || existingStudent.lastName;
    const email =
      data.email?.trim() ||
      existingStudent.email ||
      `${data.username}@example.com`;
    const cleverId = data.cleverId?.trim() || existingStudent.cleverId;
    const testingId = data.testingId?.trim() ?? existingStudent.testingId;
    const esparkUsername =
      data.esparkUsername?.trim() ?? existingStudent.esparkUsername;
    const esparkPassword =
      data.esparkPassword?.trim() ?? existingStudent.esparkPassword;
    const hasEsparkCreds = Boolean(esparkUsername || esparkPassword);
    const guardianName =
      data.guardianName?.trim() ?? existingStudent.guardianName;
    const guardianEmail =
      data.guardianEmail?.trim() ?? existingStudent.guardianEmail;
    const guardianPhone =
      data.guardianPhone?.trim() ?? existingStudent.guardianPhone;
    const homeroom = data.homeroom?.trim() ?? existingStudent.homeroom;
    const gradeLevel =
      data.gradeLevel ??
      gradeLevelFromGrade?.level ??
      existingStudent.gradeLevel;

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        firstName,
        lastName,
        email,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
        fullNameLower: `${firstName} ${lastName}`.toLowerCase(),
        gradeLevel,
        cleverId,
        testingId,
        esparkUsername,
        esparkPassword,
        hasEsparkCreds,
        guardianName,
        guardianEmail,
        guardianPhone,
        homeroom,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.student.delete({
      where: {
        id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
