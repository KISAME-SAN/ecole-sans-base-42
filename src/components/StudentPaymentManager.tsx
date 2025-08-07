import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SchoolClass, Student } from "@/types/school";
import { usePaymentData } from "@/hooks/usePaymentData";
import PaymentTable from "./PaymentTable";
import { ArrowLeft, Calendar, Users } from "lucide-react";

interface StudentPaymentManagerProps {
  classes: SchoolClass[];
  students: Student[];
  getStudentsByClass: (classId: string) => Student[];
  onBack: () => void;
}

export default function StudentPaymentManager({
  classes,
  students,
  getStudentsByClass,
  onBack
}: StudentPaymentManagerProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const paymentData = usePaymentData();

  // Générer les 12 derniers mois
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      months.push({ key: monthKey, label: monthLabel });
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();
  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classStudents = selectedClassId ? getStudentsByClass(selectedClassId) : [];

  // Auto-créer les paiements pour les étudiants si nécessaire
  const handleClassAndMonthSelect = () => {
    if (!selectedClassId || !selectedMonth) return;

    classStudents.forEach(student => {
      const existingPayment = paymentData.studentPayments.find(
        p => p.studentId === student.id && p.month === selectedMonth
      );
      
      if (!existingPayment) {
        paymentData.createStudentPayment(student.id, selectedClassId, selectedMonth);
      }
    });
  };

  // Affichage du tableau des paiements
  if (selectedClassId && selectedMonth && selectedClass) {
    handleClassAndMonthSelect();
    
    const payments = paymentData.getPaymentsByClassAndMonth(selectedClassId, selectedMonth);
    const classFees = paymentData.getClassFees(selectedClassId);

    return (
      <div className="space-y-6">
        <Card className="border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="h-6 w-6" />
                {selectedClass.name} - {monthOptions.find(m => m.key === selectedMonth)?.label}
              </CardTitle>
              <Button variant="ghost" onClick={() => {
                setSelectedClassId('');
                setSelectedMonth('');
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Changer sélection
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <PaymentTable
              students={classStudents}
              payments={payments}
              selectedMonth={selectedMonth}
              paymentData={paymentData}
              classFees={classFees}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold text-primary">Paiements des élèves</h2>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Calendar className="h-6 w-6" />
            Sélectionner une classe et un mois
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sélection de la classe */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Classe</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="border-primary/20">
                  <SelectValue placeholder="Choisir une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentCount} élèves)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection du mois */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mois</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="border-primary/20">
                  <SelectValue placeholder="Choisir un mois" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.key} value={month.key}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedClassId || !selectedMonth ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sélectionnez une classe et un mois</h3>
              <p className="text-muted-foreground">Choisissez la classe et le mois pour voir les paiements des élèves.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}