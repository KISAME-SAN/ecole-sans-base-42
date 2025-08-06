import { useState } from 'react';
import { Student, SchoolClass, StudentFormData } from '@/types/school';

export const useSchoolData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [nextStudentId, setNextStudentId] = useState(1);

  // Class management
  const addClass = (className: string) => {
    const newClass: SchoolClass = {
      id: Date.now().toString(),
      name: className,
      studentCount: 0
    };
    setClasses(prev => [...prev, newClass]);
    return newClass.id;
  };

  const deleteClass = (classId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    setStudents(prev => prev.filter(s => s.classId !== classId));
  };

  // Student management
  const addStudent = (studentData: StudentFormData) => {
    const newStudent: Student = {
      id: Date.now().toString(),
      autoId: nextStudentId,
      ...studentData
    };
    setNextStudentId(prev => prev + 1);
    setStudents(prev => {
      const updated = [...prev, newStudent];
      // Mettre à jour le comptage immédiatement
      setClasses(current => current.map(c => 
        c.id === studentData.classId 
          ? { ...c, studentCount: updated.filter(s => s.classId === c.id).length }
          : c
      ));
      return updated;
    });
    return newStudent.id;
  };

  const updateStudent = (studentId: string, studentData: StudentFormData) => {
    const oldStudent = students.find(s => s.id === studentId);
    setStudents(prev => {
      const updated = prev.map(s => 
        s.id === studentId ? { ...s, ...studentData } : s
      );
      // Mettre à jour les comptages
      setClasses(current => current.map(c => ({
        ...c,
        studentCount: updated.filter(s => s.classId === c.id).length
      })));
      return updated;
    });
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== studentId);
      // Mettre à jour les comptages
      setClasses(current => current.map(c => ({
        ...c,
        studentCount: updated.filter(s => s.classId === c.id).length
      })));
      return updated;
    });
  };

  const updateClassStudentCount = (classId: string) => {
    setClasses(prev => prev.map(c => 
      c.id === classId 
        ? { ...c, studentCount: students.filter(s => s.classId === classId).length }
        : c
    ));
  };

  const updateClassName = (classId: string, newName: string) => {
    setClasses(prev => prev.map(c => 
      c.id === classId ? { ...c, name: newName } : c
    ));
  };

  const getStudentsByClass = (classId: string) => {
    return students.filter(s => s.classId === classId);
  };

  return {
    students,
    classes,
    nextStudentId,
    addClass,
    deleteClass,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    updateClassName
  };
};