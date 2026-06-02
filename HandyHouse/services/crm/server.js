const http = require('http');
const busboy = require('busboy');

// ─── MinIO config ────────────────────────────────────────────────────────────
// Jika MINIO_ENDPOINT = 'minio' (Docker internal), otomatis ganti ke 'localhost'
const _ep = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_ENDPOINT  = _ep === 'minio' ? 'localhost' : _ep;
const MINIO_PORT      = parseInt(process.env.MINIO_PORT || '9000');
const MINIO_ACCESS    = process.env.MINIO_ACCESS_KEY   || 'admin';
const MINIO_SECRET    = process.env.MINIO_SECRET_KEY   || 'adminpassword';
const MINIO_BUCKET    = 'crm-assets';
const SERVICE         = 'crm';

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
    const safeName  = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
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
        message : `✅ File berhasil diunggah ke MinIO!`,
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
  <title>CRM Dashboard - HandyHouse</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff7ed; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; padding: 40px 20px; }
    .container { max-width: 1100px; margin: 0 auto; }

    /* Header */
    .header { margin-bottom: 32px; }
    .header h1 { font-size: 32px; font-weight: 900; color: #1f2937; margin-bottom: 6px; letter-spacing: -0.5px; }
    .header p { font-size: 16px; color: #6b7280; font-weight: 500; }

    /* Stats Row */
    .stats-row { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    .card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #ffedd5; flex: 1; min-width: 280px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .stat-label { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .stat-value-orange { font-size: 44px; font-weight: 900; color: #ea580c; line-height: 1; }
    .stat-value-green { font-size: 28px; font-weight: 800; color: #16a34a; line-height: 1.2; }
    .stat-value-green span { font-size: 13px; color: #9ca3af; display: block; margin-top: 6px; font-weight: 500; }
    .dot-green { width: 12px; height: 12px; background: #22c55e; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px rgba(34,197,94,0.6); margin-right: 8px; }
    .stat-status { display: flex; align-items: center; font-size: 16px; color: #374151; font-weight: 700; }

    /* Section */
    .section-title { font-size: 20px; font-weight: 800; color: #1f2937; margin-bottom: 24px; border-bottom: 2px solid #ffedd5; padding-bottom: 12px; }

    /* Form */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .stats-row { flex-direction: column; } }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 14px; font-weight: 700; color: #374151; }
    input[type=text], input[type=email] {
      padding: 14px 16px; border: 2px solid #fdba74; border-radius: 8px;
      font-size: 15px; outline: none; width: 100%; background: #fffaf0;
      color: #1f2937; transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    input[type=text]:focus, input[type=email]:focus { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234,88,12,0.15); }
    .btn-primary { background: #ea580c; color: #fff; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(234,88,12,0.3); font-family: inherit; transition: background 0.2s, transform 0.1s; }
    .btn-primary:hover { background: #c2410c; transform: translateY(-1px); }

    /* Table */
    .table-card { background: #fff; border-radius: 12px; border: 1px solid #ffedd5; margin-bottom: 32px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .table-header { padding: 20px 24px; border-bottom: 1px solid #ffedd5; display: flex; justify-content: space-between; align-items: center; }
    .table-header h3 { font-size: 18px; font-weight: 800; color: #1f2937; }
    .badge-count { font-size: 13px; color: #ea580c; background: #fff7ed; border: 1px solid #fdba74; padding: 5px 12px; border-radius: 20px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { padding: 14px 16px; border-bottom: 2px solid #ffedd5; background: #fff7ed; color: #9a3412; font-weight: 700; text-align: left; }
    td { padding: 14px 16px; border-bottom: 1px solid #ffedd5; color: #4b5563; }
    tr:last-child td { border-bottom: none; }
    .badge-green { background: #dcfce7; border: 1px solid #22c55e; color: #166534; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }
    .badge-gray { background: #f3f4f6; color: #6b7280; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .td-sub { font-size: 13px; color: #9ca3af; display: block; margin-top: 3px; }
    .btn-outline { border: 2px solid #fdba74; color: #ea580c; padding: 7px 14px; border-radius: 6px; font-size: 13px; font-weight: 700; background: #fffaf0; cursor: pointer; transition: all 0.2s; font-family: inherit; }
    .btn-outline:hover { background: #ea580c; color: #fff; }

    /* Upload */
    .upload-zone { display: flex; align-items: center; gap: 15px; padding: 20px; border: 2px dashed #fdba74; border-radius: 8px; background: #fffaf0; margin-bottom: 16px; }
    input[type=file] { font-size: 15px; color: #ea580c; font-weight: 600; width: 100%; cursor: pointer; }
    .btn-upload { background: #fed7aa; color: #9a3412; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; font-family: inherit; transition: background 0.2s; }
    .btn-upload:hover { background: #fb923c; color: #fff; }
    .btn-upload:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
    .msg-success { padding: 16px; background: #dcfce7; color: #166534; border-radius: 8px; margin-top: 16px; font-size: 15px; font-weight: 600; border: 1px solid #bbf7d0; }
    .msg-error { padding: 16px; background: #fee2e2; color: #991b1b; border-radius: 8px; margin-top: 16px; font-size: 15px; font-weight: 600; border: 1px solid #fecaca; }

    /* Port badge */
    .port-badge { display: inline-flex; align-items: center; gap: 8px; background: #ea580c; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="port-badge">🟠 CRM Service · Port 3001</span>
      <h1>CRM Dashboard</h1>
      <p>Manajemen Pelanggan dan Penjualan HandyHouse</p>
    </div>

    <div class="stats-row">
      <div class="card">
        <div class="stat-label">Total Pelanggan</div>
        <div class="stat-value-orange">5</div>
      </div>
      <div class="card">
        <div class="stat-label">Potensi Penjualan</div>
        <div class="stat-value-green">Rp 10.000.000 <span>Dari tabel crm_opportunities</span></div>
      </div>
      <div class="card">
        <div class="stat-label">Status Database</div>
        <div class="stat-status"><span class="dot-green"></span> Neon Cloud Active</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:32px;">
      <h3 class="section-title">Tambah Pelanggan Baru</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>Nama Lengkap *</label>
          <input type="text" placeholder="Cth: Budi Santoso" />
        </div>
        <div class="form-group">
          <label>Alamat Email *</label>
          <input type="email" placeholder="Cth: budi@contoh.com" />
        </div>
        <div class="form-group">
          <label>Nomor Telepon</label>
          <input type="text" placeholder="Cth: 081234567890" />
        </div>
        <div class="form-group">
          <label>Alamat Pelanggan</label>
          <input type="text" placeholder="Cth: Jl. Melati No. 12, Jakarta" />
        </div>
      </div>
      <button class="btn-primary">Simpan Pelanggan</button>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>Daftar Pelanggan &amp; Prospek</h3>
        <span class="badge-count">10 Terbaru</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nama Pelanggan</th>
            <th>Alamat</th>
            <th>Status Prospek</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong style="color:#1f2937;font-size:15px;">PT Mega Karya Sejahtera</strong>
              <span class="td-sub">contact@megakarya.co.id</span>
            </td>
            <td>Jl. Jend. Sudirman Kav. 21, Jakarta Selatan</td>
            <td><span class="badge-green">QUALIFIED</span></td>
            <td><button class="btn-outline">+ JADIKAN PROSPEK</button></td>
          </tr>
          <tr>
            <td>
              <strong style="color:#1f2937;font-size:15px;">Bintang Harapan, CV</strong>
              <span class="td-sub">purchasing@bintangharapan.com</span>
            </td>
            <td>Kawasan Industri Pulo Gadung Blok 4, Jakarta Timur</td>
            <td><span class="badge-gray">Bukan Prospek</span></td>
            <td><button class="btn-outline">+ JADIKAN PROSPEK</button></td>
          </tr>
          <tr>
            <td>
              <strong style="color:#1f2937;font-size:15px;">Diana Larasati</strong>
              <span class="td-sub">diana.larasati99@gmail.com</span>
            </td>
            <td>Jl. Setiabudi No. 45, Bandung, Jawa Barat</td>
            <td><span class="badge-gray">Bukan Prospek</span></td>
            <td><button class="btn-outline">+ JADIKAN PROSPEK</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 class="section-title">Unggah Dokumen ke MinIO</h3>
      <div class="upload-zone">
        <input type="file" id="crm-file" onchange="handleFileChange(this)" />
      </div>
      <button class="btn-upload" id="upload-btn" onclick="handleUpload()">Upload File</button>
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
      btn.disabled  = true;
      btn.textContent = 'Uploading...';
      msgEl.innerHTML = '';
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', 'Customer Document');
      try {
        /* Upload langsung ke server ini (port 3001), bukan ke gateway */
        const res  = await fetch('/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
          msgEl.innerHTML = '<div class="msg-success">✅ ' + data.message + '<br><a href="' + data.url + '" target="_blank" style="color:#166534;font-weight:700;">Buka File &rarr;</a></div>';
          document.getElementById('crm-file').value = '';
          selectedFile = null;
        } else {
          msgEl.innerHTML = '<div class="msg-error">❌ ' + (data.message || 'Terjadi kesalahan saat mengunggah file.') + '</div>';
        }
      } catch(e) {
        msgEl.innerHTML = '<div class="msg-error">❌ Gagal terhubung ke server: ' + e.message + '</div>';
      }
      btn.disabled    = false;
      btn.textContent = 'Upload File';
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

const PORT = 3001;
server.listen(PORT, () => {
  console.log('');
  console.log('  \x1b[38;5;208m▲ CRM Dashboard - HandyHouse\x1b[0m');
  console.log('');
  console.log('  \x1b[1mLocal:\x1b[0m         http://localhost:' + PORT);
  console.log('  \x1b[1mUpload API:\x1b[0m    http://localhost:' + PORT + '/upload');
  console.log('');
  console.log('  Ready! CRM Dashboard running on port ' + PORT);
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\x1b[31m✗ Port ' + PORT + ' already in use!\x1b[0m');
    console.error('  Run: npm run kill:3001');
    process.exit(1);
  }
});
