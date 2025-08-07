import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, Plus, Trash2, Bus, Utensils, BookOpen, DollarSign } from "lucide-react";
import { SchoolClass } from "@/types/school";
import { usePaymentData } from "@/hooks/usePaymentData";

interface ServicesManagementProps {
  classes: SchoolClass[];
  onBack: () => void;
}

export default function ServicesManagement({
  classes,
  onBack
}: ServicesManagementProps) {
  const paymentData = usePaymentData();
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    description: '',
    isRequired: false
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('transport')) return <Bus className="h-6 w-6" />;
    if (name.includes('cantine')) return <Utensils className="h-6 w-6" />;
    if (name.includes('bibliothèque')) return <BookOpen className="h-6 w-6" />;
    return <DollarSign className="h-6 w-6" />;
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold text-primary">Gestion des services annexes</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire d'ajout de service */}
        <Card className="border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <Plus className="h-6 w-6" />
              Ajouter un service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du service</Label>
              <Input
                placeholder="Transport, Cantine, Bibliothèque..."
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
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newService.isRequired}
                onCheckedChange={(checked) => setNewService(prev => ({ ...prev, isRequired: checked }))}
              />
              <Label>Service obligatoire</Label>
            </div>

            <Button 
              onClick={handleAddService}
              disabled={!newService.name || !newService.price}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le service
            </Button>
          </CardContent>
        </Card>

        {/* Liste des services configurés */}
        <Card className="border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <Settings className="h-6 w-6" />
              Services configurés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData.services.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun service configuré</p>
                <p className="text-sm">Ajoutez votre premier service ci-contre</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentData.services.map(service => (
                  <Card key={service.id} className="border-2 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="text-orange-500">
                            {getServiceIcon(service.name)}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg">{service.name}</h5>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                            )}
                            <p className="text-xl font-bold text-orange-500 mt-2">
                              {formatAmount(service.price)}
                            </p>
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
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
          </CardContent>
        </Card>
      </div>

      {/* Résumé des services */}
      {paymentData.services.length > 0 && (
        <Card className="border-orange-500/20 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-orange-600">Résumé des services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentData.services.map(service => (
                <div key={service.id} className="flex justify-between items-center p-3 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <div className="text-orange-500">
                      {getServiceIcon(service.name)}
                    </div>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <span className="font-bold text-orange-600">
                    {formatAmount(service.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-orange-100 rounded">
              <p className="text-orange-700 font-medium">
                Total des services optionnels disponibles: {' '}
                {formatAmount(paymentData.services.reduce((sum, service) => sum + service.price, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}