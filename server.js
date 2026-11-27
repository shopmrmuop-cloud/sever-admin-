require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '15m';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'packages.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

function readPackages() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writePackages(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

// ==================== HEALTH ====================
app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'Mr.mướp Admin Server',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

// ==================== ADMIN LOGIN ====================
app.post('/api/admin/login', (req, res) => {
  const { token, deviceId } = req.body || {};

  if (!token || !deviceId) {
    return res.status(400).json({
      ok: false,
      code: 'BAD_REQUEST',
      message: 'Thiếu token hoặc deviceId'
    });
  }

  if (token !== ADMIN_TOKEN) {
    console.log(`[ADMIN FAIL] deviceId=${deviceId}`);
    return res.status(401).json({
      ok: false,
      code: 'INVALID_TOKEN',
      message: 'Token không hợp lệ'
    });
  }

  const accessToken = jwt.sign(
    { role: 'admin', deviceId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  console.log(`[ADMIN OK] deviceId=${deviceId}`);

  res.json({
    ok: true,
    accessToken,
    expiresIn: 900
  });
});

// ==================== CÔNG KHAI: LẤY GÓI ĐANG BẬT ====================
app.get('/api/packages', (req, res) => {
  const list = readPackages().filter(p => p.enabled === true);
  res.json({ ok: true, data: list });
});

// ==================== ADMIN: LẤY TẤT CẢ GÓI ====================
app.get('/api/admin/packages', auth, (req, res) => {
  res.json({ ok: true, data: readPackages() });
});

// ==================== ADMIN: TẠO GÓI MỚI ====================
app.post('/api/admin/packages', auth, (req, res) => {
  const b = req.body || {};

  if (!b.name || !b.version) {
    return res.status(400).json({
      ok: false,
      message: 'Thiếu name hoặc version'
    });
  }

  const list = readPackages();
  const pkg = {
    id: uuidv4(),
    name: String(b.name).trim(),
    description: b.description ? String(b.description).trim() : '',
    version: String(b.version).trim(),
    tag: b.tag ? String(b.tag).trim() : null,
    downloadUrl: b.downloadUrl || '',
    sha256: b.sha256 || '',
    targetPath: b.targetPath || '/data/local/tmp/',
    imageUrl: b.imageUrl || '',
    enabled: b.enabled !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  list.push(pkg);
  writePackages(list);

  res.json({ ok: true, data: pkg });
});

// ==================== ADMIN: SỬA GÓI ====================
app.put('/api/admin/packages/:id', auth, (req, res) => {
  const list = readPackages();
  const idx = list.findIndex(p => p.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ ok: false, message: 'Không tìm thấy gói' });
  }

  const old = list[idx];
  const b = req.body || {};

  list[idx] = {
    ...old,
    name: b.name !== undefined ? String(b.name).trim() : old.name,
    description: b.description !== undefined ? String(b.description).trim() : old.description,
    version: b.version !== undefined ? String(b.version).trim() : old.version,
    tag: b.tag !== undefined ? (b.tag ? String(b.tag).trim() : null) : old.tag,
    downloadUrl: b.downloadUrl !== undefined ? b.downloadUrl : old.downloadUrl,
    sha256: b.sha256 !== undefined ? b.sha256 : old.sha256,
    targetPath: b.targetPath !== undefined ? b.targetPath : old.targetPath,
    imageUrl: b.imageUrl !== undefined ? b.imageUrl : old.imageUrl,
    enabled: b.enabled !== undefined ? !!b.enabled : old.enabled,
    updatedAt: new Date().toISOString()
  };

  writePackages(list);
  res.json({ ok: true, data: list[idx] });
});

// ==================== ADMIN: XÓA GÓI ====================
app.delete('/api/admin/packages/:id', auth, (req, res) => {
  let list = readPackages();
  const before = list.length;
  list = list.filter(p => p.id !== req.params.id);

  if (list.length === before) {
    return res.status(404).json({ ok: false, message: 'Không tìm thấy gói' });
  }

  writePackages(list);
  res.json({ ok: true, message: 'Đã xóa gói' });
});

// ==================== ADMIN: BẬT / TẮT GÓI ====================
app.patch('/api/admin/packages/:id/toggle', auth, (req, res) => {
  const list = readPackages();
  const idx = list.findIndex(p => p.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ ok: false, message: 'Không tìm thấy gói' });
  }

  list[idx].enabled = !list[idx].enabled;
  list[idx].updatedAt = new Date().toISOString();
  writePackages(list);

  res.json({ ok: true, data: list[idx] });
});

// ==================== START ====================
app.listen(PORT, () => {
  console.log('=================================');
  console.log(' Mr.mướp Admin Server');
  console.log(' Port:', PORT);
  console.log('=================================');
});
