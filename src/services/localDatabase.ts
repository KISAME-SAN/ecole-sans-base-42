import { PGlite } from '@electric-sql/pglite';

class LocalDatabaseService {
  private db: PGlite | null = null;
  private static instance: LocalDatabaseService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): LocalDatabaseService {
    if (!LocalDatabaseService.instance) {
      LocalDatabaseService.instance = new LocalDatabaseService();
    }
    return LocalDatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialiser PGlite qui crée une base de données locale
      this.db = new PGlite();
      await this.initializeTables();
      this.isInitialized = true;
      console.log('✅ Base de données locale initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  private async initializeTables(): Promise<void> {
    if (!this.db) return;

    const tables = [
      `CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        studentCount INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        autoId INTEGER,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        birthDate TEXT NOT NULL,
        birthPlace TEXT NOT NULL,
        studentNumber TEXT,
        parentPhone TEXT NOT NULL,
        gender TEXT NOT NULL,
        classId TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        autoId INTEGER,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        salary REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        teacherId TEXT NOT NULL,
        day TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        className TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS class_schedules (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        teacherId TEXT NOT NULL,
        subject TEXT NOT NULL,
        day TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        semester TEXT NOT NULL,
        name TEXT NOT NULL,
        coefficient REAL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS grades (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        subjectId TEXT NOT NULL,
        type TEXT NOT NULL,
        number INTEGER,
        value REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        scheduleSlotId TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        studentId TEXT,
        teacherId TEXT,
        justification TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        amount REAL NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        type TEXT NOT NULL,
        isPaid BOOLEAN DEFAULT FALSE,
        paidAt TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const sql of tables) {
      await this.db.exec(sql);
    }
  }

  public async execute(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query(sql, params);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'exécution SQL:', error);
      throw error;
    }
  }

  public async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      const result = await this.db.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la requête SQL:', error);
      throw error;
    }
  }

  public async queryOne(sql: string, params: any[] = []): Promise<any> {
    const results = await this.query(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  // Méthode pour exporter la base de données
  public async exportDatabase(): Promise<Blob> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // Créer un dump de toutes les données
      const tables = ['classes', 'students', 'teachers', 'schedules', 'class_schedules', 'subjects', 'grades', 'attendance', 'payments'];
      let exportData = '';
      
      for (const table of tables) {
        const data = await this.query(`SELECT * FROM ${table}`);
        exportData += `-- Table: ${table}\n`;
        
        if (data.length > 0) {
          const columns = Object.keys(data[0]).join(', ');
          exportData += `INSERT INTO ${table} (${columns}) VALUES\n`;
          
          const values = data.map(row => {
            const vals = Object.values(row).map(val => 
              typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val
            ).join(', ');
            return `(${vals})`;
          }).join(',\n');
          
          exportData += values + ';\n\n';
        }
      }
      
      return new Blob([exportData], { type: 'application/sql' });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  }

  // Méthode pour télécharger le fichier de base de données
  public async downloadDatabase(): Promise<void> {
    try {
      const blob = await this.exportDatabase();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecole-sans-base-${new Date().toISOString().split('T')[0]}.sql`;
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

  // Méthode pour importer une base de données
  public async importDatabase(file: File): Promise<void> {
    try {
      const sql = await file.text();
      await this.db?.exec(sql);
      console.log('✅ Base de données importée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'importation:', error);
      throw error;
    }
  }

  // Migration depuis localStorage
  public async migrateFromLocalStorage(): Promise<void> {
    if (!this.db) return;

    try {
      // Migration des classes
      const savedClasses = localStorage.getItem('school-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        for (const cls of classes) {
          await this.execute(
            'INSERT INTO classes (id, name, studentCount) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
            [cls.id, cls.name, cls.studentCount || 0]
          );
        }
      }

      // Migration des étudiants
      const savedStudents = localStorage.getItem('school-students');
      if (savedStudents) {
        const students = JSON.parse(savedStudents);
        for (const student of students) {
          await this.execute(
            'INSERT INTO students (id, autoId, firstName, lastName, birthDate, birthPlace, studentNumber, parentPhone, gender, classId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
            [
              student.id, 
              student.autoId, 
              student.firstName, 
              student.lastName, 
              student.birthDate, 
              student.birthPlace || '', 
              student.studentNumber || '', 
              student.parentPhone || '', 
              student.gender || 'male', 
              student.classId
            ]
          );
        }
      }

      console.log('✅ Migration depuis localStorage terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
    }
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export default LocalDatabaseService;