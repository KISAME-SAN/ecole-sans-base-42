import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Database } from "lucide-react";
import { toast } from "sonner";
import LocalDatabaseService from '@/services/localDatabase';

export const DatabaseManager = () => {
  const db = LocalDatabaseService.getInstance();

  const handleExportDatabase = async () => {
    try {
      await db.downloadDatabase();
      toast.success("Base de données exportée avec succès!");
    } catch (error) {
      toast.error("Erreur lors de l'export de la base de données");
      console.error(error);
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await db.importDatabase(file);
      toast.success("Base de données importée avec succès!");
      window.location.reload(); // Recharger pour afficher les nouvelles données
    } catch (error) {
      toast.error("Erreur lors de l'import de la base de données");
      console.error(error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gestion de la Base de Données
        </CardTitle>
        <CardDescription>
          Exportez et importez votre base de données locale
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleExportDatabase}
          className="w-full"
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter la Base de Données (.sql)
        </Button>
        
        <div>
          <input
            type="file"
            accept=".sql"
            onChange={handleImportDatabase}
            className="hidden"
            id="import-db"
          />
          <label htmlFor="import-db" className="cursor-pointer">
            <Button 
              className="w-full"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer une Base de Données (.sql)
            </Button>
          </label>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Export:</strong> Télécharge un fichier .sql avec toutes vos données</p>
          <p><strong>Import:</strong> Charge une base de données depuis un fichier .sql</p>
        </div>
      </CardContent>
    </Card>
  );
};