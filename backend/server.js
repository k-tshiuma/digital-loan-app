const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Users API ---

app.post('/api/users/login', (req, res) => {
  const { identifier, password } = req.body;
  const isEmail = identifier.includes('@');
  
  const query = isEmail ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE phoneNumber = ?';
  
  db.get(query, [identifier], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this phone number or email.' });
    }
    if (user.password && user.password !== password) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }
    
    // Parse JSON fields
    user.roles = JSON.parse(user.roles || '[]');
    user.isActive = user.isActive === 1;
    
    res.json({ success: true, user });
  });
});

app.post('/api/users/register', (req, res) => {
  const { fullName, email, phoneNumber, password, preferredLanguage } = req.body;
  const id = `user_${Date.now()}`;
  const now = new Date().toISOString();
  const roles = JSON.stringify(['borrower']);

  const stmt = db.prepare(`
    INSERT INTO users (id, phoneNumber, email, fullName, password, authProvider, phoneVerifiedAt, preferredLanguage, roles, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([id, phoneNumber, email, fullName, password, password ? 'password' : 'phone', now, preferredLanguage || 'en', roles, 1, now, now], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
         return res.status(400).json({ success: false, error: 'User already exists' });
      }
      return res.status(500).json({ success: false, error: err.message });
    }
    
    res.json({
      success: true,
      user: {
        id, phoneNumber, email, fullName, preferredLanguage: preferredLanguage || 'en', roles: ['borrower'], isActive: true, createdAt: now, updatedAt: now
      }
    });
  });
});

// Mock OTP verification (fallback 123456)
app.post('/api/users/verify-otp', (req, res) => {
  const { phoneNumber, code } = req.body;
  
  if (code === '123456') {
    db.get('SELECT * FROM users WHERE phoneNumber = ?', [phoneNumber], (err, user) => {
      if (err) return res.status(500).json({ success: false, error: 'Database error' });
      
      if (!user) {
        // create user if doesn't exist (mock behavior from storage.ts)
        const id = `user_${Date.now()}`;
        const now = new Date().toISOString();
        const roles = JSON.stringify(['borrower']);
        
        db.run(`
          INSERT INTO users (id, phoneNumber, preferredLanguage, roles, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, phoneNumber, 'en', roles, 1, now, now], function(err2) {
           if (err2) return res.status(500).json({ success: false, error: err2.message });
           return res.json({ success: true, user: { id, phoneNumber, preferredLanguage: 'en', roles: ['borrower'], isActive: true } });
        });
      } else {
        user.roles = JSON.parse(user.roles || '[]');
        user.isActive = user.isActive === 1;
        res.json({ success: true, user });
      }
    });
  } else {
    res.status(400).json({ success: false, error: 'Incorrect verification code. Please try again.' });
  }
});

// --- Applications API ---

app.get('/api/applications/active/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.get('SELECT * FROM applications WHERE userId = ? AND isSubmitted = 0 ORDER BY createdAt DESC LIMIT 1', [userId], (err, app) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    
    if (app) {
      // parse json fields
      app.isSubmitted = app.isSubmitted === 1;
      app.borrowerDetails = JSON.parse(app.borrowerDetails || 'null');
      app.residencyDetails = JSON.parse(app.residencyDetails || 'null');
      app.employmentDetails = JSON.parse(app.employmentDetails || 'null');
      app.loanRequest = JSON.parse(app.loanRequest || 'null');
      app.guarantor = JSON.parse(app.guarantor || 'null');
      app.documents = JSON.parse(app.documents || '[]');
      app.consents = JSON.parse(app.consents || '[]');
      app.digitalSignature = JSON.parse(app.digitalSignature || 'null');
      app.statusHistory = JSON.parse(app.statusHistory || '[]');
      return res.json({ success: true, application: app });
    } else {
      // create new draft
      const newApp = {
        id: `app_${Date.now()}`,
        userId,
        isSubmitted: false,
        status: 'Draft',
        currentStep: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      db.run(`
        INSERT INTO applications (id, userId, isSubmitted, status, currentStep, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [newApp.id, newApp.userId, 0, newApp.status, newApp.currentStep, newApp.createdAt, newApp.updatedAt], function(err2) {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, application: newApp });
      });
    }
  });
});

app.put('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const appData = req.body;
  const now = new Date().toISOString();
  
  db.run(`
    UPDATE applications 
    SET isSubmitted = ?, status = ?, currentStep = ?, language = ?, 
        borrowerDetails = ?, residencyDetails = ?, employmentDetails = ?, loanRequest = ?, 
        guarantor = ?, documents = ?, consents = ?, digitalSignature = ?, statusHistory = ?, 
        updatedAt = ?
    WHERE id = ?
  `, [
    appData.isSubmitted ? 1 : 0, appData.status, appData.currentStep, appData.language,
    JSON.stringify(appData.borrowerDetails), JSON.stringify(appData.residencyDetails), JSON.stringify(appData.employmentDetails),
    JSON.stringify(appData.loanRequest), JSON.stringify(appData.guarantor), JSON.stringify(appData.documents),
    JSON.stringify(appData.consents), JSON.stringify(appData.digitalSignature), JSON.stringify(appData.statusHistory),
    now, id
  ], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, application: { ...appData, updatedAt: now } });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
