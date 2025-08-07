import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SchoolClass } from "@/types/school";
import { usePaymentData } from "@/hooks/usePaymentData";
import { ArrowLeft, Plus, Settings, Trash2, Edit, DollarSign, Users, Bus, Utensils, BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PaymentConfigurationProps {
  classes: SchoolClass[];
  onBack: () => void;
}

export default function PaymentConfiguration({
  classes,
  onBack
}: PaymentConfigurationProps) {
  const paymentData = usePaymentData();
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    description: '',
    isRequired: false
  });
  const [newFee, setNewFee] = useState({
    name: '',
    amount: '',
    isRequired: false
  });
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [monthlyFee, setMonthlyFee] = useState<string>('');

  const handleAddService = () => {
    if (newService.name && newService.price) {
      paymentData.addService({
        name: newService.name,
        price: parseFloat(newService.price),
        description: newService.description,
        isRequired: newService.isRequired
      });
      setNewService({ name: '', price: '', description: '', isRequired: false });
    }
  };

  const handleSetClassFee = (classId: string, className: string) => {
    if (monthlyFee) {
      paymentData.setClassMonthlyFee(classId, className, parseFloat(monthlyFee));
      setMonthlyFee('');
    }
  };

  const handleAddRegistrationFee = () => {
    if (selectedClassId && newFee.name && newFee.amount) {
      paymentData.addRegistrationFee(selectedClassId, {
        name: newFee.name,
        amount: parseFloat(newFee.amount),
        isRequired: newFee.isRequired
      });
      setNewFee({ name: '', amount: '', isRequired: false });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('transport')) return <Bus className="h-4 w-4" />;
    if (name.includes('cantine')) return <Utensils className="h-4 w-4" />;
    if (name.includes('bibliothèque')) return <BookOpen className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold text-primary">Configuration des paiements</h2>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services annexes</TabsTrigger>
          <TabsTrigger value="monthly">Frais mensuels</TabsTrigger>
          <TabsTrigger value="registration">Frais d'inscription</TabsTrigger>
        </TabsList>

        {/* Gestion des services annexes */}
        <TabsContent value="services" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Settings className="h-6 w-6" />
                Services annexes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ajouter un nouveau service */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-primary/5">
                <div className="space-y-2">
                  <Label>Nom du service</Label>
                  <Input
                    placeholder="Transport, Cantine, etc."
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix (XOF)</Label>
                  <Input
                    type="number"
                    placeholder="25000"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optionnel)</Label>
                  <Textarea
                    placeholder="Description du service..."
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newService.isRequired}
                    onCheckedChange={(checked) => setNewService(prev => ({ ...prev, isRequired: checked }))}
                  />
                  <Label>Service obligatoire</Label>
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleAddService} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le service
                  </Button>
                </div>
              </div>

              {/* Liste des services */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Services configurés</h4>
                {paymentData.services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun service configuré</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentData.services.map(service => (
                      <Card key={service.id} className="border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getServiceIcon(service.name)}
                              <div>
                                <h5 className="font-semibold">{service.name}</h5>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground">{service.description}</p>
                                )}
                                <p className="text-lg font-bold text-primary">{formatAmount(service.price)}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={service.isRequired ? "default" : "secondary"}>
                                {service.isRequired ? "Obligatoire" : "Optionnel"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => paymentData.deleteService(service.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des frais mensuels par classe */}
        <TabsContent value="monthly" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="h-6 w-6" />
                Frais mensuels par classe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration des frais mensuels */}
              <div className="space-y-4">
                {classes.map(cls => {
                  const classFee = paymentData.getClassFees(cls.id);
                  return (
                    <div key={cls.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{cls.name}</h4>
                          <p className="text-sm text-muted-foreground">{cls.studentCount} élèves</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Frais mensuel"
                            value={monthlyFee}
                            onChange={(e) => setMonthlyFee(e.target.value)}
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSetClassFee(cls.id, cls.name)}
                          >
                            Définir
                          </Button>
                        </div>
                      </div>
                      {classFee && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <p className="text-green-700 font-semibold">
                            Frais mensuel configuré: {formatAmount(classFee.monthlyFee)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des frais d'inscription */}
        <TabsContent value="registration" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <DollarSign className="h-6 w-6" />
                Frais d'inscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sélection de classe et ajout de frais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-primary/5">
                <div className="space-y-2">
                  <Label>Classe</Label>
                  <select
                    className="w-full p-2 border rounded"
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
                  <Label>Type de frais</Label>
                  <Input
                    placeholder="Coût du tenu, etc."
                    value={newFee.name}
                    onChange={(e) => setNewFee(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Montant (XOF)</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={newFee.amount}
                    onChange={(e) => setNewFee(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newFee.isRequired}
                    onCheckedChange={(checked) => setNewFee(prev => ({ ...prev, isRequired: checked }))}
                  />
                  <Label>Obligatoire</Label>
                </div>
                <div className="md:col-span-3">
                  <Button onClick={handleAddRegistrationFee} disabled={!selectedClassId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le frais
                  </Button>
                </div>
              </div>

              {/* Affichage des frais par classe */}
              <div className="space-y-4">
                {paymentData.classFees.map(classFee => (
                  <div key={classFee.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-3">{classFee.className}</h4>
                    {classFee.registrationFees.length === 0 ? (
                      <p className="text-muted-foreground">Aucun frais d'inscription configuré</p>
                    ) : (
                      <div className="space-y-2">
                        {classFee.registrationFees.map(fee => (
                          <div key={fee.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="font-medium">{fee.name}</span>
                              <Badge 
                                variant={fee.isRequired ? "default" : "secondary"} 
                                className="ml-2"
                              >
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
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}