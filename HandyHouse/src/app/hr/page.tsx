'use client';

import React, { useState } from 'react';

export default function HRDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'success'|'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setMessage('Tolong pilih dokumen terlebih dahulu.');
      setStatus('error');
      return;
    }

    setIsUploading(true);
    setMessage('');
    setStatus('idle');
    setPreviewUrl('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', 'Employee Document');
    formData.append('position', 'Staff');

    try {
      const response = await fetch('/api/hr/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Dokumen berhasil diunggah ke MinIO!');
        setPreviewUrl(data.url);
        setFile(null);
        const fileInput = document.getElementById('hr-file') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      } else {
        setStatus('error');
        setMessage(data.message || 'Terjadi kesalahan saat mengunggah file.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Gagal terhubung ke server API Gateway.');
    } finally {
      setIsUploading(false);
    }
  };

  const isImage = previewUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null;

  const styles = {
    page: { backgroundColor: '#eff6ff', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' },
    container: { maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', flexDirection: 'column' as const, marginBottom: '32px' },
    headerTitle: { fontSize: '32px', fontWeight: '800', color: '#1e3a8a', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
    headerSub: { fontSize: '16px', color: '#64748b', margin: 0, fontWeight: '500' },
    
    row: { display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' as const },
    card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #dbeafe', flex: '1', minWidth: '280px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' },
    
    statTitle: { fontSize: '14px', color: '#64748b', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
    statValueBlue: { fontSize: '40px', color: '#2563eb', fontWeight: '900', margin: 0, lineHeight: 1 },
    statStatus: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#334155', fontWeight: '700', height: '100%' },
    dotGreen: { width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.6)' },
    
    sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#1e3a8a', marginBottom: '24px', borderBottom: '2px solid #dbeafe', paddingBottom: '12px' },
    
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    formGroup: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
    label: { fontSize: '14px', fontWeight: '700', color: '#334155' },
    input: { 
      padding: '14px 16px', 
      border: '2px solid #93c5fd', 
      borderRadius: '8px', 
      fontSize: '15px', 
      outline: 'none', 
      width: '100%', 
      boxSizing: 'border-box' as const,
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
    },
    btnPrimary: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-block', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.3)' },
    btnUpload: { backgroundColor: '#bfdbfe', color: '#1e40af', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-block', marginTop: '12px', fontSize: '14px' },
    btnUploadDisabled: { backgroundColor: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' },
    
    tableWrapper: { overflowX: 'auto' as const, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dbeafe' },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const, fontSize: '14px' },
    th: { padding: '16px', borderBottom: '2px solid #dbeafe', backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '700' },
    td: { padding: '16px', borderBottom: '1px solid #dbeafe', color: '#475569' },
    badgeGreen: { backgroundColor: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #22c55e' },
    badgeBlue: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block' },
    btnActionGreen: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 4px rgba(22,163,74,0.3)' },
    
    fileInputWrapper: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', padding: '20px', border: '2px dashed #93c5fd', borderRadius: '8px', backgroundColor: '#f8fafc' },
    fileInput: { fontSize: '15px', color: '#2563eb', fontWeight: '600', width: '100%' },
    
    messageSuccess: { padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginTop: '16px', fontSize: '15px', fontWeight: '600', border: '1px solid #bbf7d0' },
    messageError: { padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginTop: '16px', fontSize: '15px', fontWeight: '600', border: '1px solid #fecaca' },
    previewImage: { maxWidth: '250px', borderRadius: '8px', marginTop: '16px', border: '2px solid #dbeafe', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    previewLink: { color: '#2563eb', textDecoration: 'none', marginTop: '16px', display: 'inline-block', fontSize: '15px', fontWeight: '700', padding: '12px 20px', backgroundColor: '#f8fafc', border: '2px solid #93c5fd', borderRadius: '8px' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>HR Dashboard</h1>
          <p style={styles.headerSub}>Sistem Informasi Pegawai HandyHouse</p>
        </div>

        <div style={styles.row}>
          <div style={styles.card}>
            <div style={styles.statTitle}>Total Pegawai Aktif</div>
            <h2 style={styles.statValueBlue}>6</h2>
          </div>
          <div style={styles.card}>
            <div style={styles.statTitle}>Status Server</div>
            <div style={styles.statStatus}>
              <span style={styles.dotGreen}></span> Sistem Online & Stabil
            </div>
          </div>
        </div>

        <div style={{...styles.card, marginBottom: '32px'}}>
          <h3 style={styles.sectionTitle}>Tambah Pegawai Baru</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Lengkap</label>
                <input style={styles.input} type="text" placeholder="Cth: Budi Santoso" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Departemen/Divisi</label>
                <input style={styles.input} type="text" placeholder="Cth: IT, Marketing, Sales" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Jabatan</label>
                <input style={styles.input} type="text" placeholder="Cth: Software Engineer" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Gaji Pokok (Rp)</label>
                <input style={styles.input} type="text" placeholder="Cth: 8000000" />
              </div>
            </div>
            <button style={styles.btnPrimary} type="button">Simpan Pegawai</button>
          </form>
        </div>

        <div style={{...styles.card, marginBottom: '32px', padding: '0', overflow: 'hidden'}}>
          <div style={{ padding: '24px', borderBottom: '1px solid #dbeafe' }}>
            <h3 style={{...styles.sectionTitle, marginBottom: 0, borderBottom: 'none', paddingBottom: 0}}>Daftar Pegawai & Absensi Hari Ini</h3>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nama Pegawai</th>
                  <th style={styles.th}>Jabatan</th>
                  <th style={styles.th}>Departemen</th>
                  <th style={styles.th}>Status Absen</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><strong style={{color: '#1e293b', fontSize: '15px'}}>Dewi Sartika</strong></td>
                  <td style={styles.td}>UI/UX Designer</td>
                  <td style={styles.td}>IT Engineering</td>
                  <td style={styles.td}>
                    <span style={styles.badgeGreen}>Sudah Hadir</span>
                  </td>
                  <td style={styles.td}></td>
                </tr>
                <tr>
                  <td style={styles.td}><strong style={{color: '#1e293b', fontSize: '15px'}}>Heri Saputra</strong></td>
                  <td style={styles.td}>Chief Executive Officer</td>
                  <td style={styles.td}>Executive Board</td>
                  <td style={styles.td}><span style={styles.badgeBlue}>Belum Absen</span></td>
                  <td style={styles.td}><button style={styles.btnActionGreen}>KONFIRMASI HADIR</button></td>
                </tr>
                <tr>
                  <td style={styles.td}><strong style={{color: '#1e293b', fontSize: '15px'}}>Lestari Putri</strong></td>
                  <td style={styles.td}>Sales Executive</td>
                  <td style={styles.td}>Sales & Marketing</td>
                  <td style={styles.td}><span style={styles.badgeBlue}>Belum Absen</span></td>
                  <td style={styles.td}><button style={styles.btnActionGreen}>KONFIRMASI HADIR</button></td>
                </tr>
                <tr>
                  <td style={styles.td}><strong style={{color: '#1e293b', fontSize: '15px'}}>Budi Santoso</strong></td>
                  <td style={styles.td}>Senior Developer</td>
                  <td style={styles.td}>IT Engineering</td>
                  <td style={styles.td}><span style={styles.badgeBlue}>Belum Absen</span></td>
                  <td style={styles.td}><button style={styles.btnActionGreen}>KONFIRMASI HADIR</button></td>
                </tr>
                <tr>
                  <td style={styles.td}><strong style={{color: '#1e293b', fontSize: '15px'}}>Siti Aminah</strong></td>
                  <td style={styles.td}>HR Manager</td>
                  <td style={styles.td}>Human Resources</td>
                  <td style={styles.td}><span style={styles.badgeBlue}>Belum Absen</span></td>
                  <td style={styles.td}><button style={styles.btnActionGreen}>KONFIRMASI HADIR</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Unggah Dokumen Rahasia (KTP/CV)</h3>
          <div style={styles.fileInputWrapper}>
            <input 
              style={styles.fileInput} 
              type="file" 
              id="hr-file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
            />
          </div>
          <button 
            style={{...styles.btnUpload, ...(isUploading ? styles.btnUploadDisabled : {})}} 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Dokumen'}
          </button>
          
          {status !== 'idle' && message && (
            <div style={status === 'success' ? styles.messageSuccess : styles.messageError}>
              {message}
            </div>
          )}

          {status === 'success' && previewUrl && (
            <div style={{marginTop: '16px'}}>
              {isImage ? (
                <img src={previewUrl} alt="Preview HR" style={styles.previewImage} />
              ) : (
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={styles.previewLink}>
                  📄 Buka / Unduh Dokumen
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
