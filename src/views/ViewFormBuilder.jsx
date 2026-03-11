import { useCallback } from 'react';

export default function ViewFormBuilder({ builderFields, setBuilderFields, builderTitle, setBuilderTitle, builderDesc, setBuilderDesc, builderTheme, setBuilderTheme, builderFont, setBuilderFont, builderCover, setBuilderCover, builderSheetName, setBuilderSheetName, builderSuccessMsg, setBuilderSuccessMsg, builderIsPublic, setBuilderIsPublic, builderSave, navigate }) {

  const addField = () => {
    setBuilderFields(prev => [...prev, { id: 'f_' + Date.now(), label: '', type: 'text', required: false }]);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const removeField = (idx) => setBuilderFields(prev => prev.filter((_, i) => i !== idx));

  const updateField = (idx, key, value) => {
    setBuilderFields(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      if (key === 'type' && value === 'divider') next[idx].label = '';
      return next;
    });
  };

  const moveUp = (idx) => { if (idx === 0) return; setBuilderFields(prev => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; }); };
  const moveDown = (idx) => { if (idx === builderFields.length - 1) return; setBuilderFields(prev => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; }); };

  const typeOptions = (type) => `
    <optgroup label="Input Data (Jawaban)">
      <option value="text" ${type === 'text' ? 'selected' : ''}>Jawaban Pendek</option>
      <option value="textarea" ${type === 'textarea' ? 'selected' : ''}>Paragraf Panjang</option>
      <option value="number" ${type === 'number' ? 'selected' : ''}>Angka / ID</option>
      <option value="email" ${type === 'email' ? 'selected' : ''}>Alamat Email</option>
      <option value="date" ${type === 'date' ? 'selected' : ''}>Tanggal</option>
      <option value="time" ${type === 'time' ? 'selected' : ''}>Waktu / Jam</option>
      <option value="dropdown" ${type === 'dropdown' ? 'selected' : ''}>Pilihan Tunggal (Dropdown)</option>
      <option value="checkbox" ${type === 'checkbox' ? 'selected' : ''}>Pilihan Ganda (Checkboxes)</option>
      <option value="file" ${type === 'file' ? 'selected' : ''}>Upload Dokumen/Foto</option>
    </optgroup>
    <optgroup label="Elemen Tampilan (Visual)">
      <option value="header" ${type === 'header' ? 'selected' : ''}>Teks: Judul Sesi Baru</option>
      <option value="info" ${type === 'info' ? 'selected' : ''}>Teks: Kotak Informasi</option>
      <option value="divider" ${type === 'divider' ? 'selected' : ''}>Garis Pemisah</option>
      <option value="image_display" ${type === 'image_display' ? 'selected' : ''}>Gambar: Tampilkan Foto</option>
    </optgroup>
  `;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <button onClick={() => navigate('admin-dashboard')} className="h-12 w-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 mr-4 tap-effect shadow-sm">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Smart Form Builder</h2>
              <p className="text-slate-500 text-sm">Rancang formulir dan sesuaikan tampilan.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => builderSave('DRAFT')} className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-slate-50 tap-effect smooth-transition hidden sm:block">Simpan Draft</button>
            <button onClick={() => { if (window.confirm('Apakah Anda yakin ingin mempublikasikan formulir ini?')) builderSave('ACTIVE'); }} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 tap-effect smooth-transition flex items-center justify-center">
              <i className="fas fa-paper-plane mr-2"></i> Publikasikan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Form Info & Styling */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3"><i className="fas fa-heading text-blue-500 mr-2"></i>Info Utama</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Judul Formulir</label>
                  <input type="text" value={builderTitle} onChange={e => setBuilderTitle(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:bg-white text-sm font-bold text-slate-900 placeholder-slate-400" placeholder="Contoh: Form Pendaftaran" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deskripsi (Opsional)</label>
                  <textarea value={builderDesc} onChange={e => setBuilderDesc(e.target.value)} rows={4} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:bg-white text-sm text-slate-700" placeholder="Tuliskan instruksi pengisian di sini..."></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3"><i className="fas fa-paint-roller text-blue-500 mr-2"></i>Tema & Tampilan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Warna Utama</label>
                  <select value={builderTheme} onChange={e => setBuilderTheme(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:bg-white text-sm font-bold text-slate-900 app-select">
                    <option value="blue">Biru (Default)</option>
                    <option value="emerald">Zamrud (Hijau)</option>
                    <option value="rose">Mawar (Merah)</option>
                    <option value="purple">Ungu</option>
                    <option value="slate">Abu-abu Gelap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jenis Huruf (Font)</label>
                  <select value={builderFont} onChange={e => setBuilderFont(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:bg-white text-sm font-bold text-slate-900 app-select">
                    <option value="font-jakarta">Plus Jakarta Sans</option>
                    <option value="font-inter">Inter</option>
                    <option value="font-roboto">Roboto</option>
                    <option value="font-playfair">Playfair Display (Elegan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Gambar Sampul (URL Opsional)</label>
                  <input type="text" value={builderCover} onChange={e => setBuilderCover(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:bg-white text-sm text-slate-700 placeholder-slate-400" placeholder="https://contoh.com/gambar.jpg" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm lg:sticky lg:top-24">
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3"><i className="fas fa-cogs text-blue-500 mr-2"></i>Pengaturan Lanjutan</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nama Tab Sheet (Database)</label>
                  <input type="text" value={builderSheetName} onChange={e => setBuilderSheetName(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:border-blue-400 text-sm font-bold text-slate-900 placeholder-slate-400 smooth-transition" placeholder="Otomatis (Default)" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pesan Setelah Submit</label>
                  <input type="text" value={builderSuccessMsg} onChange={e => setBuilderSuccessMsg(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:border-blue-400 text-sm text-slate-700 placeholder-slate-400 smooth-transition" placeholder="Terima kasih, data Anda tersimpan." />
                </div>
                <div>
                  <label className="flex items-center text-sm cursor-pointer font-bold text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 tap-effect smooth-transition">
                    <input type="checkbox" checked={builderIsPublic} onChange={e => setBuilderIsPublic(e.target.checked)} className="mr-3 h-5 w-5 text-blue-600 rounded" />
                    Tampilkan di Papan Publik
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Questions Builder */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200 min-h-[600px]">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">Struktur Halaman</h3>
                  <p className="text-xs text-slate-500 hidden sm:block mt-1">Gunakan panah untuk mengurutkan blok.</p>
                </div>
                <button onClick={addField} className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold tap-effect smooth-transition flex items-center">
                  <i className="fas fa-plus mr-2"></i> Tambah Blok
                </button>
              </div>

              <div className="space-y-6">
                {builderFields.length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-[2rem] bg-slate-50">
                    <p className="text-slate-400 text-sm font-bold">Tekan "Tambah Blok" untuk mulai merancang</p>
                  </div>
                ) : builderFields.map((f, idx) => {
                  const isUI = ['header', 'info', 'divider', 'image_display'].includes(f.type);
                  const hasOptions = ['dropdown', 'checkbox'].includes(f.type);
                  const isImage = f.type === 'image_display';
                  const hasLogic = f.logicType && f.logicType !== 'none';

                  let labelHeader = 'Teks Pertanyaan', labelPlaceholder = 'Ketik di sini...';
                  if (f.type === 'divider') { labelHeader = 'Elemen Pemisah (Otomatis)'; labelPlaceholder = 'Garis akan dimunculkan di form'; }
                  else if (f.type === 'info') labelHeader = 'Isi Teks Informasi';
                  else if (f.type === 'header') labelHeader = 'Teks Judul Bagian';
                  else if (f.type === 'image_display') labelHeader = 'Keterangan Gambar (Opsional)';

                  return (
                    <div key={f.id} className={`bg-white border ${isUI ? 'border-blue-200 shadow-blue-100/50' : 'border-slate-200'} p-5 sm:p-6 rounded-[2rem] shadow-sm relative hover:shadow-md smooth-transition`}>
                      <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
                        <div className="flex items-center text-slate-400">
                          <i className="fas fa-grip-vertical text-xl mr-3"></i>
                          <span className={`${isUI ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'} font-mono text-xs px-3 py-1.5 rounded-xl font-bold flex items-center select-none`}>
                            {isUI ? <><i className="fas fa-palette mr-1.5"></i>UI Layout</> : `#${idx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveUp(idx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><i className="fas fa-arrow-up"></i></button>
                          <button onClick={() => moveDown(idx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><i className="fas fa-arrow-down"></i></button>
                          <button onClick={() => removeField(idx)} className="text-rose-400 bg-rose-50 p-2.5 rounded-xl hover:bg-rose-100 tap-effect smooth-transition ml-2" title="Hapus"><i className="fas fa-trash-alt"></i></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                        <div className="sm:col-span-7">
                          <label className={`block text-xs font-bold ${isUI ? 'text-blue-500' : 'text-slate-500'} uppercase tracking-widest mb-2`}>{labelHeader}</label>
                          <input type="text" value={f.label} onChange={e => updateField(idx, 'label', e.target.value)} disabled={f.type === 'divider'} className={`w-full border-2 border-slate-100 rounded-2xl p-4 ${isUI ? 'bg-blue-50 focus:border-blue-400' : 'bg-slate-50 focus:border-slate-400'} focus:bg-white text-sm font-bold text-slate-900 smooth-transition`} placeholder={labelPlaceholder} />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jenis Komponen</label>
                          <select value={f.type} onChange={e => updateField(idx, 'type', e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:border-blue-400 text-sm font-bold text-slate-900 app-select smooth-transition">
                            <optgroup label="Input Data (Jawaban)">
                              <option value="text">Jawaban Pendek</option>
                              <option value="textarea">Paragraf Panjang</option>
                              <option value="number">Angka / ID</option>
                              <option value="email">Alamat Email</option>
                              <option value="date">Tanggal</option>
                              <option value="time">Waktu / Jam</option>
                              <option value="dropdown">Pilihan Tunggal (Dropdown)</option>
                              <option value="checkbox">Pilihan Ganda (Checkboxes)</option>
                              <option value="file">Upload Dokumen/Foto</option>
                            </optgroup>
                            <optgroup label="Elemen Tampilan (Visual)">
                              <option value="header">Teks: Judul Sesi Baru</option>
                              <option value="info">Teks: Kotak Informasi</option>
                              <option value="divider">Garis Pemisah</option>
                              <option value="image_display">Gambar: Tampilkan Foto</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {!isUI ? (
                          <label className="flex items-center text-sm cursor-pointer font-bold text-slate-700 bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl tap-effect">
                            <input type="checkbox" checked={f.required || false} onChange={e => updateField(idx, 'required', e.target.checked)} className="mr-3 h-5 w-5 text-blue-600 rounded" /> Wajib Diisi
                          </label>
                        ) : (
                          <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 uppercase tracking-widest">Elemen Visual</div>
                        )}
                      </div>

                      {hasOptions && (
                        <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl relative">
                          <div className="absolute left-0 top-0 w-2 h-full bg-indigo-400 rounded-l-2xl"></div>
                          <label className="block text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3 ml-2">Opsi Pilihan (Pisahkan dengan Koma)</label>
                          <input type="text" value={f.options || ''} onChange={e => updateField(idx, 'options', e.target.value)} placeholder="Pilihan 1, Pilihan 2, Pilihan 3..." className="w-full ml-2 border-2 border-transparent rounded-xl p-3 bg-white focus:border-indigo-300 text-sm font-bold shadow-sm outline-none" style={{ width: 'calc(100% - 0.5rem)' }} />
                        </div>
                      )}

                      {isImage && (
                        <div className="mt-6 p-5 bg-teal-50 border border-teal-100 rounded-2xl relative">
                          <div className="absolute left-0 top-0 w-2 h-full bg-teal-400 rounded-l-2xl"></div>
                          <label className="block text-xs font-bold text-teal-700 uppercase tracking-widest mb-3 ml-2">URL Gambar (Link Publik)</label>
                          <input type="text" value={f.options || ''} onChange={e => updateField(idx, 'options', e.target.value)} placeholder="https://contoh.com/gambar.png" className="w-full ml-2 border-2 border-transparent rounded-xl p-3 bg-white focus:border-teal-300 text-sm font-bold shadow-sm outline-none" style={{ width: 'calc(100% - 0.5rem)' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
