
import { useState } from 'react';
import { Teacher, TeacherFormData } from '@/types/teacher';
import { useScheduleData } from './useScheduleData';

export const useTeacherData = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [nextTeacherId, setNextTeacherId] = useState(1);
  const { getScheduleByTeacher, deleteTeacherSchedule } = useScheduleData();

  const addTeacher = (teacherData: TeacherFormData) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: Date.now().toString(),
      autoId: nextTeacherId,
      schedule: []
    };
    setNextTeacherId(prev => prev + 1);
    setTeachers(prev => [...prev, newTeacher]);
  };

  const updateTeacher = (id: string, updatedData: Partial<Teacher>) => {
    setTeachers(prev => prev.map(teacher => 
      teacher.id === id ? { ...teacher, ...updatedData } : teacher
    ));
  };

  const deleteTeacher = (id: string) => {
    // Supprimer aussi l'emploi du temps du professeur
    deleteTeacherSchedule(id);
    setTeachers(prev => prev.filter(teacher => teacher.id !== id));
  };

  const getTeacherWithSchedule = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
      return {
        ...teacher,
        schedule: getScheduleByTeacher(id)
      };
    }
    return null;
  };

  return {
    teachers,
    nextTeacherId,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherWithSchedule
  };
};
