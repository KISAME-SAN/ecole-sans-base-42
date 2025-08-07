import React, { useEffect, useState } from 'react';
import SimpleLocalDatabaseService from '@/services/simpleLocalDatabase';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(true); // Toujours prêt avec localStorage
  const db = SimpleLocalDatabaseService.getInstance();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.initialize();
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