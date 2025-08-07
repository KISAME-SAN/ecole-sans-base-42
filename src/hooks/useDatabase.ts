import React, { useEffect, useState } from 'react';
import SimpleDatabaseService from '@/services/simpleDatabase';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const db = SimpleDatabaseService.getInstance();

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