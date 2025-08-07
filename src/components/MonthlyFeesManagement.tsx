import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Check } from "lucide-react";
import { SchoolClass } from "@/types/school";
import { usePaymentData } from "@/hooks/usePaymentData";

interface MonthlyFeesManagementProps {
  classes: SchoolClass[];
  onBack: () => void;
}

export default function MonthlyFeesManagement({
  classes,
  onBack
}: MonthlyFeesManagementProps) {
  const paymentData = usePaymentData();
  const [monthlyFees, setMonthlyFees] = useState<{ [key: string]: string }>({});

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleFeeChange = (classId: string, value: string) => {
    setMonthlyFees(prev => ({
      ...prev,
      [classId]: value
    }));
  };

  const handleSetFee = (classId: string, className: string) => {
    const fee = monthlyFees[classId];
    if (fee) {
      paymentData.setClassMonthlyFee(classId, className, parseFloat(fee));
      setMonthlyFees(prev => ({
        ...prev,
        [classId]: ''
      }));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold text-primary">Gestion des mensualités</h2>
      </div>

      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <DollarSign className="h-6 w-6" />
            Frais mensuels par classe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map(cls => {
              const classFee = paymentData.getClassFees(cls.id);
              const currentFee = monthlyFees[cls.id] || '';
              
              return (
                <Card key={cls.id} className="border-2 border-green-500/20 hover:border-green-500/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-semibold text-green-600">{cls.name}</h4>
                        <p className="text-muted-foreground">{cls.studentCount} élèves</p>
                      </div>
                      
                      {classFee ? (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-700">Mensualité configurée</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {formatAmount(classFee.monthlyFee)}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-muted-foreground text-sm">Mensualité non configurée</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label htmlFor={`fee-${cls.id}`}>
                          {classFee ? 'Modifier la mensualité' : 'Définir la mensualité'} (XOF)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`fee-${cls.id}`}
                            type="number"
                            placeholder="30000"
                            value={currentFee}
                            onChange={(e) => handleFeeChange(cls.id, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleSetFee(cls.id, cls.name)}
                            disabled={!currentFee}
                            className="px-6"
                          >
                            {classFee ? 'Modifier' : 'Définir'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Résumé des mensualités */}
          <Card className="border-green-500/20 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-green-600">Résumé des mensualités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentData.classFees.map(classFee => (
                  <div key={classFee.id} className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="font-medium">{classFee.className}</span>
                    <span className="font-bold text-green-600">
                      {formatAmount(classFee.monthlyFee)}
                    </span>
                  </div>
                ))}
              </div>
              {paymentData.classFees.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucune mensualité configurée pour le moment
                </p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}