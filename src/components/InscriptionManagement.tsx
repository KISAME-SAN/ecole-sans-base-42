import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, Plus, Trash2 } from "lucide-react";
import { SchoolClass } from "@/types/school";
import { usePaymentData } from "@/hooks/usePaymentData";

interface InscriptionManagementProps {
  classes: SchoolClass[];
  onBack: () => void;
}

export default function InscriptionManagement({
  classes,
  onBack
}: InscriptionManagementProps) {
  const paymentData = usePaymentData();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [inscriptionFee, setInscriptionFee] = useState<string>('');
  const [newAnnexFee, setNewAnnexFee] = useState({
    name: '',
    amount: '',
    isRequired: false,
    selectedClasses: [] as string[]
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSetInscriptionFee = () => {
    if (selectedClassId && inscriptionFee) {
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (selectedClass) {
        paymentData.addRegistrationFee(selectedClassId, {
          name: 'Frais d\'inscription',
          amount: parseFloat(inscriptionFee),
          isRequired: true
        });
        setInscriptionFee('');
      }
    }
  };

  const handleAddAnnexFee = () => {
    if (newAnnexFee.name && newAnnexFee.amount && newAnnexFee.selectedClasses.length > 0) {
      newAnnexFee.selectedClasses.forEach(classId => {
        paymentData.addRegistrationFee(classId, {
          name: newAnnexFee.name,
          amount: parseFloat(newAnnexFee.amount),
          isRequired: newAnnexFee.isRequired
        });
      });
      setNewAnnexFee({
        name: '',
        amount: '',
        isRequired: false,
        selectedClasses: []
      });
    }
  };

  const toggleClassSelection = (classId: string) => {
    setNewAnnexFee(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold text-primary">Gestion des inscriptions</h2>
      </div>

      <Tabs defaultValue="inscription" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inscription">Frais d'inscription</TabsTrigger>
          <TabsTrigger value="annexes">Frais annexes</TabsTrigger>
        </TabsList>

        <TabsContent value="inscription" className="space-y-6">
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-500">
                <UserPlus className="h-6 w-6" />
                Frais d'inscription par classe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50">
                <div className="space-y-2">
                  <Label>Classe</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Montant d'inscription (XOF)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={inscriptionFee}
                    onChange={(e) => setInscriptionFee(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    onClick={handleSetInscriptionFee}
                    disabled={!selectedClassId || !inscriptionFee}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Définir les frais d'inscription
                  </Button>
                </div>
              </div>

              {/* Affichage des frais d'inscription configurés */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Frais configurés</h4>
                {paymentData.classFees.map(classFee => {
                  const inscriptionFees = classFee.registrationFees.filter(fee => 
                    fee.name === 'Frais d\'inscription'
                  );
                  
                  return inscriptionFees.length > 0 ? (
                    <div key={classFee.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold">{classFee.className}</h5>
                          <p className="text-blue-600 font-bold">
                            {formatAmount(inscriptionFees[0].amount)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => paymentData.removeRegistrationFee(classFee.classId, inscriptionFees[0].id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annexes" className="space-y-6">
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-500">
                <Plus className="h-6 w-6" />
                Frais annexes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-blue-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du frais</Label>
                    <Input
                      placeholder="Tenue, Costume, etc."
                      value={newAnnexFee.name}
                      onChange={(e) => setNewAnnexFee(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Montant (XOF)</Label>
                    <Input
                      type="number"
                      placeholder="15000"
                      value={newAnnexFee.amount}
                      onChange={(e) => setNewAnnexFee(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newAnnexFee.isRequired}
                    onCheckedChange={(checked) => setNewAnnexFee(prev => ({ ...prev, isRequired: checked }))}
                  />
                  <Label>Obligatoire</Label>
                </div>

                <div className="space-y-2">
                  <Label>Classes concernées</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {classes.map(cls => (
                      <div
                        key={cls.id}
                        className={`p-2 border rounded cursor-pointer transition-colors ${
                          newAnnexFee.selectedClasses.includes(cls.id)
                            ? 'bg-blue-100 border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleClassSelection(cls.id)}
                      >
                        <div className="text-sm font-medium">{cls.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAddAnnexFee}
                  disabled={!newAnnexFee.name || !newAnnexFee.amount || newAnnexFee.selectedClasses.length === 0}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le frais annexe
                </Button>
              </div>

              {/* Affichage des frais annexes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Frais annexes configurés</h4>
                {paymentData.classFees.map(classFee => {
                  const annexFees = classFee.registrationFees.filter(fee => 
                    fee.name !== 'Frais d\'inscription'
                  );
                  
                  return annexFees.length > 0 ? (
                    <div key={classFee.id} className="border rounded-lg p-4">
                      <h5 className="font-semibold mb-3">{classFee.className}</h5>
                      <div className="space-y-2">
                        {annexFees.map(fee => (
                          <div key={fee.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{fee.name}</span>
                              <Badge variant={fee.isRequired ? "default" : "secondary"}>
                                {fee.isRequired ? "Obligatoire" : "Optionnel"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{formatAmount(fee.amount)}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => paymentData.removeRegistrationFee(classFee.classId, fee.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}