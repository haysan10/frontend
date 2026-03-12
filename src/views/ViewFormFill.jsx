import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import * as api from '../services/api';

const themeColors = {
  'blue': { bg: 'bg-blue-600', grad: 'from-blue-500 to-indigo-500' },
  'emerald': { bg: 'bg-emerald-600', grad: 'from-emerald-400 to-teal-500' },
  'rose': { bg: 'bg-rose-600', grad: 'from-rose-500 to-pink-500' },
  'purple': { bg: 'bg-purple-600', grad: 'from-purple-500 to-fuchsia-500' },
  'slate': { bg: 'bg-slate-800', grad: 'from-slate-600 to-slate-800' },
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function compressImage(file, quality, maxW, maxH) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; } }
        else { if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export default function ViewFormFill({ formTitle, formDesc, formTheme, formFont, formCover, currentSchema, currentFormId, navigate, showLoader, hideLoader, showToast }) {
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const logicTimeout = useRef(null);

  const tColor = themeColors[formTheme] || themeColors.blue;

  const evaluateLogic = useCallback(() => {
    if (logicTimeout.current) clearTimeout(logicTimeout.current);
    logicTimeout.current = setTimeout(() => {
      const newHidden = {};
      currentSchema.forEach(field => {
        if (!field.logicType || field.logicType === 'none') return;
        const triggerEl = values[field.logicTrigger];
        let triggerValues = [];
        // Check if trigger is a checkbox (array)
        const triggerField = currentSchema.find(f => f.id === field.logicTrigger);
        if (triggerField && triggerField.type === 'checkbox') {
          triggerValues = (triggerEl || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
        } else {
          triggerValues = [String(triggerEl || '').trim().toLowerCase()];
        }
        const cond = String(field.logicCondition || '').trim().toLowerCase();
        let isMatch = false;
        if (triggerValues.some(v => v !== '')) {
          if (['showIf', 'hideIf', 'autofill', 'requireIf'].includes(field.logicType)) isMatch = triggerValues.includes(cond);
          else if (field.logicType === 'showIfNot') isMatch = !triggerValues.includes(cond);
          else if (field.logicType === 'showIfContains') isMatch = triggerValues.some(v => v.includes(cond));
          else if (field.logicType === 'showIfGreater') isMatch = parseFloat(triggerValues[0]) > parseFloat(cond);
          else if (field.logicType === 'showIfLess') isMatch = parseFloat(triggerValues[0]) < parseFloat(cond);
          else if (field.logicType === 'lookupDB') isMatch = true;
        }
        if (['showIf', 'showIfNot', 'showIfContains', 'showIfGreater', 'showIfLess'].includes(field.logicType)) {
          if (!isMatch) newHidden[field.id] = true;
        } else if (field.logicType === 'hideIf') {
          if (isMatch) newHidden[field.id] = true;
        }
      });
      // Store hidden fields for submission logic
      window.__formHiddenFields = newHidden;
    }, 400);
  }, [currentSchema, values]);

  useEffect(() => { evaluateLogic(); }, [values, evaluateLogic]);

  const handleChange = (fieldId, value) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
  };

  const handleCheckbox = (fieldId, optValue, checked) => {
    setValues(prev => {
      const current = (prev[fieldId] || '').split(',').map(v => v.trim()).filter(Boolean);
      let next;
      if (checked) next = [...current, optValue];
      else next = current.filter(v => v !== optValue);
      return { ...prev, [fieldId]: next.join(', ') };
    });
    setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
  };

  const handleFileSelect = (fieldId, file) => {
    if (file) {
      setFiles(prev => ({ ...prev, [fieldId]: file }));
      setErrors(prev => { const n = { ...prev }; delete n[fieldId]; return n; });
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => setFilePreviews(prev => ({ ...prev, [fieldId]: e.target.result }));
        reader.readAsDataURL(file);
      } else {
        setFilePreviews(prev => ({ ...prev, [fieldId]: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted) return;

    const hiddenFields = window.__formHiddenFields || {};
    let payload = {};
    let hasError = false;
    let newErrors = {};
    let successMsg = 'Berhasil! Jawaban Anda telah disubmit.';

    for (const field of currentSchema) {
      if (field.id === 'sys_style') {
        if (field.config && field.config.successMsg) successMsg = field.config.successMsg;
        continue;
      }
      if (['header', 'info', 'divider', 'image_display'].includes(field.type)) continue;
      if (hiddenFields[field.id]) { payload[field.id] = ''; continue; }

      if (field.type === 'checkbox') {
        const val = values[field.id] || '';
        if (field.required && !val.trim()) {
          newErrors[field.id] = 'Mohon pilih setidaknya satu opsi.';
          hasError = true; continue;
        }
        payload[field.id] = val;
      } else if (field.type === 'file') {
        const file = files[field.id];
        if (field.required && !file) {
          newErrors[field.id] = 'Dokumen ini wajib diunggah.';
          hasError = true; continue;
        }
        if (file) {
          if (file.size > 5 * 1024 * 1024 && !file.type.startsWith('image/')) {
            newErrors[field.id] = 'Ukuran file terlalu besar. Maksimal 5MB.';
            hasError = true; continue;
          }
          payload[field.id] = { pendingFile: file };
        } else {
          payload[field.id] = '';
        }
      } else {
        const val = values[field.id] || '';
        if (field.required && !val.trim()) {
          newErrors[field.id] = 'Pertanyaan wajib ini belum diisi.';
          hasError = true; continue;
        }
        payload[field.id] = val;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      showToast('Terdapat kolom wajib yang belum Anda lengkapi.', 'error');
      const firstErrId = Object.keys(newErrors)[0];
      document.getElementById('wrapper_' + firstErrId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    showLoader('Memproses Pengiriman...');
    for (const key in payload) {
      if (payload[key] && payload[key].pendingFile) {
        const file = payload[key].pendingFile;
        showLoader('Mempersiapkan File...');
        let base64;
        if (file.type.startsWith('image/')) base64 = await compressImage(file, 0.7, 1200, 1200);
        else base64 = await fileToBase64(file);
        payload[key] = { filename: file.name, data: base64 };
      }
    }

    showLoader('Mengunggah Data ke Sistem...');
    try {
      const res = await api.submitResponse(currentFormId, payload);
      hideLoader();
      if (res.success !== false) {
        const history = JSON.parse(localStorage.getItem('form_history') || '[]');
        history.unshift({ id: res.response_id || 'RES_' + Date.now(), formId: currentFormId, title: formTitle, date: new Date().toISOString() });
        localStorage.setItem('form_history', JSON.stringify(history));
        showToast(successMsg, 'success');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setSubmitted(true);
        setTimeout(() => navigate('user-history'), 2000);
      } else {
        showToast('Gagal: ' + (res.message || 'Terjadi kesalahan'), 'error');
      }
    } catch (err) {
      hideLoader();
      showToast('Gagal mengirim: ' + err.message, 'error');
    }
  };

  const isHidden = (fieldId) => (window.__formHiddenFields || {})[fieldId];

  return (
    <div>
      <div className="sm:hidden bg-white/90 backdrop-blur-md pt-safe px-4 py-3 sticky top-0 z-40 flex items-center border-b border-slate-100 shadow-sm">
        <button onClick={() => navigate('portal')} className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 tap-effect">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="font-extrabold text-slate-800 ml-3 truncate text-lg">Isi Formulir</h2>
      </div>

      <div className={`max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 transition-all duration-300 ${formFont}`}>
        <button onClick={() => navigate('portal')} className="hidden sm:inline-flex items-center text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 bg-white py-2 px-4 rounded-xl shadow-sm border border-slate-200 tap-effect smooth-transition">
          <i className="fas fa-arrow-left mr-2"></i> Kembali ke Beranda
        </button>

        <div className="bg-white sm:rounded-[2.5rem] rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
          <div className={`hidden sm:block absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${tColor.grad}`}></div>

          {formCover && (
            <div className="w-full h-32 sm:h-48 bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url('${formCover}')` }}></div>
          )}

          <div className="p-6 sm:p-10 pt-8">
            <div className="mb-8 border-b border-slate-100 pb-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{formTitle}</h2>
              <p className="text-slate-600 mt-4 text-sm sm:text-base leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{formDesc}</p>
            </div>

            <form id="form-fill-container" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                {currentSchema.map(field => {
                  if (field.id === 'sys_style') return null;
                  const hidden = isHidden(field.id);
                  const hasErr = errors[field.id];
                  const reqStar = field.required ? <span className="text-rose-500 font-extrabold ml-1">*</span> : null;
                  const baseClass = "mt-3 block w-full border-2 border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-900 bg-slate-50 text-base sm:text-lg smooth-transition font-medium placeholder-slate-400";

                  if (['header', 'info', 'divider', 'image_display'].includes(field.type)) {
                    let content = null;
                    if (field.type === 'header') content = <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-6 mb-2 flex items-center"><div className={`w-1.5 h-6 ${tColor.bg} mr-3 rounded-full`}></div>{field.label}</h3>;
                    else if (field.type === 'info') content = <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl text-sm sm:text-base text-slate-700 leading-relaxed font-medium flex items-start"><i className="fas fa-info-circle text-slate-400 mt-1 mr-3 text-lg"></i><div>{field.label}</div></div>;
                    else if (field.type === 'divider') content = <hr className="border-t-2 border-dashed border-slate-200 my-6 sm:my-8" />;
                    else if (field.type === 'image_display' && field.options) content = <img src={field.options} className="w-full rounded-2xl object-cover shadow-sm mt-4 mb-2 max-h-96" alt={field.label} onError={e => e.target.style.display = 'none'} />;
                    return <div key={field.id} id={`wrapper_${field.id}`} className={`${hidden ? 'logic-hide' : 'logic-show'} smooth-transition logic-item`}>{content}</div>;
                  }

                  let input = null;
                  if (['text', 'number', 'email', 'date', 'time'].includes(field.type)) {
                    input = <input id={`field_${field.id}`} name={`field_${field.id}`} type={field.type} value={values[field.id] || ''} onChange={e => handleChange(field.id, e.target.value)} required={field.required} className={`${baseClass} ${hasErr ? 'input-error' : ''}`} placeholder="Ketik jawaban..." />;
                  } else if (field.type === 'textarea') {
                    input = <textarea id={`field_${field.id}`} name={`field_${field.id}`} value={values[field.id] || ''} onChange={e => handleChange(field.id, e.target.value)} rows={4} required={field.required} className={`${baseClass} ${hasErr ? 'input-error' : ''}`} placeholder="Ketik detail..."></textarea>;
                  } else if (field.type === 'dropdown') {
                    const opts = (field.options || '').split(',').map(o => o.trim()).filter(Boolean);
                    input = (
                      <select id={`field_${field.id}`} name={`field_${field.id}`} value={values[field.id] || ''} onChange={e => handleChange(field.id, e.target.value)} required={field.required} className={`${baseClass} app-select ${hasErr ? 'input-error' : ''}`}>
                        <option value="" disabled>-- Pilih Salah Satu --</option>
                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    );
                  } else if (field.type === 'checkbox') {
                    const opts = (field.options || '').split(',').map(o => o.trim()).filter(Boolean);
                    const checked = (values[field.id] || '').split(',').map(v => v.trim()).filter(Boolean);
                    input = (
                      <div className={`mt-4 flex flex-col gap-1 ${hasErr ? 'input-error' : ''}`} role="group" aria-labelledby={`label_${field.id}`}>
                        {opts.map((o, idx) => (
                          <label htmlFor={`field_${field.id}_opt_${idx}`} key={o} className="flex items-center space-x-3 mb-2 p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-white focus-within:ring-2 focus-within:ring-blue-100 smooth-transition tap-effect shadow-sm">
                            <input id={`field_${field.id}_opt_${idx}`} name={`field_${field.id}`} type="checkbox" checked={checked.includes(o)} onChange={e => handleCheckbox(field.id, o, e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                            <span className="text-sm sm:text-base font-semibold text-slate-700">{o}</span>
                          </label>
                        ))}
                      </div>
                    );
                  } else if (field.type === 'file') {
                    const file = files[field.id];
                    const preview = filePreviews[field.id];
                    input = (
                      <label htmlFor={`field_${field.id}`} className={`mt-3 relative w-full min-h-[6rem] border-2 border-slate-300 border-dashed rounded-2xl flex flex-col items-center justify-center bg-slate-50 text-slate-500 font-bold text-base overflow-hidden tap-effect hover:bg-slate-100 smooth-transition p-4 ${hasErr ? 'input-error' : ''}`}>
                        <div className="flex flex-col items-center justify-center pointer-events-none z-10 w-full transition-all">
                          <i className={`fas ${file ? 'fa-check-circle text-emerald-500' : 'fa-upload text-slate-400'} text-3xl mb-2`}></i>
                          <span className="text-center text-sm truncate w-full px-2">{file ? <span className="text-blue-600 font-extrabold">{file.name}</span> : 'Ketuk untuk Upload File (Maks 5MB)'}</span>
                        </div>
                        {preview && <img src={preview} className="mt-3 max-h-40 rounded-xl object-contain z-10 shadow-sm border border-slate-200" />}
                        <input id={`field_${field.id}`} name={`field_${field.id}`} type="file" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20" onChange={e => handleFileSelect(field.id, e.target.files[0])} />
                      </label>
                    );
                  }

                  return (
                    <div key={field.id} id={`wrapper_${field.id}`} className={`${hidden ? 'logic-hide' : 'logic-show'} smooth-transition bg-white p-2 rounded-2xl relative logic-item ${hasErr ? 'has-error animate-shake' : ''}`}>
                      <label id={`label_${field.id}`} htmlFor={`field_${field.id}`} className="block text-sm sm:text-base font-extrabold text-slate-700 ml-1 mb-1">{field.label} {reqStar}</label>
                      {input}
                      {hasErr && (
                        <div className="error-text" style={{ display: 'flex' }}>
                          <i className="fas fa-exclamation-triangle mr-1.5"></i> {errors[field.id]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="hidden sm:flex mt-10 pt-6 border-t border-slate-100 justify-end">
                <button type="submit" className={`${tColor.bg} text-white px-8 py-4 rounded-2xl font-bold shadow-lg tap-effect flex items-center text-lg smooth-transition hover:opacity-90`}>
                  Submit Jawaban <i className="fas fa-paper-plane ml-3"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
