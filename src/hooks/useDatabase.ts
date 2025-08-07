import { useEffect } from 'react';
import DatabaseService from '@/services/database';

export const useDatabase = () => {
  const db = DatabaseService.getInstance();

  useEffect(() => {
    // Migration automatique au démarrage si c'est la première fois
    const hasRunMigration = localStorage.getItem('db-migration-completed');
    if (!hasRunMigration) {
      db.migrateFromLocalStorage();
      localStorage.setItem('db-migration-completed', 'true');
    }
  }, [db]);

  return db;
};