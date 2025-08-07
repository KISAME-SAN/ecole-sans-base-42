import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, DollarSign, Settings } from "lucide-react";
import { SchoolClass } from "@/types/school";
import InscriptionManagement from "@/components/InscriptionManagement";
import MonthlyFeesManagement from "@/components/MonthlyFeesManagement";
import ServicesManagement from "@/components/ServicesManagement";

interface ConfigurationGridProps {
  classes: SchoolClass[];
  onBack: () => void;
}

export default function ConfigurationGrid({
  classes,
  onBack
}: ConfigurationGridProps) {
  const [activeConfig, setActiveConfig] = useState<'inscription' | 'mensualite' | 'services' | ''>('');

  if (activeConfig === 'inscription') {
    return (
      <InscriptionManagement 
        classes={classes}
        onBack={() => setActiveConfig('')}
      />
    );
  }

  if (activeConfig === 'mensualite') {
    return (
      <MonthlyFeesManagement 
        classes={classes}
        onBack={() => setActiveConfig('')}
      />
    );
  }

  if (activeConfig === 'services') {
    return (
      <ServicesManagement 
        classes={classes}
        onBack={() => setActiveConfig('')}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h2 className="text-2xl font-bold text-primary">Configuration des paiements</h2>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-center text-primary">Paramètres de configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="border-2 border-blue-500/20 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => setActiveConfig('inscription')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <UserPlus className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-blue-500 mb-2">Inscription</h3>
                <p className="text-muted-foreground text-sm">
                  Gérer les frais d'inscription et annexes
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 border-green-500/20 hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => setActiveConfig('mensualite')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-500 mb-2">Mensualité</h3>
                <p className="text-muted-foreground text-sm">
                  Définir les frais mensuels par classe
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-2 border-orange-500/20 hover:border-orange-500 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => setActiveConfig('services')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/10 rounded-full flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Settings className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-orange-500 mb-2">Services</h3>
                <p className="text-muted-foreground text-sm">
                  Configurer les services annexes
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}