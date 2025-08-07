import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Settings, GraduationCap } from "lucide-react";
import { SchoolClass, Student } from "@/types/school";
import PaymentTable from "@/components/PaymentTable";
import ConfigurationGrid from "@/components/ConfigurationGrid";
import { usePaymentData } from "@/hooks/usePaymentData";

interface StudentPaymentsProps {
  classes: SchoolClass[];
  students: Student[];
  getStudentsByClass: (classId: string) => Student[];
  onBack: () => void;
}

export default function StudentPayments({
  classes,
  students,
  getStudentsByClass,
  onBack
}: StudentPaymentsProps) {
  const paymentData = usePaymentData();
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showConfiguration, setShowConfiguration] = useState(false);

  const currentDate = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), i, 1);
    return {
      value: date.toISOString().slice(0, 7), // YYYY-MM format
      label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    };
  });

  const handleClassSelect = (classObj: SchoolClass) => {
    setSelectedClass(classObj);
    setSelectedMonth('');
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setSelectedMonth('');
  };

  if (showConfiguration) {
    return (
      <ConfigurationGrid 
        classes={classes}
        onBack={() => setShowConfiguration(false)}
      />
    );
  }

  // Vue tableau avec classe et mois sélectionnés
  if (selectedClass && selectedMonth) {
    const classStudents = getStudentsByClass(selectedClass.id);
    
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToClasses} className="hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-primary">{selectedClass.name}</h2>
            <p className="text-muted-foreground">
              {months.find(m => m.value === selectedMonth)?.label}
            </p>
          </div>
        </div>

        <PaymentTable 
          students={classStudents}
          payments={paymentData.getPaymentsByClassAndMonth(selectedClass.id, selectedMonth)}
          selectedMonth={selectedMonth}
          paymentData={paymentData}
          classFees={paymentData.getClassFees(selectedClass.id)}
        />
      </div>
    );
  }

  // Vue sélection de mois après avoir choisi une classe
  if (selectedClass) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToClasses} className="hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux classes
          </Button>
          <h2 className="text-2xl font-bold text-primary">Choisir le mois - {selectedClass.name}</h2>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-primary">Sélectionner le mois</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-md">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un mois" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold text-primary">Paiements des élèves</h2>
      </div>

      <Tabs defaultValue="classe" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classe" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger 
            value="configuration" 
            className="flex items-center gap-2"
            onClick={() => setShowConfiguration(true)}
          >
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classe" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <GraduationCap className="h-6 w-6" />
                Sélectionner une classe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(classObj => (
                  <Card 
                    key={classObj.id} 
                    className="border-2 border-primary/20 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleClassSelect(classObj)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-2">{classObj.name}</h3>
                      <p className="text-muted-foreground">
                        {classObj.studentCount} élèves
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}