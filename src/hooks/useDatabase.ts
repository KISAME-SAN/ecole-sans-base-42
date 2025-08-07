import { useEffect, useState } from 'react';
import DatabaseService from '@/services/database';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const db = DatabaseService.getInstance();

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
      }
    };

    initializeDatabase();
  }, [db]);

  return { db, isReady };
};