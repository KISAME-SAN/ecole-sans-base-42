import React, { useState, useEffect } from 'react';
import { Student, SchoolClass, StudentFormData } from '@/types/school';
import { useDatabase } from './useDatabase';

export const useSchoolData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [nextStudentId, setNextStudentId] = useState(1);
  const { db, isReady } = useDatabase();

  // Charger les données depuis la base de données
  useEffect(() => {
    if (isReady) {
      loadClassesFromDB();
      loadStudentsFromDB();
    }
  }, [isReady]);

  const loadClassesFromDB = () => {
    // Pour l'instant, chargement depuis localStorage
    try {
      const savedClasses = localStorage.getItem('school-classes');
      if (savedClasses) {
        const classesData = JSON.parse(savedClasses);
        setClasses(classesData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  };

  const loadStudentsFromDB = () => {
    // Pour l'instant, chargement depuis localStorage
    try {
      const savedStudents = localStorage.getItem('school-students');
      if (savedStudents) {
        const studentsData = JSON.parse(savedStudents);
        setStudents(studentsData);
        
        // Calculer le prochain ID étudiant
        const maxAutoId = studentsData.reduce((max: number, student: Student) => 
          Math.max(max, student.autoId || 0), 0);
        setNextStudentId(maxAutoId + 1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    }
  };

  // Class management - retour au localStorage temporairement
  const addClass = (className: string) => {
    const newClass: SchoolClass = {
      id: Date.now().toString(),
      name: className,
      studentCount: 0
    };
    
    setClasses(prev => {
      const updated = [...prev, newClass];
      localStorage.setItem('school-classes', JSON.stringify(updated));
      return updated;
    });
    return newClass.id;
  };

  const deleteClass = (classId: string) => {
    setClasses(prev => {
      const updated = prev.filter(c => c.id !== classId);
      localStorage.setItem('school-classes', JSON.stringify(updated));
      return updated;
    });
    setStudents(prev => {
      const updated = prev.filter(s => s.classId !== classId);
      localStorage.setItem('school-students', JSON.stringify(updated));
      return updated;
    });
  };

  // Student management - retour au localStorage temporairement
  const addStudent = (studentData: StudentFormData) => {
    const newStudent: Student = {
      id: Date.now().toString(),
      autoId: nextStudentId,
      ...studentData
    };
    
    setNextStudentId(prev => prev + 1);
    setStudents(prev => {
      const updated = [...prev, newStudent];
      localStorage.setItem('school-students', JSON.stringify(updated));
      
      // Mettre à jour le comptage immédiatement
      setClasses(current => {
        const updatedClasses = current.map(c => 
          c.id === studentData.classId 
            ? { ...c, studentCount: updated.filter(s => s.classId === c.id).length }
            : c
        );
        localStorage.setItem('school-classes', JSON.stringify(updatedClasses));
        return updatedClasses;
      });
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
      localStorage.setItem('school-students', JSON.stringify(updated));
      
      // Mettre à jour les comptages
      setClasses(current => {
        const updatedClasses = current.map(c => ({
          ...c,
          studentCount: updated.filter(s => s.classId === c.id).length
        }));
        localStorage.setItem('school-classes', JSON.stringify(updatedClasses));
        return updatedClasses;
      });
      return updated;
    });
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== studentId);
      localStorage.setItem('school-students', JSON.stringify(updated));
      
      // Mettre à jour les comptages
      setClasses(current => {
        const updatedClasses = current.map(c => ({
          ...c,
          studentCount: updated.filter(s => s.classId === c.id).length
        }));
        localStorage.setItem('school-classes', JSON.stringify(updatedClasses));
        return updatedClasses;
      });
      return updated;
    });
  };

  const updateClassName = (classId: string, newName: string) => {
    setClasses(prev => {
      const updated = prev.map(c => 
        c.id === classId ? { ...c, name: newName } : c
      );
      localStorage.setItem('school-classes', JSON.stringify(updated));
      return updated;
    });
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