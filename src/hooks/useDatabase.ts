import React, { useEffect, useState } from 'react';
import LocalDatabaseService from '@/services/localDatabase';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const db = LocalDatabaseService.getInstance();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.initialize();
        
        // Migration automatique au démarrage si c'est la première fois
        const hasRunMigration = localStorage.getItem('db-migration-completed');
        if (!hasRunMigration) {
          await db.migrateFromLocalStorage();
          localStorage.setItem('db-migration-completed', 'true');
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        setIsReady(true); // Continue même en cas d'erreur
      }
    };

    initializeDatabase();
  }, [db]);

  return { db, isReady };
};