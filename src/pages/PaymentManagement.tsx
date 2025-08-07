import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import { SchoolClass, Student } from "@/types/school";
import { Teacher } from "@/types/teacher";
import StudentPayments from "@/pages/StudentPayments";

interface PaymentManagementProps {
  classes: SchoolClass[];
  students: Student[];
  teachers: Teacher[];
  getStudentsByClass: (classId: string) => Student[];
}

export default function PaymentManagement({ 
  classes, 
  students, 
  teachers, 
  getStudentsByClass 
}: PaymentManagementProps) {
  const [paymentType, setPaymentType] = useState<'student' | 'teacher' | ''>('');

  const handlePaymentTypeSelect = (type: 'student' | 'teacher') => {
    setPaymentType(type);
  };

  // Vue de gestion des paiements des étudiants
  if (paymentType === 'student') {
    return (
      <StudentPayments
        classes={classes}
        students={students}
        getStudentsByClass={getStudentsByClass}
        onBack={() => setPaymentType('')}
      />
    );
  }

  // Vue de gestion des paiements des professeurs (à implémenter)
  if (paymentType === 'teacher') {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <UserCheck className="h-6 w-6" />
              Gestion des salaires des professeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fonctionnalité en cours de développement</h3>
              <p className="text-muted-foreground mb-6">La gestion des salaires des professeurs sera bientôt disponible.</p>
              <Button onClick={() => setPaymentType('')} variant="outline">
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Gestion des paiements
        </h1>
      </div>

      {/* Sélection du type de paiement */}
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="text-2xl text-center text-primary">
            Sélectionner le type de gestion
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => handlePaymentTypeSelect('student')}
              className="h-40 flex flex-col gap-4 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 hover:scale-105 transition-all duration-300 group"
            >
              <Users className="h-16 w-16 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-xl font-bold text-primary">Paiements élèves</div>
                <div className="text-sm text-muted-foreground mt-2">Gérer les frais scolaires et services</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => handlePaymentTypeSelect('teacher')}
              className="h-40 flex flex-col gap-4 border-2 border-accent/20 hover:border-accent hover:bg-accent/5 hover:scale-105 transition-all duration-300 group"
            >
              <UserCheck className="h-16 w-16 text-accent group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-xl font-bold text-accent">Salaires professeurs</div>
                <div className="text-sm text-muted-foreground mt-2">Gérer les salaires du personnel</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}