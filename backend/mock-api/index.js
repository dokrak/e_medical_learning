const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const files = ['users.json','questions.json','exams.json','student_exams.json','audit_logs.json'];
files.forEach(f => {
  const p = path.join(dataDir, f);
  if (!fs.existsSync(p)) fs.writeFileSync(p, f === 'users.json' || f === 'questions.json' || f === 'exams.json' ? '[]' : '[]');
});

const usersPath = path.join(dataDir, 'users.json');
try {
  const existingUsers = JSON.parse(fs.readFileSync(usersPath));
  if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
    fs.writeFileSync(usersPath, JSON.stringify([
      { id: uuidv4(), name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'admin', token: uuidv4() },
      { id: uuidv4(), name: 'Clinician User', email: 'clinician@example.com', password: 'password', role: 'clinician', token: uuidv4() },
      { id: uuidv4(), name: 'Student User', email: 'student@example.com', password: 'password', role: 'student', token: uuidv4() }
    ], null, 2));
  }
} catch (_err) {
  fs.writeFileSync(usersPath, JSON.stringify([
    { id: uuidv4(), name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'admin', token: uuidv4() },
    { id: uuidv4(), name: 'Clinician User', email: 'clinician@example.com', password: 'password', role: 'clinician', token: uuidv4() },
    { id: uuidv4(), name: 'Student User', email: 'student@example.com', password: 'password', role: 'student', token: uuidv4() }
  ], null, 2));
}

function readJson(fname){
  const p = path.join(dataDir, fname);
  return JSON.parse(fs.readFileSync(p));
}
function writeJson(fname, data){
  const p = path.join(dataDir, fname);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

// Simple token-based auth (mock)
function authMiddleware(req, res, next){
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: 'no token' });
  const token = h.replace('Bearer ', '');
  const users = readJson('users.json');
  const user = users.find(u => u.token === token);
  if (!user) return res.status(401).json({ error: 'invalid token' });
  req.user = user;
  next();
}

function requireRole(roles){
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

// Auth
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readJson('users.json');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  return res.json({ token: user.token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/me', authMiddleware, (req, res) => res.json({ user: req.user }));

// Admin User Management
app.get('/api/admin/users', authMiddleware, requireRole(['admin']), (req, res) => {
  const users = readJson('users.json');
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

app.post('/api/admin/users', authMiddleware, requireRole(['admin']), (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, and role are required' });
  }
  const users = readJson('users.json');
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'email already exists' });
  }
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
    role,
    token: uuidv4()
  };
  users.push(newUser);
  writeJson('users.json', users);
  res.json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
});

app.put('/api/admin/users/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const { name, email, password, role } = req.body;
  const users = readJson('users.json');
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  
  // Check if email is being changed to an existing email
  if (email && email !== user.email && users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'email already exists' });
  }
  
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;
  if (role) user.role = role;
  
  writeJson('users.json', users);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.delete('/api/admin/users/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const users = readJson('users.json');
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'user not found' });
  const removed = users.splice(idx, 1)[0];
  writeJson('users.json', users);
  res.json({ id: removed.id, message: 'user deleted' });
});

// Questions
app.get('/api/questions', (req, res) => {
  const qs = readJson('questions.json');
  let result = qs.filter(q => q.status === 'approved');
  // optional filters
  if (req.query.specialtyId) result = result.filter(q => q.specialtyId === req.query.specialtyId);
  if (req.query.subspecialtyId) result = result.filter(q => q.subspecialtyId === req.query.subspecialtyId);
  const limit = parseInt(req.query.limit || '0', 10);
  if (limit > 0) result = result.slice(0, limit);
  res.json(result);
});

app.post('/api/questions', authMiddleware, requireRole(['clinician','admin']), (req, res) => {
  const { title, stem, body, answerExplanation, difficulty, answer, references, images, choices, specialtyId, subspecialtyId } = req.body;
  const qs = readJson('questions.json');
  const q = {
    id: uuidv4(),
    title: title || '(no title)',
    stem: stem || '',
    body: body || '',
    answerExplanation: answerExplanation || '',
    difficulty: difficulty || 3,
    answer: answer || '',
    choices: Array.isArray(choices) ? choices.slice(0,5) : [],
    references: references || [],
    status: 'pending',
    moderationFeedback: null,
    authorId: req.user.id,
    images: images || [],
    specialtyId: specialtyId || null,
    subspecialtyId: subspecialtyId || null
  };
  qs.push(q);
  writeJson('questions.json', qs);
  res.json(q);
});

app.get('/api/pending-questions', authMiddleware, requireRole(['admin','moderator']), (req, res) => {
  const qs = readJson('questions.json');
  res.json(qs.filter(q => q.status === 'pending'));
});

app.get('/api/my-questions', authMiddleware, (req, res) => {
  const qs = readJson('questions.json');
  res.json(qs.filter(q => q.authorId === req.user.id));
});

app.post('/api/questions/:id/approve', authMiddleware, requireRole(['admin','moderator']), (req, res) => {
  const id = req.params.id;
  const qs = readJson('questions.json');
  const q = qs.find(x => x.id === id);
  if (!q) return res.status(404).json({ error: 'not found' });
  q.status = 'approved';
  q.moderationFeedback = null;
  writeJson('questions.json', qs);
  const logs = readJson('audit_logs.json');
  logs.push({ id: uuidv4(), entity: 'question', entity_id: id, action: 'approve', user_id: req.user.id, timestamp: new Date().toISOString() });
  writeJson('audit_logs.json', logs);
  res.json(q);
});

app.post('/api/questions/:id/reject', authMiddleware, requireRole(['admin','moderator']), (req, res) => {
  const id = req.params.id;
  const { feedback } = req.body || {};
  const qs = readJson('questions.json');
  const q = qs.find(x => x.id === id);
  if (!q) return res.status(404).json({ error: 'not found' });
  q.status = 'rejected';
  q.moderationFeedback = typeof feedback === 'string' ? feedback.trim() : '';
  writeJson('questions.json', qs);
  const logs = readJson('audit_logs.json');
  logs.push({ id: uuidv4(), entity: 'question', entity_id: id, action: 'reject', user_id: req.user.id, detail: q.moderationFeedback, timestamp: new Date().toISOString() });
  writeJson('audit_logs.json', logs);
  res.json(q);
});

app.put('/api/questions/:id', authMiddleware, requireRole(['clinician','admin']), (req, res) => {
  const id = req.params.id;
  const { title, stem, body, answerExplanation, difficulty, answer, references, images, choices, specialtyId, subspecialtyId } = req.body;
  const qs = readJson('questions.json');
  const q = qs.find(x => x.id === id);
  if (!q) return res.status(404).json({ error: 'not found' });
  if (q.authorId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'can only edit your own questions' });
  q.title = title !== undefined ? title : q.title;
  q.stem = stem !== undefined ? stem : q.stem;
  q.body = body !== undefined ? body : q.body;
  q.answerExplanation = answerExplanation !== undefined ? answerExplanation : q.answerExplanation;
  q.difficulty = difficulty !== undefined ? difficulty : q.difficulty;
  q.answer = answer !== undefined ? answer : q.answer;
  q.references = references !== undefined ? references : q.references;
  q.images = images !== undefined ? images : q.images;
  q.choices = choices !== undefined ? choices : q.choices;
  q.specialtyId = specialtyId !== undefined ? specialtyId : q.specialtyId;
  q.subspecialtyId = subspecialtyId !== undefined ? subspecialtyId : q.subspecialtyId;
  const wasRejected = q.status === 'rejected';
  if (wasRejected) {
    q.status = 'pending';
    q.moderationFeedback = null;
  }
  writeJson('questions.json', qs);
  const logs = readJson('audit_logs.json');
  logs.push({ id: uuidv4(), entity: 'question', entity_id: id, action: wasRejected ? 'resubmit' : 'edit', user_id: req.user.id, timestamp: new Date().toISOString() });
  writeJson('audit_logs.json', logs);
  res.json(q);
});

app.delete('/api/questions/:id', authMiddleware, requireRole(['clinician','admin']), (req, res) => {
  const id = req.params.id;
  const qs = readJson('questions.json');
  const q = qs.find(x => x.id === id);
  if (!q) return res.status(404).json({ error: 'not found' });
  if (q.authorId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'can only delete your own questions' });
  const updated = qs.filter(x => x.id !== id);
  writeJson('questions.json', updated);
  const logs = readJson('audit_logs.json');
  logs.push({ id: uuidv4(), entity: 'question', entity_id: id, action: 'delete', user_id: req.user.id, timestamp: new Date().toISOString() });
  writeJson('audit_logs.json', logs);
  res.json({ success: true });
});

// Exams (simple generator)
app.post('/api/exams', authMiddleware, requireRole(['admin','clinician']), (req, res) => {
  let { title, numQuestions, specialtyId, subspecialtyId, difficultyLevel, selectionMode, selectedQuestionIds, difficultyDistribution, passingScore } = req.body;
  // allow alternative field names
  numQuestions = Number(numQuestions || req.body.num_questions || 10);
  selectionMode = selectionMode || 'random';
  passingScore = passingScore !== undefined ? Number(passingScore) : 50;

  const allQs = readJson('questions.json').filter(q => q.status === 'approved');

  // difficulty mapping helper (single-level / named levels)
  function matchesDifficulty(q, level){
    if (!level) return true;
    const d = Number(q.difficulty || 3);
    if (level === 'easy') return d <= 2;
    if (level === 'medium') return d === 3;
    if (level === 'difficult') return d === 4;
    if (level === 'extreme') return d >= 5;
    return true;
  }

  // helper to expand a distribution key like "1-3" or "4" into array of numeric levels
  function expandKeyToLevels(key){
    if (!key) return [];
    if (/^\d+-\d+$/.test(key)){
      const [a,b] = key.split('-').map(Number);
      const out = [];
      for(let i=a;i<=b;i++) out.push(i);
      return out;
    }
    const n = Number(key);
    if (!isNaN(n)) return [n];
    return [];
  }

  // filter by specialty/subspecialty (pool for later per-level filtering)
  let pool = allQs.filter(q => {
    if (specialtyId && q.specialtyId !== specialtyId) return false;
    if (subspecialtyId && q.subspecialtyId !== subspecialtyId) return false;
    // if a named difficultyLevel is provided and no distribution, apply it here
    if (!difficultyDistribution && !matchesDifficulty(q, difficultyLevel)) return false;
    return true;
  });

  let selected = [];

  if (selectionMode === 'manual' && Array.isArray(selectedQuestionIds) && selectedQuestionIds.length > 0){
    // validate selected ids
    const valid = selectedQuestionIds.filter(id => pool.find(q => q.id === id));
    selected = valid.slice(0, numQuestions);
  } else if (difficultyDistribution && typeof difficultyDistribution === 'object'){
    // difficultyDistribution is expected as { '1-3':50, '4':25, '5':25 } (percentages)
    const dist = difficultyDistribution;
    // compute target counts per bucket
    const buckets = Object.keys(dist).map(k => ({ key: k, pct: Number(dist[k]) || 0, levels: expandKeyToLevels(k) }));
    // normalize if percentages don't sum to 100
    const totalPct = buckets.reduce((s,b)=>s+b.pct, 0) || 100;
    if (totalPct !== 100 && totalPct > 0){
      buckets.forEach(b => { b.pct = Math.round((b.pct / totalPct) * 100); });
    }
    // initial allocation
    let allocations = buckets.map(b => ({ key: b.key, levels: b.levels, target: Math.round(numQuestions * (b.pct / 100)), taken: [] }));
    // adjust rounding differences so total targets == numQuestions
    let allocatedSum = allocations.reduce((s,a)=>s+a.target, 0);
    let diff = numQuestions - allocatedSum;
    // distribute diff starting from largest pct
    if (diff !== 0){
      const order = allocations.slice().sort((a,b)=> (b.levels.length - a.levels.length));
      for (let i=0; diff !== 0 && i<order.length; i++){
        order[i].target += diff > 0 ? 1 : -1;
        diff += diff > 0 ? -1 : 1;
      }
    }

    // pick from pool per bucket
    const poolByLevel = {};
    pool.forEach(q => { poolByLevel[q.difficulty] = poolByLevel[q.difficulty] || []; poolByLevel[q.difficulty].push(q); });

    allocations.forEach(a => {
      const candidates = [];
      a.levels.forEach(l => { (poolByLevel[l]||[]).forEach(q=>candidates.push(q)); });
      // shuffle candidates
      const shuffled = candidates.sort(() => 0.5 - Math.random());
      a.taken = shuffled.slice(0, Math.max(0, a.target));
    });

    // collect selected ids, if shortage in any bucket fill from remaining pool
    selected = allocations.flatMap(a => a.taken.map(q => q.id));
    if (selected.length < numQuestions){
      const remainingPool = pool.filter(q => !selected.includes(q.id));
      const more = remainingPool.sort(() => 0.5 - Math.random()).slice(0, numQuestions - selected.length).map(q => q.id);
      selected = selected.concat(more);
    }
  } else {
    // random selection from pool (honoring difficultyLevel if set)
    const shuffled = pool.sort(() => 0.5 - Math.random());
    selected = shuffled.slice(0, numQuestions).map(q => q.id);
  }

  selected = [...new Set(selected)].slice(0, numQuestions);
  const selectedQuestions = selected
    .map(id => allQs.find(q => q.id === id))
    .filter(Boolean);

  const totalDifficultyScore = selectedQuestions.reduce((sum, q) => {
    const score = Number(q.difficulty);
    return sum + (Number.isFinite(score) ? score : 3);
  }, 0);
  const averageDifficultyScore = selectedQuestions.length
    ? Number((totalDifficultyScore / selectedQuestions.length).toFixed(2))
    : 0;

  let computedDifficultyLevel = 'medium';
  if (averageDifficultyScore <= 2) computedDifficultyLevel = 'easy';
  else if (averageDifficultyScore <= 3) computedDifficultyLevel = 'medium';
  else if (averageDifficultyScore <= 4) computedDifficultyLevel = 'difficult';
  else computedDifficultyLevel = 'extreme';

  const specialties = readJson('specialties.json');
  const spec = specialties.find(s => s.id === specialtyId) || null;
  const subspec = spec && spec.subspecialties ? (spec.subspecialties.find(ss => ss.id === subspecialtyId) || null) : null;
  const exams = readJson('exams.json');
  const exam = {
    id: uuidv4(),
    title: title || 'Exam',
    createdBy: req.user.id,
    questions: selected,
    specialty: spec ? { id: spec.id, name: spec.name } : null,
    subspecialty: subspec ? { id: subspec.id, name: subspec.name } : null,
    difficultyLevel: difficultyLevel || null,
    difficultyDistribution: difficultyDistribution || null,
    selectionMode: selectionMode || 'random',
    passingScore: passingScore,
    totalDifficultyScore,
    averageDifficultyScore,
    computedDifficultyLevel,
    created_at: new Date().toISOString()
  };
  exams.push(exam);
  writeJson('exams.json', exams);
  res.json(exam);
});

app.get('/api/specialties', (req, res) => {
  const specs = readJson('specialties.json');
  res.json(specs);
});

app.get('/api/exams', authMiddleware, (req, res) => {
  const exams = readJson('exams.json');
  res.json(exams);
});

app.get('/api/exams/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const exams = readJson('exams.json');
  const exam = exams.find(e => e.id === id);
  if (!exam) return res.status(404).json({ error: 'not found' });
  const qs = readJson('questions.json');
  const questions = qs.filter(q => exam.questions.includes(q.id));
  res.json(Object.assign({}, exam, { questions }));
});

app.put('/api/exams/:id', authMiddleware, requireRole(['admin','clinician']), (req, res) => {
  const id = req.params.id;
  const { title, numQuestions, specialtyId, subspecialtyId, difficultyLevel, selectionMode, selectedQuestionIds, difficultyDistribution } = req.body;
  const exams = readJson('exams.json');
  const exam = exams.find(e => e.id === id);
  if (!exam) return res.status(404).json({ error: 'not found' });
  if (exam.createdBy !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'can only edit your own exams' });
  if (title !== undefined) exam.title = title;

  // update difficulty/selection metadata
  if (difficultyLevel !== undefined) exam.difficultyLevel = difficultyLevel || null;
  if (selectionMode !== undefined) exam.selectionMode = selectionMode || 'random';
  if (difficultyDistribution !== undefined) exam.difficultyDistribution = difficultyDistribution || null;

  // if manual selection provided, validate and set exact questions
  const allQs = readJson('questions.json').filter(q => q.status === 'approved');
  function matchesDifficulty(q, level){
    if (!level) return true;
    const d = Number(q.difficulty || 3);
    if (level === 'easy') return d <= 2;
    if (level === 'medium') return d === 3;
    if (level === 'difficult') return d === 4;
    if (level === 'extreme') return d >= 5;
    return true;
  }

  // helper to expand a distribution key like "1-3" or "4" into array of numeric levels
  function expandKeyToLevels(key){
    if (!key) return [];
    if (/^\d+-\d+$/.test(key)){
      const [a,b] = key.split('-').map(Number);
      const out = [];
      for(let i=a;i<=b;i++) out.push(i);
      return out;
    }
    const n = Number(key);
    if (!isNaN(n)) return [n];
    return [];
  }

  if (selectionMode === 'manual' && Array.isArray(selectedQuestionIds)){
    const valid = selectedQuestionIds.filter(id => allQs.find(q => q.id === id && matchesDifficulty(q, difficultyLevel)));
    exam.questions = valid.slice(0, selectedQuestionIds.length);
  } else if (numQuestions !== undefined || (specialtyId !== undefined && specialtyId !== exam.specialty?.id) || (subspecialtyId !== undefined && subspecialtyId !== exam.subspecialty?.id) || difficultyLevel !== undefined || difficultyDistribution !== undefined) {
    // regenerate questions according to filters and possible distribution
    let pool = allQs.filter(q => {
      if (specialtyId && q.specialtyId !== specialtyId) return false;
      if (subspecialtyId && q.subspecialtyId !== subspecialtyId) return false;
      if (!matchesDifficulty(q, difficultyLevel || exam.difficultyLevel)) return false;
      return true;
    });

    // if a difficultyDistribution is provided, allocate per-bucket
    if (difficultyDistribution && typeof difficultyDistribution === 'object'){
      const dist = difficultyDistribution;
      const buckets = Object.keys(dist).map(k => ({ key: k, pct: Number(dist[k]) || 0, levels: expandKeyToLevels(k) }));
      const totalPct = buckets.reduce((s,b)=>s+b.pct, 0) || 100;
      if (totalPct !== 100 && totalPct > 0) buckets.forEach(b => { b.pct = Math.round((b.pct / totalPct) * 100); });
      let allocations = buckets.map(b => ({ key: b.key, levels: b.levels, target: Math.round((numQuestions || exam.questions.length) * (b.pct / 100)), taken: [] }));
      let allocatedSum = allocations.reduce((s,a)=>s+a.target, 0);
      let diff = (numQuestions || exam.questions.length) - allocatedSum;
      if (diff !== 0){
        const order = allocations.slice().sort((a,b)=> (b.levels.length - a.levels.length));
        for (let i=0; diff !== 0 && i<order.length; i++){
          order[i].target += diff > 0 ? 1 : -1;
          diff += diff > 0 ? -1 : 1;
        }
      }

      const poolByLevel = {};
      pool.forEach(q => { poolByLevel[q.difficulty] = poolByLevel[q.difficulty] || []; poolByLevel[q.difficulty].push(q); });
      allocations.forEach(a => {
        const candidates = [];
        a.levels.forEach(l => { (poolByLevel[l]||[]).forEach(q=>candidates.push(q)); });
        const shuffled = candidates.sort(() => 0.5 - Math.random());
        a.taken = shuffled.slice(0, Math.max(0, a.target));
      });
      let selectedIds = allocations.flatMap(a => a.taken.map(q => q.id));
      if (selectedIds.length < (numQuestions || exam.questions.length)){
        const remainingPool = pool.filter(q => !selectedIds.includes(q.id));
        const more = remainingPool.sort(() => 0.5 - Math.random()).slice(0, (numQuestions || exam.questions.length) - selectedIds.length).map(q => q.id);
        selectedIds = selectedIds.concat(more);
      }
      exam.questions = selectedIds;
    } else {
      const shuffled = pool.sort(() => 0.5 - Math.random());
      exam.questions = shuffled.slice(0, numQuestions || exam.questions.length).map(q => q.id);
    }

    const specialties = readJson('specialties.json');
    const spec = specialties.find(s => s.id === (specialtyId || exam.specialty?.id)) || null;
    const subspec = spec && spec.subspecialties ? (spec.subspecialties.find(ss => ss.id === (subspecialtyId || exam.subspecialty?.id)) || null) : null;
    exam.specialty = spec ? { id: spec.id, name: spec.name } : exam.specialty;
    exam.subspecialty = subspec ? { id: subspec.id, name: subspec.name } : exam.subspecialty;
  }

  writeJson('exams.json', exams);
  const logs = readJson('audit_logs.json');
  logs.push({ id: uuidv4(), entity: 'exam', entity_id: id, action: 'edit', user_id: req.user.id, timestamp: new Date().toISOString() });
  writeJson('audit_logs.json', logs);
  res.json(exam);
});

app.delete('/api/exams/:id', authMiddleware, requireRole(['admin','clinician']), (req, res) => {
  const id = req.params.id;
  const exams = readJson('exams.json');
  const exam = exams.find(e => e.id === id);
  if (!exam) return res.status(404).json({ error: 'not found' });
  if (exam.createdBy !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'can only delete your own exams' });
  const updated = exams.filter(e => e.id !== id);
  writeJson('exams.json', updated);
  const logs = readJson('audit_logs.json');
  logs.push({ id: uuidv4(), entity: 'exam', entity_id: id, action: 'delete', user_id: req.user.id, timestamp: new Date().toISOString() });
  writeJson('audit_logs.json', logs);
  res.json({ success: true });
});

// Student exam flow
app.post('/api/student-exams/:examId/submit', authMiddleware, (req, res) => {
  const examId = req.params.examId;
  const { answers } = req.body; // [{ questionId, answer }]
  const exams = readJson('exams.json');
  const exam = exams.find(e => e.id === examId);
  if (!exam) return res.status(404).json({ error: 'exam not found' });
  const qs = readJson('questions.json');
  let correct = 0;
  answers.forEach(a => {
    const q = qs.find(x => x.id === a.questionId);
    if (!q) return;
    if ((a.answer || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase()) correct += 1;
  });
  const score = Math.round((correct / exam.questions.length) * 100);
  const passingScore = exam.passingScore !== undefined ? exam.passingScore : 50;
  const passed = score >= passingScore;
  const studentExams = readJson('student_exams.json');
  const se = { id: uuidv4(), examId, studentId: req.user.id, answers, score, passed, total: exam.questions.length, correct, passingScore, taken_at: new Date().toISOString() };
  studentExams.push(se);
  writeJson('student_exams.json', studentExams);
  res.json({ score, total: exam.questions.length, correct, passed, passingScore, resultId: se.id });
});

app.get('/api/student-exams', authMiddleware, (req, res) => {
  const list = readJson('student_exams.json');
  res.json(list.filter(s => s.studentId === req.user.id));
});

app.get('/api/all-student-exams', authMiddleware, requireRole(['admin','clinician','moderator']), (req, res) => {
  const studentExams = readJson('student_exams.json');
  const exams = readJson('exams.json');
  const users = readJson('users.json');
  const questions = readJson('questions.json');
  
  const results = studentExams.map(se => {
    const exam = exams.find(e => e.id === se.examId);
    const student = users.find(u => u.id === se.studentId);
    const examQuestions = questions.filter(q => exam && exam.questions.includes(q.id));
    let correct = 0;
    se.answers.forEach(a => {
      const q = examQuestions.find(x => x.id === a.questionId);
      if (q && (a.answer || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase()) correct += 1;
    });
    return {
      id: se.id,
      examId: se.examId,
      examTitle: exam?.title,
      studentId: se.studentId,
      studentName: student?.name,
      studentEmail: student?.email,
      score: se.score,
      correct: correct,
      total: examQuestions.length,
      taken_at: se.taken_at
    };
  });
  
  res.json(results);
});

app.get('/api/exam-results/:examId', authMiddleware, requireRole(['admin','clinician','moderator']), (req, res) => {
  const examId = req.params.examId;
  const studentExams = readJson('student_exams.json');
  const exams = readJson('exams.json');
  const users = readJson('users.json');
  const questions = readJson('questions.json');
  
  const exam = exams.find(e => e.id === examId);
  if (!exam) return res.status(404).json({ error: 'exam not found' });
  
  const examQuestions = questions.filter(q => exam.questions.includes(q.id));
  const results = studentExams.filter(se => se.examId === examId).map(se => {
    const student = users.find(u => u.id === se.studentId);
    let correct = 0;
    se.answers.forEach(a => {
      const q = examQuestions.find(x => x.id === a.questionId);
      if (q && (a.answer || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase()) correct += 1;
    });
    return {
      id: se.id,
      studentId: se.studentId,
      studentName: student?.name,
      studentEmail: student?.email,
      score: se.score,
      correct: correct,
      total: examQuestions.length,
      answers: se.answers,
      questions: examQuestions,
      taken_at: se.taken_at
    };
  });
  
  res.json(results);
});

// --- Student statistics (history & trends) ---
app.get('/api/my-stats', authMiddleware, (req, res) => {
  const studentId = req.user.id;
  const studentExams = readJson('student_exams.json').filter(s => s.studentId === studentId);
  const exams = readJson('exams.json');
  const users = readJson('users.json');

  const attempts = studentExams.map(se => {
    const exam = exams.find(e => e.id === se.examId) || {};
    return { id: se.id, examId: se.examId, examTitle: exam.title || 'Unknown', score: se.score, taken_at: se.taken_at, passed: se.passed, correct: se.correct, total: se.total, passingScore: se.passingScore };
  }).sort((a,b) => new Date(a.taken_at) - new Date(b.taken_at));

  const scores = attempts.map(a => a.score);
  const avg = scores.length ? Math.round(scores.reduce((s,x)=>s+x,0)/scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;
  const last = scores.length ? scores[scores.length-1] : null;

  // simple improvement metric: compare first-half average vs last-half average
  let improvement = 0;
  if (scores.length >= 2){
    const half = Math.floor(scores.length/2);
    const firstAvg = Math.round(scores.slice(0, half).reduce((s,x)=>s+x,0)/(half||1));
    const lastAvg = Math.round(scores.slice(half).reduce((s,x)=>s+x,0)/((scores.length-half)||1));
    improvement = lastAvg - firstAvg;
  }

  // per-exam averages
  const perExam = {};
  attempts.forEach(a => { perExam[a.examTitle] = perExam[a.examTitle] || { total:0, sum:0 }; perExam[a.examTitle].total++; perExam[a.examTitle].sum += a.score; });
  const perExamStats = Object.entries(perExam).map(([title, v]) => ({ title, avg: Math.round(v.sum / v.total), attempts: v.total }));

  res.json({ studentId, attempts, avgScore: avg, bestScore: best, lastScore: last, improvement, perExam: perExamStats });
});

app.get('/api/student-stats/:studentId', authMiddleware, (req, res) => {
  const studentId = req.params.studentId;
  // allow if self or clinician/admin/moderator
  if (req.user.id !== studentId && !['admin','clinician','moderator'].includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });

  const studentExams = readJson('student_exams.json').filter(s => s.studentId === studentId);
  const exams = readJson('exams.json');

  const attempts = studentExams.map(se => {
    const exam = exams.find(e => e.id === se.examId) || {};
    return { id: se.id, examId: se.examId, examTitle: exam.title || 'Unknown', score: se.score, taken_at: se.taken_at, passed: se.passed, correct: se.correct, total: se.total, passingScore: se.passingScore };
  }).sort((a,b) => new Date(a.taken_at) - new Date(b.taken_at));

  const scores = attempts.map(a => a.score);
  const avg = scores.length ? Math.round(scores.reduce((s,x)=>s+x,0)/scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;
  const last = scores.length ? scores[scores.length-1] : null;

  // improvement
  let improvement = 0;
  if (scores.length >= 2){
    const half = Math.floor(scores.length/2);
    const firstAvg = Math.round(scores.slice(0, half).reduce((s,x)=>s+x,0)/(half||1));
    const lastAvg = Math.round(scores.slice(half).reduce((s,x)=>s+x,0)/((scores.length-half)||1));
    improvement = lastAvg - firstAvg;
  }

  // per-exam stats
  const perExam = {};
  attempts.forEach(a => { perExam[a.examTitle] = perExam[a.examTitle] || { total:0, sum:0 }; perExam[a.examTitle].total++; perExam[a.examTitle].sum += a.score; });
  const perExamStats = Object.entries(perExam).map(([title, v]) => ({ title, avg: Math.round(v.sum / v.total), attempts: v.total }));

  res.json({ studentId, attempts, avgScore: avg, bestScore: best, lastScore: last, improvement, perExam: perExamStats });
});

// PDF Report generation
app.get('/api/student-exams/:resultId/pdf', authMiddleware, (req, res) => {
  try {
    const resultId = req.params.resultId;
    const studentExams = readJson('student_exams.json');
    const se = studentExams.find(e => e.id === resultId);
    if (!se) return res.status(404).json({ error: 'exam result not found' });
    if (se.studentId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'not your exam' });

    const exams = readJson('exams.json');
    const exam = exams.find(e => e.id === se.examId);
    const users = readJson('users.json');
    const student = users.find(u => u.id === se.studentId);
    const questions = readJson('questions.json');

    const doc = new PDFDocument({ margin: 40 });
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="exam-report-${se.id}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Medical Learning Exam Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown();

    // Student Info
    doc.fontSize(12).font('Helvetica-Bold').text('Student Information');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${student?.name || 'Unknown'}`);
    doc.text(`Email: ${student?.email || 'N/A'}`);
    doc.text(`ID: ${se.studentId}`);
    doc.moveDown();

    // Exam Info
    doc.fontSize(12).font('Helvetica-Bold').text('Exam Details');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Exam: ${exam?.title || 'Unknown'}`);
    doc.text(`Date Taken: ${new Date(se.taken_at).toLocaleString()}`);
    doc.text(`Specialty: ${exam?.specialty?.name || 'N/A'}`);
    if (exam?.subspecialty?.name) doc.text(`Subspecialty: ${exam.subspecialty.name}`);
    doc.moveDown();

    // Results
    const passed = se.passed !== undefined ? se.passed : (se.score >= (se.passingScore || 50));
    doc.fontSize(12).font('Helvetica-Bold').text('Exam Results');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Score: ${se.score}%`, { underline: true });
    doc.text(`Correct Answers: ${se.correct}/${se.total || exam?.questions?.length || 'N/A'}`);
    doc.text(`Passing Score Required: ${se.passingScore || exam?.passingScore || 50}%`);
    doc.fontSize(14).font('Helvetica-Bold');
    const statusColor = passed ? [21, 128, 61] : [220, 38, 38]; // green or red
    doc.fillColor(...statusColor).text(passed ? '✓ PASSED' : '✗ FAILED');
    doc.fillColor('black');
    doc.moveDown();

    // Question Breakdown (if available)
    if (se.answers && se.answers.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Question Breakdown');
      doc.fontSize(9).font('Helvetica');
      se.answers.slice(0, 10).forEach((ans, i) => {
        const q = questions.find(x => x.id === ans.questionId);
        const correct = q && (ans.answer || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase();
        doc.text(`${i + 1}. ${q?.title || 'Unknown'}`);
        doc.text(`   Your answer: ${ans.answer || '(none)'}`, { color: correct ? '#16a34a' : '#dc2626' });
        if (!correct) doc.text(`   Correct answer: ${q?.answer || 'N/A'}`, { color: '#16a34a' });
        doc.moveDown(0.3);
      });
      if (se.answers.length > 10) {
        doc.text(`... and ${se.answers.length - 10} more questions`);
      }
    }

    doc.moveDown();
    doc.fontSize(9).font('Helvetica').fillColor('#666').text('This is an official exam report. For questions, contact your institution.', { align: 'center' });

    doc.end();
  } catch(err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
  }
});

app.get('/', (req, res) => res.send('med-km mock API is running'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Mock API listening on ${PORT}`));
