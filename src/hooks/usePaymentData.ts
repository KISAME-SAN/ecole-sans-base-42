import { useState } from 'react';
import { PaymentService, StudentPayment, ClassFees, TeacherPayment, PaymentFormData } from '@/types/payment';

export const usePaymentData = () => {
  const [services, setServices] = useState<PaymentService[]>([
    {
      id: '1',
      name: 'Transport',
      price: 25000,
      description: 'Service de transport scolaire',
      isRequired: false
    },
    {
      id: '2',
      name: 'Cantine',
      price: 15000,
      description: 'Restauration scolaire',
      isRequired: false
    },
    {
      id: '3',
      name: 'Bibliothèque',
      price: 5000,
      description: 'Accès à la bibliothèque',
      isRequired: false
    }
  ]);

  const [classFees, setClassFees] = useState<ClassFees[]>([]);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [teacherPayments, setTeacherPayments] = useState<TeacherPayment[]>([]);

  // Service management
  const addService = (service: Omit<PaymentService, 'id'>) => {
    const newService: PaymentService = {
      id: Date.now().toString(),
      ...service
    };
    setServices(prev => [...prev, newService]);
    return newService.id;
  };

  const updateService = (serviceId: string, updates: Partial<PaymentService>) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId ? { ...service, ...updates } : service
    ));
  };

  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
  };

  // Class fees management
  const setClassMonthlyFee = (classId: string, className: string, monthlyFee: number) => {
    setClassFees(prev => {
      const existing = prev.find(cf => cf.classId === classId);
      if (existing) {
        return prev.map(cf => 
          cf.classId === classId ? { ...cf, monthlyFee } : cf
        );
      } else {
        return [...prev, {
          id: Date.now().toString(),
          classId,
          className,
          monthlyFee,
          registrationFees: []
        }];
      }
    });
  };

  const addRegistrationFee = (classId: string, fee: Omit<ClassFees['registrationFees'][0], 'id'>) => {
    setClassFees(prev => prev.map(cf => 
      cf.classId === classId 
        ? { 
            ...cf, 
            registrationFees: [...cf.registrationFees, { ...fee, id: Date.now().toString() }] 
          }
        : cf
    ));
  };

  const removeRegistrationFee = (classId: string, feeId: string) => {
    setClassFees(prev => prev.map(cf => 
      cf.classId === classId 
        ? { 
            ...cf, 
            registrationFees: cf.registrationFees.filter(rf => rf.id !== feeId)
          }
        : cf
    ));
  };

  // Student payment management
  const createStudentPayment = (studentId: string, classId: string, month: string) => {
    const classFee = classFees.find(cf => cf.classId === classId);
    const monthlyFee = classFee?.monthlyFee || 0;
    
    const newPayment: StudentPayment = {
      id: Date.now().toString(),
      studentId,
      month,
      year: parseInt(month.split('-')[0]),
      classId,
      monthlyFee,
      services: [],
      additionalFees: [],
      totalAmount: monthlyFee,
      paidAmount: 0,
      remainingAmount: monthlyFee,
      isPaid: false
    };

    setStudentPayments(prev => [...prev, newPayment]);
    return newPayment.id;
  };

  const updateStudentPayment = (paymentId: string, data: Partial<StudentPayment>) => {
    setStudentPayments(prev => prev.map(payment => {
      if (payment.id === paymentId) {
        const updated = { ...payment, ...data };
        // Recalculate totals
        const servicesTotal = updated.services.reduce((sum, s) => sum + s.price, 0);
        const additionalFeesTotal = updated.additionalFees.reduce((sum, f) => sum + f.amount, 0);
        updated.totalAmount = updated.monthlyFee + servicesTotal + additionalFeesTotal;
        updated.remainingAmount = updated.totalAmount - updated.paidAmount;
        updated.isPaid = updated.remainingAmount <= 0;
        return updated;
      }
      return payment;
    }));
  };

  const addServiceToPayment = (paymentId: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    updateStudentPayment(paymentId, {
      services: [...(studentPayments.find(p => p.id === paymentId)?.services || []), {
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        isPaid: false
      }]
    });
  };

  const recordPayment = (paymentId: string, amount: number) => {
    const payment = studentPayments.find(p => p.id === paymentId);
    if (!payment) return;

    const newPaidAmount = payment.paidAmount + amount;
    updateStudentPayment(paymentId, {
      paidAmount: newPaidAmount,
      paymentDate: new Date().toISOString(),
      isPaid: newPaidAmount >= payment.totalAmount
    });
  };

  // Get payments by class and month
  const getPaymentsByClassAndMonth = (classId: string, month: string) => {
    return studentPayments.filter(p => p.classId === classId && p.month === month);
  };

  // Get class fees
  const getClassFees = (classId: string) => {
    return classFees.find(cf => cf.classId === classId);
  };

  return {
    services,
    classFees,
    studentPayments,
    teacherPayments,
    addService,
    updateService,
    deleteService,
    setClassMonthlyFee,
    addRegistrationFee,
    removeRegistrationFee,
    createStudentPayment,
    updateStudentPayment,
    addServiceToPayment,
    recordPayment,
    getPaymentsByClassAndMonth,
    getClassFees
  };
};