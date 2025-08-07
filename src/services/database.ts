import Database from 'better-sqlite3';
import path from 'path';

class DatabaseService {
  private db: Database.Database;
  private static instance: DatabaseService;

  private constructor() {
    // Créer le fichier de base de données dans le dossier de l'application
    const dbPath = path.join(process.cwd(), 'ecole-sans-base.db');
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeTables(): void {
    // Table des classes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        studentCount INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des étudiants
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS students (
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
      )
    `);

    // Table des professeurs
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        autoId INTEGER,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        salary REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des emplois du temps
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        teacherId TEXT NOT NULL,
        day TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        className TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE
      )
    `);

    // Table des emplois du temps des classes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS class_schedules (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        teacherId TEXT NOT NULL,
        subject TEXT NOT NULL,
        day TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE
      )
    `);

    // Table des matières
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        semester TEXT NOT NULL,
        name TEXT NOT NULL,
        coefficient REAL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
      )
    `);

    // Table des notes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS grades (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        subjectId TEXT NOT NULL,
        type TEXT NOT NULL,
        number INTEGER,
        value REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);

    // Table des présences
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        scheduleSlotId TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        studentId TEXT,
        teacherId TEXT,
        justification TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE CASCADE
      )
    `);

    // Tables pour les paiements
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS inscription_fees (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS additional_fees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        isRequired BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS class_additional_fees (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        additionalFeeId TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (additionalFeeId) REFERENCES additional_fees(id) ON DELETE CASCADE
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS monthly_fees (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        isRequired BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS student_services (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        serviceId TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        amount REAL NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        type TEXT NOT NULL,
        isPaid BOOLEAN DEFAULT 0,
        paidAt DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Base de données initialisée avec succès');
  }

  // Méthodes génériques
  public execute(sql: string, params: any[] = []): any {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(...params);
    } catch (error) {
      console.error('Erreur lors de l\'exécution SQL:', error);
      throw error;
    }
  }

  public query(sql: string, params: any[] = []): any[] {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    } catch (error) {
      console.error('Erreur lors de la requête SQL:', error);
      throw error;
    }
  }

  public queryOne(sql: string, params: any[] = []): any {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(...params);
    } catch (error) {
      console.error('Erreur lors de la requête SQL:', error);
      throw error;
    }
  }

  public close(): void {
    this.db.close();
  }

  // Méthodes pour migrer depuis localStorage
  public migrateFromLocalStorage(): void {
    try {
      // Migration des classes
      const savedClasses = localStorage.getItem('school-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        classes.forEach((cls: any) => {
          this.execute(
            'INSERT OR REPLACE INTO classes (id, name, studentCount) VALUES (?, ?, ?)',
            [cls.id, cls.name, cls.studentCount || 0]
          );
        });
      }

      // Migration des étudiants
      const savedStudents = localStorage.getItem('school-students');
      if (savedStudents) {
        const students = JSON.parse(savedStudents);
        students.forEach((student: any) => {
          this.execute(
            'INSERT OR REPLACE INTO students (id, autoId, firstName, lastName, birthDate, birthPlace, studentNumber, parentPhone, gender, classId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [student.id, student.autoId, student.firstName, student.lastName, student.birthDate, student.birthPlace || '', student.studentNumber || '', student.parentPhone || '', student.gender || 'male', student.classId]
          );
        });
      }

      // Migration des professeurs
      const savedTeachers = localStorage.getItem('school-teachers');
      if (savedTeachers) {
        const teachers = JSON.parse(savedTeachers);
        teachers.forEach((teacher: any) => {
          this.execute(
            'INSERT OR REPLACE INTO teachers (id, autoId, firstName, lastName, email, phone, subject, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [teacher.id, teacher.autoId, teacher.firstName, teacher.lastName, teacher.email, teacher.phone, teacher.subject, teacher.salary]
          );
        });
      }

      // Migration des emplois du temps
      const savedSchedules = localStorage.getItem('school-schedules');
      if (savedSchedules) {
        const schedules = JSON.parse(savedSchedules);
        schedules.forEach((schedule: any) => {
          this.execute(
            'INSERT OR REPLACE INTO schedules (id, teacherId, day, startTime, endTime, className) VALUES (?, ?, ?, ?, ?, ?)',
            [schedule.id, schedule.teacherId, schedule.day, schedule.startTime, schedule.endTime, schedule.className]
          );
        });
      }

      // Migration des emplois du temps des classes
      const savedClassSchedules = localStorage.getItem('class-schedules');
      if (savedClassSchedules) {
        const classSchedules = JSON.parse(savedClassSchedules);
        classSchedules.forEach((schedule: any) => {
          this.execute(
            'INSERT OR REPLACE INTO class_schedules (id, classId, teacherId, subject, day, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [schedule.id, schedule.classId, schedule.teacherId, schedule.subject, schedule.day, schedule.startTime, schedule.endTime]
          );
        });
      }

      // Migration des présences
      const savedAttendance = localStorage.getItem('attendance-records');
      if (savedAttendance) {
        const attendance = JSON.parse(savedAttendance);
        attendance.forEach((record: any) => {
          this.execute(
            'INSERT OR REPLACE INTO attendance (id, scheduleSlotId, date, status, studentId, teacherId, justification) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [record.id, record.scheduleSlotId, record.date, record.status, record.studentId, record.teacherId, record.justification]
          );
        });
      }

      console.log('✅ Migration depuis localStorage terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
    }
  }
}

export default DatabaseService;