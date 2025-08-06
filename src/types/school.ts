
export interface Student {
  id: string;
  autoId: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  studentNumber?: string;
  parentPhone: string;
  classId: string;
  gender: 'male' | 'female';
}

export interface SchoolClass {
  id: string;
  name: string;
  studentCount: number;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  studentNumber: string;
  parentPhone: string;
  classId: string;
  gender: 'male' | 'female';
}
