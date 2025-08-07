export interface PaymentService {
  id: string;
  name: string;
  price: number;
  description?: string;
  isRequired: boolean;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  month: string; // Format: "YYYY-MM"
  year: number;
  classId: string;
  monthlyFee: number;
  services: {
    serviceId: string;
    serviceName: string;
    price: number;
    isPaid: boolean;
  }[];
  additionalFees: {
    id: string;
    name: string;
    amount: number;
    isPaid: boolean;
  }[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isPaid: boolean;
  paymentDate?: string;
}

export interface ClassFees {
  id: string;
  classId: string;
  className: string;
  monthlyFee: number;
  registrationFees: {
    id: string;
    name: string;
    amount: number;
    isRequired: boolean;
  }[];
}

export interface TeacherPayment {
  id: string;
  teacherId: string;
  month: string; // Format: "YYYY-MM"
  year: number;
  salary: number;
  bonuses: {
    id: string;
    name: string;
    amount: number;
  }[];
  deductions: {
    id: string;
    name: string;
    amount: number;
  }[];
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: string;
}

export interface PaymentFormData {
  studentId: string;
  month: string;
  services: string[];
  additionalFees: {
    name: string;
    amount: number;
  }[];
  paidAmount: number;
}