import { useState, useEffect } from 'react';
import { Student, SchoolClass, StudentFormData } from '@/types/school';
import DatabaseService from '@/services/database';

export const useSchoolData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [nextStudentId, setNextStudentId] = useState(1);
  const db = DatabaseService.getInstance();

  // Charger les données depuis la base de données
  useEffect(() => {
    loadClassesFromDB();
    loadStudentsFromDB();
  }, []);

  const loadClassesFromDB = () => {
    try {
      const classesData = db.query('SELECT * FROM classes ORDER BY name');
      setClasses(classesData);
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  };

  const loadStudentsFromDB = () => {
    try {
      const studentsData = db.query('SELECT * FROM students ORDER BY lastName, firstName');
      setStudents(studentsData);
      
      // Calculer le prochain ID étudiant
      const maxAutoId = studentsData.reduce((max: number, student: Student) => 
        Math.max(max, student.autoId || 0), 0);
      setNextStudentId(maxAutoId + 1);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    }
  };

  // Class management
  const addClass = (className: string) => {
    const newClass: SchoolClass = {
      id: Date.now().toString(),
      name: className,
      studentCount: 0
    };
    
    try {
      db.execute(
        'INSERT INTO classes (id, name, studentCount) VALUES (?, ?, ?)',
        [newClass.id, newClass.name, newClass.studentCount]
      );
      setClasses(prev => [...prev, newClass]);
      return newClass.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la classe:', error);
      throw error;
    }
  };

  const deleteClass = (classId: string) => {
    try {
      db.execute('DELETE FROM classes WHERE id = ?', [classId]);
      setClasses(prev => prev.filter(c => c.id !== classId));
      setStudents(prev => prev.filter(s => s.classId !== classId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la classe:', error);
      throw error;
    }
  };

  // Student management
  const addStudent = (studentData: StudentFormData) => {
    const newStudent: Student = {
      id: Date.now().toString(),
      autoId: nextStudentId,
      ...studentData
    };
    
    try {
      db.execute(
        'INSERT INTO students (id, autoId, firstName, lastName, birthDate, birthPlace, studentNumber, parentPhone, gender, classId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newStudent.id, newStudent.autoId, newStudent.firstName, newStudent.lastName, newStudent.birthDate, newStudent.birthPlace, newStudent.studentNumber || '', newStudent.parentPhone, newStudent.gender, newStudent.classId]
      );
      
      setNextStudentId(prev => prev + 1);
      setStudents(prev => [...prev, newStudent]);
      
      // Mettre à jour le comptage des étudiants
      updateClassStudentCountInDB(studentData.classId);
      
      return newStudent.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
      throw error;
    }
  };

  const updateStudent = (studentId: string, studentData: StudentFormData) => {
    const oldStudent = students.find(s => s.id === studentId);
    
    try {
      db.execute(
        'UPDATE students SET firstName = ?, lastName = ?, birthDate = ?, birthPlace = ?, studentNumber = ?, parentPhone = ?, gender = ?, classId = ? WHERE id = ?',
        [studentData.firstName, studentData.lastName, studentData.birthDate, studentData.birthPlace, studentData.studentNumber, studentData.parentPhone, studentData.gender, studentData.classId, studentId]
      );
      
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, ...studentData } : s
      ));
      
      // Mettre à jour les comptages si la classe a changé
      if (oldStudent && oldStudent.classId !== studentData.classId) {
        updateClassStudentCountInDB(oldStudent.classId);
        updateClassStudentCountInDB(studentData.classId);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
      throw error;
    }
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    
    try {
      db.execute('DELETE FROM students WHERE id = ?', [studentId]);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      
      if (student) {
        updateClassStudentCountInDB(student.classId);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'étudiant:', error);
      throw error;
    }
  };

  const updateClassStudentCountInDB = (classId: string) => {
    try {
      const count = db.queryOne('SELECT COUNT(*) as count FROM students WHERE classId = ?', [classId]);
      db.execute('UPDATE classes SET studentCount = ? WHERE id = ?', [count.count, classId]);
      
      setClasses(prev => prev.map(c => 
        c.id === classId ? { ...c, studentCount: count.count } : c
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du comptage:', error);
    }
  };

  const updateClassName = (classId: string, newName: string) => {
    try {
      db.execute('UPDATE classes SET name = ? WHERE id = ?', [newName, classId]);
      setClasses(prev => prev.map(c => 
        c.id === classId ? { ...c, name: newName } : c
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom de classe:', error);
      throw error;
    }
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