import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types/school";
import { StudentPayment, ClassFees } from "@/types/payment";
import { usePaymentData } from "@/hooks/usePaymentData";
import { CreditCard, Plus, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentTableProps {
  students: Student[];
  payments: StudentPayment[];
  selectedMonth: string;
  paymentData: ReturnType<typeof usePaymentData>;
  classFees?: ClassFees;
}

export default function PaymentTable({
  students,
  payments,
  selectedMonth,
  paymentData,
  classFees
}: PaymentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [additionalFee, setAdditionalFee] = useState({ name: '', amount: '' });

  const getStudentPayment = (studentId: string) => {
    return payments.find(p => p.studentId === studentId);
  };

  const handleRecordPayment = (studentId: string, amount: number) => {
    paymentData.recordPayment(studentId, amount);
    setPaymentAmount('');
  };

  const handleAddService = (paymentId: string, serviceId: string) => {
    paymentData.addServiceToPayment(paymentId, serviceId);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const PaymentDetailDialog = ({ student, payment }: { student: Student; payment?: StudentPayment }) => {
    const [localServices, setLocalServices] = useState<string[]>([]);
    const [localAdditionalFee, setLocalAdditionalFee] = useState({ name: '', amount: '' });

    const handleSavePaymentDetails = () => {
      if (!payment) return;

      // Ajouter les services sélectionnés
      localServices.forEach(serviceId => {
        if (!payment.services.find(s => s.serviceId === serviceId)) {
          handleAddService(payment.id, serviceId);
        }
      });

      // Ajouter les frais supplémentaires
      if (localAdditionalFee.name && localAdditionalFee.amount) {
        const currentPayment = paymentData.studentPayments.find(p => p.id === payment.id);
        if (currentPayment) {
          paymentData.updateStudentPayment(payment.id, {
            additionalFees: [
              ...currentPayment.additionalFees,
              {
                id: Date.now().toString(),
                name: localAdditionalFee.name,
                amount: parseFloat(localAdditionalFee.amount),
                isPaid: false
              }
            ]
          });
        }
      }

      setLocalServices([]);
      setLocalAdditionalFee({ name: '', amount: '' });
    };

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Détails du paiement - {student.firstName} {student.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Résumé des montants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-lg font-bold text-primary">
                {formatAmount(payment?.totalAmount || (classFees?.monthlyFee || 0))}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Montant payé</p>
              <p className="text-lg font-bold text-green-600">
                {formatAmount(payment?.paidAmount || 0)}
              </p>
            </div>
          </div>

          {/* Services disponibles */}
          <div className="space-y-3">
            <h4 className="font-semibold">Services supplémentaires</h4>
            <div className="space-y-2">
              {paymentData.services.map(service => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id={service.id}
                      checked={localServices.includes(service.id) || payment?.services.some(s => s.serviceId === service.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalServices(prev => [...prev, service.id]);
                        } else {
                          setLocalServices(prev => prev.filter(id => id !== service.id));
                        }
                      }}
                      disabled={payment?.services.some(s => s.serviceId === service.id)}
                    />
                    <label htmlFor={service.id} className="font-medium cursor-pointer">
                      {service.name}
                    </label>
                  </div>
                  <span className="font-semibold">{formatAmount(service.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Frais supplémentaires */}
          <div className="space-y-3">
            <h4 className="font-semibold">Ajouter des frais supplémentaires</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Nom du frais (ex: Tenue scolaire)"
                value={localAdditionalFee.name}
                onChange={(e) => setLocalAdditionalFee(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Montant"
                value={localAdditionalFee.amount}
                onChange={(e) => setLocalAdditionalFee(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
          </div>

          {/* Enregistrer un paiement */}
          <div className="space-y-3">
            <h4 className="font-semibold">Enregistrer un paiement</h4>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Montant payé"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <Button 
                onClick={() => {
                  if (payment && paymentAmount) {
                    handleRecordPayment(payment.studentId, parseFloat(paymentAmount));
                  }
                }}
                disabled={!paymentAmount || !payment}
              >
                Enregistrer
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSavePaymentDetails}>
              Sauvegarder les modifications
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/20 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Montant total</TableHead>
                <TableHead>Montant payé</TableHead>
                <TableHead>Reste à payer</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const payment = getStudentPayment(student.id);
                const monthlyFee = classFees?.monthlyFee || 0;
                const totalAmount = payment?.totalAmount || monthlyFee;
                const paidAmount = payment?.paidAmount || 0;
                const remainingAmount = totalAmount - paidAmount;
                const isPaid = remainingAmount <= 0;

                return (
                  <TableRow key={student.id} className="hover:bg-primary/5">
                    <TableCell className="font-medium">{student.autoId}</TableCell>
                    <TableCell>{student.firstName}</TableCell>
                    <TableCell>{student.lastName}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(student.birthDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(totalAmount)}
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {formatAmount(paidAmount)}
                    </TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {formatAmount(remainingAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPaid ? "default" : "destructive"}>
                        {isPaid ? "Payé" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </DialogTrigger>
                        <PaymentDetailDialog student={student} payment={payment} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}