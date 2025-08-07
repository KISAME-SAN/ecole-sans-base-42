import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Database, FileText } from "lucide-react";
import { toast } from "sonner";
import SimpleLocalDatabaseService from '@/services/simpleLocalDatabase';

export const DatabaseManager = () => {
  const db = SimpleLocalDatabaseService.getInstance();

  const handleExportDatabase = () => {
    try {
      db.downloadDatabase();
      toast.success("Base de données exportée avec succès!");
    } catch (error) {
      toast.error("Erreur lors de l'export de la base de données");
      console.error(error);
    }
  };

  const handleExportDatabaseAsSQL = () => {
    try {
      db.downloadDatabaseAsSQL();
      toast.success("Base de données SQL exportée avec succès!");
    } catch (error) {
      toast.error("Erreur lors de l'export SQL");
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
          Exporter en JSON (.json)
        </Button>
        
        <Button 
          onClick={handleExportDatabaseAsSQL}
          className="w-full"
          variant="outline"
        >
          <FileText className="mr-2 h-4 w-4" />
          Exporter en SQL (.sql)
        </Button>
        
        <div>
          <input
            type="file"
            accept=".json"
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
              Importer une Base de Données (.json)
            </Button>
          </label>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Export JSON:</strong> Format standard pour la sauvegarde</p>
          <p><strong>Export SQL:</strong> Format compatible avec les bases de données</p>
          <p><strong>Import:</strong> Charge des données depuis un fichier JSON</p>
        </div>
      </CardContent>
    </Card>
  );
};