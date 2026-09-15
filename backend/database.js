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
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // We could add more tables for OTPs, etc., but we'll start here for the basic auth and application flow.
});

module.exports = db;
