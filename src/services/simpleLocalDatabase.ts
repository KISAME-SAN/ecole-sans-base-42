interface DatabaseData {
  classes: any[];
  students: any[];
  teachers: any[];
  schedules: any[];
  classSchedules: any[];
  subjects: any[];
  grades: any[];
  attendance: any[];
  payments: any[];
  metadata: {
    exportDate: string;
    version: string;
  };
}

class SimpleLocalDatabaseService {
  private static instance: SimpleLocalDatabaseService;

  private constructor() {}

  public static getInstance(): SimpleLocalDatabaseService {
    if (!SimpleLocalDatabaseService.instance) {
      SimpleLocalDatabaseService.instance = new SimpleLocalDatabaseService();
    }
    return SimpleLocalDatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    console.log('✅ Database service initialized (localStorage mode)');
  }

  // Méthode pour exporter toutes les données
  public exportAllData(): DatabaseData {
    const data: DatabaseData = {
      classes: JSON.parse(localStorage.getItem('school-classes') || '[]'),
      students: JSON.parse(localStorage.getItem('school-students') || '[]'),
      teachers: JSON.parse(localStorage.getItem('school-teachers') || '[]'),
      schedules: JSON.parse(localStorage.getItem('school-schedules') || '[]'),
      classSchedules: JSON.parse(localStorage.getItem('class-schedules') || '[]'),
      subjects: JSON.parse(localStorage.getItem('school-subjects') || '[]'),
      grades: JSON.parse(localStorage.getItem('school-grades') || '[]'),
      attendance: JSON.parse(localStorage.getItem('attendance-records') || '[]'),
      payments: JSON.parse(localStorage.getItem('school-payments') || '[]'),
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    return data;
  }

  // Méthode pour importer toutes les données
  public importAllData(data: DatabaseData): void {
    try {
      localStorage.setItem('school-classes', JSON.stringify(data.classes || []));
      localStorage.setItem('school-students', JSON.stringify(data.students || []));
      localStorage.setItem('school-teachers', JSON.stringify(data.teachers || []));
      localStorage.setItem('school-schedules', JSON.stringify(data.schedules || []));
      localStorage.setItem('class-schedules', JSON.stringify(data.classSchedules || []));
      localStorage.setItem('school-subjects', JSON.stringify(data.subjects || []));
      localStorage.setItem('school-grades', JSON.stringify(data.grades || []));
      localStorage.setItem('attendance-records', JSON.stringify(data.attendance || []));
      localStorage.setItem('school-payments', JSON.stringify(data.payments || []));
      
      console.log('✅ Données importées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'importation:', error);
      throw error;
    }
  }

  // Méthode pour télécharger le fichier de base de données
  public downloadDatabase(): void {
    try {
      const data = this.exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecole-sans-base-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Base de données exportée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      throw error;
    }
  }

  // Méthode pour télécharger en format SQL
  public downloadDatabaseAsSQL(): void {
    try {
      const data = this.exportAllData();
      let sqlContent = `-- École Sans Base - Export de données\n-- Date: ${data.metadata.exportDate}\n-- Version: ${data.metadata.version}\n\n`;
      
      // Générer les instructions SQL pour chaque table
      sqlContent += this.generateSQLInserts('classes', data.classes);
      sqlContent += this.generateSQLInserts('students', data.students);
      sqlContent += this.generateSQLInserts('teachers', data.teachers);
      sqlContent += this.generateSQLInserts('schedules', data.schedules);
      sqlContent += this.generateSQLInserts('class_schedules', data.classSchedules);
      sqlContent += this.generateSQLInserts('subjects', data.subjects);
      sqlContent += this.generateSQLInserts('grades', data.grades);
      sqlContent += this.generateSQLInserts('attendance', data.attendance);
      sqlContent += this.generateSQLInserts('payments', data.payments);
      
      const blob = new Blob([sqlContent], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecole-sans-base-${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Base de données SQL exportée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement SQL:', error);
      throw error;
    }
  }

  private generateSQLInserts(tableName: string, data: any[]): string {
    if (!data || data.length === 0) return `-- Table ${tableName}: aucune donnée\n\n`;
    
    let sql = `-- Table: ${tableName}\n`;
    const columns = Object.keys(data[0]);
    const columnNames = columns.join(', ');
    
    sql += `INSERT INTO ${tableName} (${columnNames}) VALUES\n`;
    
    const values = data.map(row => {
      const vals = columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        return val;
      }).join(', ');
      return `  (${vals})`;
    }).join(',\n');
    
    sql += values + ';\n\n';
    return sql;
  }

  // Méthode pour importer depuis un fichier
  public async importDatabase(file: File): Promise<void> {
    try {
      const text = await file.text();
      let data: DatabaseData;
      
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        throw new Error('Format de fichier non supporté. Utilisez un fichier .json');
      }
      
      this.importAllData(data);
      console.log('✅ Base de données importée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'importation:', error);
      throw error;
    }
  }

  // Méthodes de compatibilité pour les hooks existants
  public execute(sql: string, params: any[] = []): any {
    return { changes: 0 };
  }

  public query(sql: string, params: any[] = []): any[] {
    return [];
  }

  public queryOne(sql: string, params: any[] = []): any {
    return null;
  }

  public async migrateFromLocalStorage(): Promise<void> {
    // Pas besoin de migration, on utilise déjà localStorage
    console.log('Migration non nécessaire - utilisation directe de localStorage');
  }

  public close(): void {
    // Rien à fermer
  }
}

export default SimpleLocalDatabaseService;