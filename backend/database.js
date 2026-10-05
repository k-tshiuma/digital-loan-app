const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phoneNumber TEXT UNIQUE,
      email TEXT UNIQUE,
      fullName TEXT,
      password TEXT,
      authProvider TEXT,
      phoneVerifiedAt TEXT,
      preferredLanguage TEXT,
      roles TEXT,
      isActive INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      userId TEXT,
      requestNumber TEXT,
      isSubmitted INTEGER,
      submittedAt TEXT,
      status TEXT,
      language TEXT,
      currentStep INTEGER,
      borrowerDetails TEXT,
      residencyDetails TEXT,
      employmentDetails TEXT,
      loanRequest TEXT,
      guarantor TEXT,
      documents TEXT,
      consents TEXT,
      digitalSignature TEXT,
      statusHistory TEXT,
      riskScore INTEGER,
      riskLevel TEXT,
      riskFlags TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Phase 8: Add risk columns to existing applications table (ALTER TABLE with try/catch)
  // Also adds fields the frontend tracks but the original schema did not persist.
  const addedCols = [
    'ALTER TABLE applications ADD COLUMN riskScore INTEGER',
    'ALTER TABLE applications ADD COLUMN riskLevel TEXT',
    'ALTER TABLE applications ADD COLUMN riskFlags TEXT',
    'ALTER TABLE applications ADD COLUMN missingDocumentNotes TEXT',
    'ALTER TABLE applications ADD COLUMN bankAccountConfirmed INTEGER',
    'ALTER TABLE applications ADD COLUMN bankAccount TEXT',
  ];
  addedCols.forEach(sql => {
    db.run(sql, (err) => {
      // Ignore "duplicate column" errors — column already exists
      if (err && !err.message.includes('duplicate column')) {
        console.error('[DB ALTER]', err.message);
      }
    });
  });

  // Phase 1: Password reset codes (stored hashed, single use, short expiry)
  db.run(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      userId TEXT,
      codeHash TEXT,
      expiresAt TEXT,
      attempts INTEGER DEFAULT 0,
      consumedAt TEXT,
      createdAt TEXT
    )
  `);

  // Phase 8: Key/value config store (credit rule thresholds, etc.)
  db.run(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updatedAt TEXT
    )
  `);

  // Secure document ownership tracking
  db.run(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      filename TEXT PRIMARY KEY,
      userId TEXT,
      originalName TEXT,
      mimeType TEXT,
      size INTEGER,
      createdAt TEXT
    )
  `);

  // Phase 5: Notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT,
      applicationId TEXT,
      channel TEXT,
      notificationType TEXT,
      title TEXT,
      message TEXT,
      deliveryStatus TEXT DEFAULT 'pending',
      read INTEGER DEFAULT 0,
      language TEXT,
      createdAt TEXT
    )
  `);
  db.run('ALTER TABLE notifications ADD COLUMN language TEXT', (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('[DB ALTER]', err.message);
    }
  });

  // We could add more tables for OTPs, etc., but we'll start here for the basic auth and application flow.
});

module.exports = db;
