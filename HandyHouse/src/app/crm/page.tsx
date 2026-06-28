'use client';

import React, { useState } from 'react';

export default function CRMDashboard() {
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
    formData.append('name', 'Customer Document');

    try {
      const response = await fetch('/api/crm/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Dokumen berhasil diunggah ke MinIO!');
        setPreviewUrl(data.url);
        setFile(null);
        const fileInput = document.getElementById('crm-file') as HTMLInputElement;
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
    page: { backgroundColor: '#fff7ed', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' },
    container: { maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', flexDirection: 'column' as const, marginBottom: '32px' },
    headerTitle: { fontSize: '32px', fontWeight: '800', color: '#1f2937', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
    headerSub: { fontSize: '16px', color: '#6b7280', margin: 0, fontWeight: '500' },
    
    row: { display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' as const },
    card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #ffedd5', flex: '1', minWidth: '280px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' },
    
    statTitle: { fontSize: '14px', color: '#6b7280', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
    statValueOrange: { fontSize: '40px', color: '#ea580c', fontWeight: '900', margin: 0, lineHeight: 1 },
    statValueGreen: { fontSize: '32px', color: '#16a34a', fontWeight: '800', margin: 0, lineHeight: 1.2 },
    statSub: { fontSize: '13px', color: '#9ca3af', marginTop: '8px', display: 'block', fontWeight: '500' },
    statStatus: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#374151', fontWeight: '700', height: '100%' },
    dotGreen: { width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.6)' },
    
    sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#1f2937', marginBottom: '24px', borderBottom: '2px solid #ffedd5', paddingBottom: '12px' },
    
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    formGroup: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
    label: { fontSize: '14px', fontWeight: '700', color: '#374151' },
    input: { 
      padding: '14px 16px', 
      border: '2px solid #fdba74', 
      borderRadius: '8px', 
      fontSize: '15px', 
      outline: 'none', 
      width: '100%', 
      boxSizing: 'border-box' as const,
      backgroundColor: '#fffaf0',
      color: '#1f2937',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
    },
    btnPrimary: { backgroundColor: '#ea580c', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-block', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(234,88,12,0.3)' },
    btnUpload: { backgroundColor: '#fed7aa', color: '#9a3412', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-block', marginTop: '12px', fontSize: '14px' },
    btnUploadDisabled: { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed', boxShadow: 'none' },
    
    tableWrapper: { overflowX: 'auto' as const, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ffedd5' },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const, fontSize: '14px' },
    th: { padding: '16px', borderBottom: '2px solid #ffedd5', backgroundColor: '#fff7ed', color: '#9a3412', fontWeight: '700' },
    td: { padding: '16px', borderBottom: '1px solid #ffedd5', color: '#4b5563' },
    tdSub: { fontSize: '13px', color: '#9ca3af', display: 'block', marginTop: '4px' },
    badgeGreen: { backgroundColor: '#dcfce7', border: '1px solid #22c55e', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', display: 'inline-block' },
    badgeGray: { backgroundColor: '#f3f4f6', color: '#6b7280', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-block' },
    btnOutline: { border: '2px solid #fdba74', color: '#ea580c', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', backgroundColor: '#fffaf0', cursor: 'pointer', transition: 'all 0.2s' },
    
    fileInputWrapper: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', padding: '20px', border: '2px dashed #fdba74', borderRadius: '8px', backgroundColor: '#fffaf0' },
    fileInput: { fontSize: '15px', color: '#ea580c', fontWeight: '600', width: '100%' },
    
    messageSuccess: { padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', marginTop: '16px', fontSize: '15px', fontWeight: '600', border: '1px solid #bbf7d0' },
    messageError: { padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginTop: '16px', fontSize: '15px', fontWeight: '600', border: '1px solid #fecaca' },
    previewImage: { maxWidth: '250px', borderRadius: '8px', marginTop: '16px', border: '2px solid #ffedd5', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    previewLink: { color: '#ea580c', textDecoration: 'none', marginTop: '16px', display: 'inline-block', fontSize: '15px', fontWeight: '700', padding: '12px 20px', backgroundColor: '#fffaf0', border: '2px solid #fdba74', borderRadius: '8px' },
    
    headerRight: { float: 'right' as const, fontSize: '13px', color: '#ea580c', backgroundColor: '#fff7ed', border: '1px solid #fdba74', padding: '6px 12px', borderRadius: '20px', fontWeight: '700' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>CRM Dashboard</h1>
          <p style={styles.headerSub}>Manajemen Pelanggan dan Penjualan HandyHouse</p>
        </div>

        <div style={styles.row}>
          <div style={styles.card}>
            <div style={styles.statTitle}>Total Pelanggan</div>
            <h2 style={styles.statValueOrange}>5</h2>
          </div>
          <div style={styles.card}>
            <div style={styles.statTitle}>Potensi Penjualan</div>
            <h2 style={styles.statValueGreen}>Rp 10.000.000</h2>
            <span style={styles.statSub}>Dari tabel crm_opportunities</span>
          </div>
          <div style={styles.card}>
            <div style={styles.statTitle}>Status Database</div>
            <div style={styles.statStatus}>
              <span style={styles.dotGreen}></span> Neon Cloud Active
            </div>
          </div>
        </div>

        <div style={{...styles.card, marginBottom: '32px'}}>
          <h3 style={styles.sectionTitle}>Tambah Pelanggan Baru</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Lengkap *</label>
                <input style={styles.input} type="text" placeholder="Cth: Budi Santoso" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Alamat Email *</label>
                <input style={styles.input} type="email" placeholder="Cth: budi@contoh.com" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nomor Telepon</label>
                <input style={styles.input} type="text" placeholder="Cth: 081234567890" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Alamat Pelanggan</label>
                <input style={styles.input} type="text" placeholder="Cth: Jl. Melati No. 12, Jakarta" />
              </div>
            </div>
            <button style={styles.btnPrimary} type="button">Simpan Pelanggan</button>
          </form>
        </div>

        <div style={{...styles.card, marginBottom: '32px', padding: '0', overflow: 'hidden'}}>
          <div style={{ padding: '24px', borderBottom: '1px solid #ffedd5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{...styles.sectionTitle, marginBottom: 0, borderBottom: 'none', paddingBottom: 0}}>Daftar Pelanggan & Prospek</h3>
            <span style={styles.headerRight}>10 Terbaru</span>
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nama Pelanggan</th>
                  <th style={styles.th}>Alamat</th>
                  <th style={styles.th}>Status Prospek</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>
                    <strong style={{color: '#1f2937', fontSize: '15px'}}>PT Mega Karya Sejahtera</strong>
                    <span style={styles.tdSub}>contact@megakarya.co.id</span>
                  </td>
                  <td style={styles.td}>Jl. Jend. Sudirman Kav. 21, Jakarta Selatan</td>
                  <td style={styles.td}><span style={styles.badgeGreen}>QUALIFIED</span></td>
                  <td style={styles.td}><button style={styles.btnOutline}>+ JADIKAN PROSPEK</button></td>
                </tr>
                <tr>
                  <td style={styles.td}>
                    <strong style={{color: '#1f2937', fontSize: '15px'}}>Bintang Harapan, CV</strong>
                    <span style={styles.tdSub}>purchasing@bintangharapan.com</span>
                  </td>
                  <td style={styles.td}>Kawasan Industri Pulo Gadung Blok 4, Jakarta Timur</td>
                  <td style={styles.td}><span style={styles.badgeGray}>Bukan Prospek</span></td>
                  <td style={styles.td}><button style={styles.btnOutline}>+ JADIKAN PROSPEK</button></td>
                </tr>
                <tr>
                  <td style={styles.td}>
                    <strong style={{color: '#1f2937', fontSize: '15px'}}>Diana Larasati</strong>
                    <span style={styles.tdSub}>diana.larasati99@gmail.com</span>
                  </td>
                  <td style={styles.td}>Jl. Setiabudi No. 45, Bandung, Jawa Barat</td>
                  <td style={styles.td}><span style={styles.badgeGray}>Bukan Prospek</span></td>
                  <td style={styles.td}><button style={styles.btnOutline}>+ JADIKAN PROSPEK</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Unggah Dokumen ke MinIO</h3>
          <div style={styles.fileInputWrapper}>
            <input 
              style={styles.fileInput} 
              type="file" 
              id="crm-file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
            />
          </div>
          <button 
            style={{...styles.btnUpload, ...(isUploading ? styles.btnUploadDisabled : {})}} 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
          
          {status !== 'idle' && message && (
            <div style={status === 'success' ? styles.messageSuccess : styles.messageError}>
              {message}
            </div>
          )}

          {status === 'success' && previewUrl && (
            <div style={{marginTop: '16px'}}>
              {isImage ? (
                <img src={previewUrl} alt="Preview CRM" style={styles.previewImage} />
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
