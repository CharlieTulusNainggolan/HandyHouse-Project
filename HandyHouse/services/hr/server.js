const http = require('http');
const busboy = require('busboy');

// ─── MinIO config ────────────────────────────────────────────────────────────
// Jika MINIO_ENDPOINT = 'minio' (Docker internal), otomatis ganti ke 'localhost'
const _ep = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_ENDPOINT  = _ep === 'minio' ? 'localhost' : _ep;
const MINIO_PORT      = parseInt(process.env.MINIO_PORT || '9000');
const MINIO_ACCESS    = process.env.MINIO_ACCESS_KEY   || 'admin';
const MINIO_SECRET    = process.env.MINIO_SECRET_KEY   || 'adminpassword';
const MINIO_BUCKET    = 'hr-assets';
const SERVICE         = 'hr';

let minioClient = null;
try {
  const { Client } = require('minio');
  minioClient = new Client({
    endPoint : MINIO_ENDPOINT,
    port     : MINIO_PORT,
    useSSL   : false,
    accessKey: MINIO_ACCESS,
    secretKey: MINIO_SECRET,
  });
  console.log(`  MinIO → ${MINIO_ENDPOINT}:${MINIO_PORT} (bucket: ${MINIO_BUCKET})`);
} catch (e) {
  console.warn('\x1b[33m⚠ MinIO client gagal diinisialisasi:', e.message, '\x1b[0m');
}

// ─── Helper: pastikan bucket ada ─────────────────────────────────────────────
async function ensureBucket() {
  const exists = await minioClient.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await minioClient.makeBucket(MINIO_BUCKET, 'us-east-1');
    console.log(`  Bucket '${MINIO_BUCKET}' dibuat.`);
  }
}

// ─── Upload handler ───────────────────────────────────────────────────────────
function handleUpload(req, res) {
  const cors = {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type'                : 'application/json; charset=utf-8',
  };

  if (!minioClient) {
    res.writeHead(503, cors);
    return res.end(JSON.stringify({
      message: 'MinIO tidak tersedia. Pastikan Docker container MinIO sedang berjalan (port 9000).',
    }));
  }

  const bb = busboy({ headers: req.headers });
  let handled = false;

  bb.on('file', async (_field, fileStream, info) => {
    handled = true;
    const { filename, mimeType } = info;
    const safeName   = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectName = `${SERVICE}/${Date.now()}-${safeName}`;

    try {
      await ensureBucket();
      await minioClient.putObject(MINIO_BUCKET, objectName, fileStream, undefined, {
        'Content-Type': mimeType || 'application/octet-stream',
      });

      const url = `http://localhost:${MINIO_PORT}/${MINIO_BUCKET}/${objectName}`;
      res.writeHead(200, cors);
      res.end(JSON.stringify({
        success : true,
        url,
        filename: objectName,
        message : `✅ Dokumen berhasil diunggah ke MinIO!`,
      }));
    } catch (e) {
      handled = true;
      if (!res.headersSent) {
        res.writeHead(500, cors);
        res.end(JSON.stringify({ message: `Gagal upload ke MinIO: ${e.message}` }));
      }
    }
  });

  bb.on('finish', () => {
    if (!handled && !res.headersSent) {
      res.writeHead(400, cors);
      res.end(JSON.stringify({ message: 'Tidak ada file yang dipilih.' }));
    }
  });

  bb.on('error', (e) => {
    if (!res.headersSent) {
      res.writeHead(500, cors);
      res.end(JSON.stringify({ message: `Error parsing form: ${e.message}` }));
    }
  });

  req.pipe(bb);
}

// ─── HTML Dashboard ───────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HR Dashboard - HandyHouse</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #eff6ff; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; padding: 40px 20px; }
    .container { max-width: 1100px; margin: 0 auto; }

    .header { margin-bottom: 32px; }
    .header h1 { font-size: 32px; font-weight: 900; color: #1e3a8a; margin-bottom: 6px; letter-spacing: -0.5px; }
    .header p { font-size: 16px; color: #64748b; font-weight: 500; }

    .stats-row { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    .card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #dbeafe; flex: 1; min-width: 280px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .stat-value-blue { font-size: 44px; font-weight: 900; color: #2563eb; line-height: 1; }
    .dot-green { width: 12px; height: 12px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px rgba(34,197,94,0.6); margin-right: 8px; }
    .stat-status { display: flex; align-items: center; font-size: 16px; color: #334155; font-weight: 700; }

    .section-title { font-size: 20px; font-weight: 800; color: #1e3a8a; margin-bottom: 24px; border-bottom: 2px solid #dbeafe; padding-bottom: 12px; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .stats-row { flex-direction: column; } }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 14px; font-weight: 700; color: #334155; }
    input[type=text], input[type=email] {
      padding: 14px 16px; border: 2px solid #93c5fd; border-radius: 8px;
      font-size: 15px; outline: none; width: 100%; background: #f8fafc;
      color: #1e293b; transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    input[type=text]:focus, input[type=email]:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
    .btn-primary { background: #2563eb; color: #fff; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.3); font-family: inherit; transition: background 0.2s, transform 0.1s; }
    .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }

    .table-card { background: #fff; border-radius: 12px; border: 1px solid #dbeafe; margin-bottom: 32px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .table-header { padding: 20px 24px; border-bottom: 1px solid #dbeafe; }
    .table-header h3 { font-size: 18px; font-weight: 800; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { padding: 14px 16px; border-bottom: 2px solid #dbeafe; background: #eff6ff; color: #1e40af; font-weight: 700; text-align: left; }
    td { padding: 14px 16px; border-bottom: 1px solid #dbeafe; color: #475569; }
    tr:last-child td { border-bottom: none; }
    .badge-green { background: #dcfce7; border: 1px solid #22c55e; color: #166534; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }
    .badge-blue { background: #dbeafe; color: #1e40af; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .btn-confirm { background: #16a34a; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 800; cursor: pointer; font-family: inherit; box-shadow: 0 2px 4px rgba(22,163,74,0.3); transition: background 0.2s; }
    .btn-confirm:hover { background: #15803d; }

    .upload-zone { display: flex; align-items: center; gap: 15px; padding: 20px; border: 2px dashed #93c5fd; border-radius: 8px; background: #f8fafc; margin-bottom: 16px; }
    input[type=file] { font-size: 15px; color: #2563eb; font-weight: 600; width: 100%; cursor: pointer; }
    .btn-upload { background: #bfdbfe; color: #1e40af; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; font-family: inherit; transition: background 0.2s; }
    .btn-upload:hover { background: #3b82f6; color: #fff; }
    .btn-upload:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
    .msg-success { padding: 16px; background: #dcfce7; color: #166534; border-radius: 8px; margin-top: 16px; font-size: 15px; font-weight: 600; border: 1px solid #bbf7d0; }
    .msg-error { padding: 16px; background: #fee2e2; color: #991b1b; border-radius: 8px; margin-top: 16px; font-size: 15px; font-weight: 600; border: 1px solid #fecaca; }

    .port-badge { display: inline-flex; align-items: center; gap: 8px; background: #2563eb; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="port-badge">🔵 HR Service · Port 3002</span>
      <h1>HR Dashboard</h1>
      <p>Sistem Informasi Pegawai HandyHouse</p>
    </div>

    <div class="stats-row">
      <div class="card">
        <div class="stat-label">Total Pegawai Aktif</div>
        <div class="stat-value-blue">6</div>
      </div>
      <div class="card">
        <div class="stat-label">Status Server</div>
        <div class="stat-status"><span class="dot-green"></span> Sistem Online &amp; Stabil</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:32px;">
      <h3 class="section-title">Tambah Pegawai Baru</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input type="text" placeholder="Cth: Budi Santoso" />
        </div>
        <div class="form-group">
          <label>Departemen/Divisi</label>
          <input type="text" placeholder="Cth: IT, Marketing, Sales" />
        </div>
        <div class="form-group">
          <label>Jabatan</label>
          <input type="text" placeholder="Cth: Software Engineer" />
        </div>
        <div class="form-group">
          <label>Gaji Pokok (Rp)</label>
          <input type="text" placeholder="Cth: 8000000" />
        </div>
      </div>
      <button class="btn-primary">Simpan Pegawai</button>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>Daftar Pegawai &amp; Absensi Hari Ini</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nama Pegawai</th>
            <th>Jabatan</th>
            <th>Departemen</th>
            <th>Status Absen</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style="color:#1e293b;font-size:15px;">Dewi Sartika</strong></td>
            <td>UI/UX Designer</td>
            <td>IT Engineering</td>
            <td><span class="badge-green">✓ Sudah Hadir</span></td>
            <td></td>
          </tr>
          <tr>
            <td><strong style="color:#1e293b;font-size:15px;">Heri Saputra</strong></td>
            <td>Chief Executive Officer</td>
            <td>Executive Board</td>
            <td><span class="badge-blue">Belum Absen</span></td>
            <td><button class="btn-confirm">KONFIRMASI HADIR</button></td>
          </tr>
          <tr>
            <td><strong style="color:#1e293b;font-size:15px;">Lestari Putri</strong></td>
            <td>Sales Executive</td>
            <td>Sales &amp; Marketing</td>
            <td><span class="badge-blue">Belum Absen</span></td>
            <td><button class="btn-confirm">KONFIRMASI HADIR</button></td>
          </tr>
          <tr>
            <td><strong style="color:#1e293b;font-size:15px;">Budi Santoso</strong></td>
            <td>Senior Developer</td>
            <td>IT Engineering</td>
            <td><span class="badge-blue">Belum Absen</span></td>
            <td><button class="btn-confirm">KONFIRMASI HADIR</button></td>
          </tr>
          <tr>
            <td><strong style="color:#1e293b;font-size:15px;">Siti Aminah</strong></td>
            <td>HR Manager</td>
            <td>Human Resources</td>
            <td><span class="badge-blue">Belum Absen</span></td>
            <td><button class="btn-confirm">KONFIRMASI HADIR</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 class="section-title">Unggah Dokumen Rahasia (KTP/CV)</h3>
      <div class="upload-zone">
        <input type="file" id="hr-file" onchange="handleFileChange(this)" />
      </div>
      <button class="btn-upload" id="upload-btn" onclick="handleUpload()">Upload Dokumen</button>
      <div id="upload-msg"></div>
    </div>
  </div>

  <script>
    let selectedFile = null;
    function handleFileChange(input) {
      selectedFile = input.files[0] || null;
    }
    async function handleUpload() {
      const btn   = document.getElementById('upload-btn');
      const msgEl = document.getElementById('upload-msg');
      if (!selectedFile) {
        msgEl.innerHTML = '<div class="msg-error">Tolong pilih dokumen terlebih dahulu.</div>';
        return;
      }
      btn.disabled    = true;
      btn.textContent = 'Uploading...';
      msgEl.innerHTML = '';
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', 'Employee Document');
      formData.append('position', 'Staff');
      try {
        /* Upload langsung ke server ini (port 3002), bukan ke gateway */
        const res  = await fetch('/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
          msgEl.innerHTML = '<div class="msg-success">✅ ' + data.message + '<br><a href="' + data.url + '" target="_blank" style="color:#166534;font-weight:700;">Buka File &rarr;</a></div>';
          document.getElementById('hr-file').value = '';
          selectedFile = null;
        } else {
          msgEl.innerHTML = '<div class="msg-error">❌ ' + (data.message || 'Terjadi kesalahan saat mengunggah file.') + '</div>';
        }
      } catch(e) {
        msgEl.innerHTML = '<div class="msg-error">❌ Gagal terhubung ke server: ' + e.message + '</div>';
      }
      btn.disabled    = false;
      btn.textContent = 'Upload Dokumen';
    }
  </script>
</body>
</html>`;

// ─── HTTP Server dengan routing ───────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // ── POST /upload → proses file upload ke MinIO
  if (req.method === 'POST' && req.url === '/upload') {
    return handleUpload(req, res);
  }

  // ── GET /* → sajikan HTML dashboard
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log('');
  console.log('  \x1b[34m▲ HR Dashboard - HandyHouse\x1b[0m');
  console.log('');
  console.log('  \x1b[1mLocal:\x1b[0m         http://localhost:' + PORT);
  console.log('  \x1b[1mUpload API:\x1b[0m    http://localhost:' + PORT + '/upload');
  console.log('');
  console.log('  Ready! HR Dashboard running on port ' + PORT);
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\x1b[31m✗ Port ' + PORT + ' already in use!\x1b[0m');
    console.error('  Run: npm run kill:3002');
    process.exit(1);
  }
});
