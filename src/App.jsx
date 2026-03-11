import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from './services/api';

import ViewSetup from './views/ViewSetup';
import ViewLogin from './views/ViewLogin';
import ViewUserHistory from './views/ViewUserHistory';
import ViewPortal from './views/ViewPortal';
import ViewFormFill from './views/ViewFormFill';
import ViewPublicResponses from './views/ViewPublicResponses';
import ViewAdminDashboard from './views/ViewAdminDashboard';
import ViewFormBuilder from './views/ViewFormBuilder';
import ViewResponses from './views/ViewResponses';

const appIcons = [
  { icon: 'fa-clipboard-list', color: 'bg-blue-100 text-blue-600' },
  { icon: 'fa-smile-beam', color: 'bg-emerald-100 text-emerald-600' },
  { icon: 'fa-database', color: 'bg-purple-100 text-purple-600' },
  { icon: 'fa-envelope-open-text', color: 'bg-amber-100 text-amber-600' },
  { icon: 'fa-user-plus', color: 'bg-teal-100 text-teal-600' },
];

const themeColors = {
  'blue': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', grad: 'from-blue-500 to-indigo-500' },
  'emerald': { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', grad: 'from-emerald-400 to-teal-500' },
  'rose': { bg: 'bg-rose-600', hover: 'hover:bg-rose-700', grad: 'from-rose-500 to-pink-500' },
  'purple': { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', grad: 'from-purple-500 to-fuchsia-500' },
  'slate': { bg: 'bg-slate-800', hover: 'hover:bg-slate-900', grad: 'from-slate-600 to-slate-800' },
};

export default function App() {
  const [view, setView] = useState('loading');
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Memproses...');
  const [toasts, setToasts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'info', onConfirm: null });

  // Custom Modal
  const showModal = useCallback((title, message, type = 'info', onConfirm = null) => {
    setModal({ show: true, title, message, type, onConfirm });
  }, []);

  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, show: false }));
  }, []);

  // Toast system
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const showLoader = useCallback((text) => {
    setLoaderText(text || 'Memproses...');
    setLoading(true);
  }, []);

  const hideLoader = useCallback(() => setLoading(false), []);

  // State for various views
  const [forms, setForms] = useState([]);
  const [currentFormId, setCurrentFormId] = useState(null);
  const [currentSchema, setCurrentSchema] = useState([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTheme, setFormTheme] = useState('blue');
  const [formFont, setFormFont] = useState('font-jakarta');
  const [formCover, setFormCover] = useState('');
  const [formValues, setFormValues] = useState({});
  const [adminTab, setAdminTab] = useState('forms');

  // Responses
  const [responseData, setResponseData] = useState(null);
  const [responseTitle, setResponseTitle] = useState('');
  const [responseTab, setResponseTab] = useState('data');

  // Public Responses
  const [publicResponseTitle, setPublicResponseTitle] = useState('');
  const [publicResponseData, setPublicResponseData] = useState(null);

  // Builder
  const [builderFields, setBuilderFields] = useState([]);
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderDesc, setBuilderDesc] = useState('');
  const [builderTheme, setBuilderTheme] = useState('blue');
  const [builderFont, setBuilderFont] = useState('font-jakarta');
  const [builderCover, setBuilderCover] = useState('');
  const [builderSheetName, setBuilderSheetName] = useState('');
  const [builderSuccessMsg, setBuilderSuccessMsg] = useState('');
  const [builderIsPublic, setBuilderIsPublic] = useState(true);

  // Database
  const [dbList, setDbList] = useState([]);
  const [dbData, setDbData] = useState(null);

  // Setup
  const [setupDbId, setSetupDbId] = useState('');
  const [setupPin, setSetupPin] = useState('');

  // Admin login
  const [adminPin, setAdminPin] = useState('');

  // Charts
  const chartsRef = useRef([]);

  // Init
  useEffect(() => {
    (async () => {
      try {
        const res = await api.checkSetup();
        if (!res.isSetup) {
          setView('setup');
        } else {
          setView('portal'); 
        }
      } catch (err) {
        console.error("Initialization Failed:", err);
        // Do not force portal if it fails. Let's force setup so users see something or can re-enter API link if needed.
        setView('setup');
      }
    })();
  }, []);

  // Load forms when portal view is activated
  useEffect(() => {
    if (view === 'portal') loadPortalForms();
    if (view === 'admin-dashboard') loadAdminForms();
  }, [view]);

  const navigate = (v) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (v === 'admin-dashboard' && !isAdmin) { setView('login'); return; }
    setView(v);
  };

  // User stats from localStorage
  const getHistory = () => JSON.parse(localStorage.getItem('form_history') || '[]');
  const userTotalForms = getHistory().length;

  // ==================== PORTAL ====================
  const loadPortalForms = async () => {
    showLoader('');
    try {
      const data = await api.getAllForms(false);
      setForms(Array.isArray(data) ? data : []);
    } catch { setForms([]); }
    hideLoader();
  };

  // ==================== FORM FILL ====================
  const openForm = (idx) => {
    const formObj = forms[idx];
    if (!formObj) return;
    setCurrentFormId(formObj.form_id);
    let schema = [];
    try { schema = JSON.parse(formObj.schema_config || '[]'); } catch { schema = []; }
    setCurrentSchema(schema);
    setFormTitle(formObj.title);
    setFormDesc(formObj.description || 'Silakan isi form di bawah ini dengan data yang benar.');

    let theme = 'blue', font = 'font-jakarta', cover = '';
    const sf = schema.find(f => f.id === 'sys_style' && f.label === 'SYSTEM_STYLE');
    if (sf && sf.config) { theme = sf.config.theme || 'blue'; font = sf.config.font || 'font-jakarta'; cover = sf.config.cover || ''; }
    setFormTheme(theme);
    setFormFont(font);
    setFormCover(cover);
    setFormValues({});
    navigate('form-fill');
  };

  // ==================== ADMIN ====================
  const loadAdminForms = async () => {
    showLoader('Menyinkronkan Workspace...');
    try {
      const data = await api.getAllForms(true);
      setForms(Array.isArray(data) ? data : []);
    } catch { setForms([]); }
    hideLoader();
  };

  const handleAdminLogin = async () => {
    if (!adminPin) return;
    showLoader('');
    try {
      const valid = await api.verifyAdmin(adminPin);
      hideLoader();
      if (valid) {
        setIsAdmin(true);
        setAdminPin('');
        navigate('admin-dashboard');
        showToast('Selamat datang di Workspace Creator.', 'success');
      } else {
        showToast('PIN yang Anda masukkan salah.', 'error');
      }
    } catch { hideLoader(); showToast('Gagal memverifikasi PIN.', 'error'); }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('portal');
    showToast('Anda telah keluar dari mode admin.', 'info');
  };

  const handleDeleteForm = async (formId) => {
    showModal(
        'Hapus Formulir?', 
        'Peringatan: Apakah Anda yakin ingin menghapus form ini secara permanen? Data respons yang terkait juga mungkin akan sulit diakses.', 
        'danger', 
        async () => {
            showLoader('Menghapus formulir...');
            try {
              const res = await api.deleteForm(formId);
              if (res && res.success) { 
                  showToast('Formulir berhasil dihapus.', 'success'); 
                  loadAdminForms(); 
              }
              else { 
                  hideLoader(); 
                  showToast('Gagal menghapus formulir.', 'error'); 
              }
            } catch { 
                hideLoader(); 
                showToast('Gagal menghapus formulir.', 'error'); 
            }
        }
    );
  };

  // ==================== RESPONSES ====================
  const viewResponses = async (formId, title) => {
    setCurrentFormId(formId);
    setResponseTitle(title);
    setResponseTab('data');
    showLoader('');
    try {
      const data = await api.getFormResponses(formId);
      setResponseData(data);
      navigate('responses');
    } catch { showToast('Gagal memuat data respons.', 'error'); }
    hideLoader();
  };

  const viewPublicResponses = async (formId, title) => {
    setPublicResponseTitle(title);
    showLoader('');
    try {
      const data = await api.getFormResponses(formId);
      setPublicResponseData(data);
      navigate('public-responses');
    } catch { showToast('Gagal memuat data.', 'error'); }
    hideLoader();
  };

  // ==================== DATABASE ====================
  const loadDatabaseList = async () => {
    try { const list = await api.getDatabaseList(); setDbList(Array.isArray(list) ? list : []); } catch { setDbList([]); }
  };
  const loadDatabaseData = async (name) => {
    showLoader('');
    try { const data = await api.getDatabaseData(name); setDbData(data); } catch { showToast('Gagal memuat database.', 'error'); }
    hideLoader();
  };

  // ==================== SETUP ====================
  const handleSetup = async () => {
    if (!setupDbId || !setupPin) return showToast('Harap isi Spreadsheet ID dan PIN!', 'error');
    showLoader('Membangun Database...');
    try {
      const res = await api.performSetup(setupDbId, setupPin);
      hideLoader();
      // apiPost automatically unwraps the response, so if it finishes without throwing, it's a success
      showToast(res.message || "Sistem berhasil diinisialisasi!", 'success'); 
      navigate('portal');
    } catch (e) { 
      hideLoader(); 
      showToast(e.message || "Gagal melakukan inisialisasi", 'error'); 
    }
  };

  // ==================== BUILDER ====================
  const builderCreateNew = () => {
    setCurrentFormId('FRM_' + Date.now());
    setBuilderTitle(''); setBuilderDesc('');
    setBuilderTheme('blue'); setBuilderFont('font-jakarta'); setBuilderCover('');
    setBuilderSheetName(''); setBuilderSuccessMsg(''); setBuilderIsPublic(true);
    setBuilderFields([]);
    navigate('form-builder');
  };

  const builderEditForm = async (formId) => {
    showLoader('Membuka Editor...');
    try {
      const form = await api.getFormDetail(formId);
      hideLoader();
      if (!form) return;
      setCurrentFormId(form.form_id);
      setBuilderTitle(form.title || '');
      setBuilderDesc(form.description || '');
      let fields = [];
      try { fields = JSON.parse(form.schema_config || '[]'); } catch { fields = []; }
      const sf = fields.find(f => f.id === 'sys_style');
      if (sf && sf.config) {
        setBuilderTheme(sf.config.theme || 'blue');
        setBuilderFont(sf.config.font || 'font-jakarta');
        setBuilderCover(sf.config.cover || '');
        setBuilderSheetName(sf.config.sheetName || '');
        setBuilderSuccessMsg(sf.config.successMsg || '');
        setBuilderIsPublic(sf.config.isPublic !== false);
      }
      setBuilderFields(fields.filter(f => f.id !== 'sys_style'));
      navigate('form-builder');
    } catch { hideLoader(); showToast('Gagal membuka form.', 'error'); }
  };

  const builderSave = async (targetStatus) => {
    if (!builderTitle) return showToast('Beri judul form terlebih dahulu.', 'info');
    if (builderFields.length === 0) return showToast('Minimal harus ada 1 blok pertanyaan.', 'info');
    
    const onConfirmSave = async () => {
      const finalFields = [
        { id: 'sys_style', type: 'header', label: 'SYSTEM_STYLE', config: { theme: builderTheme, font: builderFont, cover: builderCover, sheetName: builderSheetName, successMsg: builderSuccessMsg, isPublic: builderIsPublic } },
        ...builderFields,
      ];
      showLoader('Menyimpan Desain...');
      try {
        await api.saveForm({ form_id: currentFormId, title: builderTitle.trim(), description: builderDesc.trim(), schema_config: JSON.stringify(finalFields) });
        if (targetStatus === 'ACTIVE') {
          await api.publishForm(currentFormId);
          hideLoader(); showToast('Form berhasil dipublikasikan!', 'success');
        } else {
          hideLoader(); showToast('Draft form berhasil disimpan.', 'success');
        }
        navigate('admin-dashboard');
      } catch { hideLoader(); showToast('Gagal menyimpan form.', 'error'); }
    };

    if (targetStatus === 'ACTIVE') {
      showModal('Publikasikan Form?', 'Apakah Anda yakin ingin mempublikasikan formulir ini? Form akan dapat diakses oleh publik.', 'info', onConfirmSave);
    } else {
      onConfirmSave();
    }
  };

  const navVisibleViews = ['portal', 'user-history', 'login', 'admin-dashboard'];
  const showDesktopNav = navVisibleViews.includes(view);
  const showMobileBottomNav = navVisibleViews.includes(view);

  const activeCount = forms.filter(f => f.status === 'ACTIVE').length;

  return (
    <>
      {/* Premium Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in-up"></div>
          <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-[240px] w-full relative z-10 border border-white/50 animate-fade-in-up">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-layer-group text-2xl text-blue-600 animate-pulse"></i>
              </div>
            </div>
            <p className="text-slate-800 font-bold text-base text-center leading-tight">{loaderText}</p>
          </div>
        </div>
      )}

      {/* Floating Glass Toasts */}
      <div className="fixed top-6 sm:top-10 right-4 sm:right-10 z-[9999] flex flex-col gap-4 pointer-events-none w-[calc(100%-2rem)] sm:w-auto sm:min-w-[340px]">
        {toasts.map(t => {
          const typeStyle = t.type === 'success' 
            ? { bg: 'bg-emerald-50/90', border: 'border-emerald-200', text: 'text-emerald-800', icon: 'fa-check-circle', iconColor: 'text-emerald-500' } 
            : t.type === 'error' 
            ? { bg: 'bg-rose-50/90', border: 'border-rose-200', text: 'text-rose-800', icon: 'fa-exclamation-circle', iconColor: 'text-rose-500' } 
            : { bg: 'bg-blue-50/90', border: 'border-blue-200', text: 'text-blue-800', icon: 'fa-info-circle', iconColor: 'text-blue-500' };
          
          return (
            <div key={t.id} className={`flex items-center p-5 rounded-2xl shadow-xl backdrop-blur-xl border-2 ${typeStyle.border} ${typeStyle.bg} pointer-events-auto w-full sm:w-auto animate-fade-in-up overflow-hidden group`}>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-current opacity-20"></div>
              <div className={`p-2.5 rounded-xl ${t.type === 'success' ? 'bg-emerald-100' : t.type === 'error' ? 'bg-rose-100' : 'bg-blue-100'} mr-4 shadow-inner`}>
                <i className={`fas ${typeStyle.icon} text-xl ${typeStyle.iconColor}`}></i>
              </div>
              <span className={`text-sm font-bold leading-tight ${typeStyle.text}`}>{t.message}</span>
            </div>
          );
        })}
      </div>

      {/* Custom Universal Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" onClick={hideModal}></div>
          <div className="glass-card max-w-md w-full rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/40 animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-400"></div>
            <div className="p-8 sm:p-10">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${modal.type === 'danger' ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-500'}`}>
                <i className={`fas ${modal.type === 'danger' ? 'fa-trash-alt' : 'fa-question-circle'}`}></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">{modal.title}</h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">{modal.message}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={hideModal} className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors tap-effect">Batalkan</button>
                {modal.onConfirm && (
                  <button onClick={() => { modal.onConfirm(); hideModal(); }} className={`flex-1 px-8 py-4 ${modal.type === 'danger' ? 'bg-rose-600' : 'bg-blue-600'} text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:brightness-110 transition-all tap-effect`}>
                    Ya, Lanjutkan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      {showDesktopNav && (
        <nav className="glass-nav sticky top-0 z-40 transition-all hidden sm:block border-b border-white/40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-24 items-center">
              <div className="flex items-center cursor-pointer group tap-effect" onClick={() => navigate('portal')}>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl mr-4 shadow-lg shadow-blue-200/50 group-hover:scale-105 group-hover:rotate-6 smooth-transition duration-300">
                  <i className="fas fa-layer-group text-2xl"></i>
                </div>
                <span className="font-black text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">Form<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold">Hub</span></span>
              </div>
              <div className="flex items-center space-x-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-inner">
                <button onClick={() => navigate('portal')} className={`px-6 py-3 rounded-xl text-sm font-bold smooth-transition tap-effect ${view === 'portal' ? 'text-blue-700 bg-white shadow-sm border border-white/60' : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'}`}>
                  <i className="fas fa-home mr-2 text-blue-500"></i>Beranda
                </button>
                <button onClick={() => navigate('user-history')} className={`px-6 py-3 rounded-xl text-sm font-bold smooth-transition tap-effect ${view === 'user-history' ? 'text-blue-700 bg-white shadow-sm border border-white/60' : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'}`}>
                  <i className="fas fa-receipt mr-2 text-blue-500"></i>Riwayat
                </button>
                <div className="w-px h-8 bg-slate-300/50 mx-2"></div>
                {!isAdmin ? (
                  <button onClick={() => navigate('login')} className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-7 py-3 rounded-xl text-sm font-bold shadow-xl shadow-slate-300/50 hover:shadow-slate-400/50 hover:-translate-y-0.5 smooth-transition tap-effect border border-slate-700">
                    <i className="fas fa-shield-alt mr-2 text-slate-300"></i>Creator Login
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate('admin-dashboard')} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 smooth-transition tap-effect border border-indigo-400">
                      <i className="fas fa-chart-pie mr-2 text-indigo-100"></i>Dashboard
                    </button>
                    <button onClick={handleLogout} className="bg-rose-50 text-rose-600 px-5 py-3 rounded-xl text-sm font-bold hover:bg-rose-100 smooth-transition tap-effect border border-rose-200">
                      <i className="fas fa-power-off mr-2"></i>Keluar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Top Header */}
      {showMobileBottomNav && (
        <div className="sm:hidden glass-nav border-b border-white/40 p-4 sticky top-0 z-40 flex justify-between items-center pt-safe shadow-sm">
          <div className="flex items-center font-black text-2xl tracking-tight text-slate-800">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl mr-3 text-sm shadow-md shadow-blue-200/50"><i className="fas fa-layer-group"></i></div>
            Form<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hub</span>
          </div>
          <div className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm">
            <i className="fas fa-user text-sm"></i>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full relative pb-safe">

        {/* VIEW: Setup */}
        {view === 'setup' && <ViewSetup {...{setupDbId, setSetupDbId, setupPin, setSetupPin, handleSetup}} />}

        {/* VIEW: Portal */}
        {view === 'portal' && <ViewPortal {...{forms, userTotalForms, openForm, viewPublicResponses, navigate}} />}

        {/* VIEW: User History */}
        {view === 'user-history' && <ViewUserHistory navigate={navigate} />}

        {/* VIEW: Form Fill */}
        {view === 'form-fill' && <ViewFormFill {...{formTitle, formDesc, formTheme, formFont, formCover, currentSchema, currentFormId, navigate, showLoader, hideLoader, showToast, formValues, setFormValues}} />}

        {/* VIEW: Public Responses */}
        {view === 'public-responses' && <ViewPublicResponses {...{publicResponseTitle, publicResponseData, navigate}} />}

        {/* VIEW: Admin Login */}
        {view === 'login' && <ViewLogin {...{adminPin, setAdminPin, handleAdminLogin}} />}

        {/* VIEW: Admin Dashboard */}
        {view === 'admin-dashboard' && <ViewAdminDashboard {...{forms, activeCount, adminTab, setAdminTab, builderCreateNew, builderEditForm, viewResponses, handleDeleteForm, loadDatabaseList, loadDatabaseData, dbList, dbData, navigate}} />}

        {/* VIEW: Form Builder */}
        {view === 'form-builder' && <ViewFormBuilder {...{builderFields, setBuilderFields, builderTitle, setBuilderTitle, builderDesc, setBuilderDesc, builderTheme, setBuilderTheme, builderFont, setBuilderFont, builderCover, setBuilderCover, builderSheetName, setBuilderSheetName, builderSuccessMsg, setBuilderSuccessMsg, builderIsPublic, setBuilderIsPublic, builderSave, navigate}} />}

        {/* VIEW: Responses */}
        {view === 'responses' && <ViewResponses {...{responseTitle, responseData, responseTab, setResponseTab, currentFormId, showToast, navigate, chartsRef}} />}
      </main>

      {/* Mobile Submit Bar */}
      {view === 'form-fill' && (
        <div className="sm:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 pb-safe z-50">
          <button type="submit" form="form-fill-container" className={`w-full ${(themeColors[formTheme] || themeColors.blue).bg} text-white p-4 rounded-[1.25rem] font-bold shadow-lg tap-effect flex justify-center items-center text-base transition-colors duration-300`}>
            Kirim Jawaban <i className="fas fa-paper-plane ml-2"></i>
          </button>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      {showMobileBottomNav && (
        <div className="sm:hidden fixed bottom-0 left-0 w-full glass-nav border-t border-white/40 flex justify-around px-2 py-2 pb-safe z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button onClick={() => navigate('portal')} className={`bottom-nav-item ${view === 'portal' ? 'text-blue-600' : 'text-slate-400'} flex flex-col items-center justify-center w-16 h-12 tap-effect smooth-transition relative`}>
            {view === 'portal' && <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full shadow-[0_2px_8px_rgba(37,99,235,0.6)]"></span>}
            <i className="fas fa-layer-group text-xl mb-1 mt-1 block"></i>
            <span className="text-[10px] font-extrabold tracking-wide">Layanan</span>
          </button>
          <button onClick={() => navigate('user-history')} className={`bottom-nav-item ${view === 'user-history' ? 'text-blue-600' : 'text-slate-400'} flex flex-col items-center justify-center w-16 h-12 tap-effect smooth-transition relative`}>
            {view === 'user-history' && <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full shadow-[0_2px_8px_rgba(37,99,235,0.6)]"></span>}
            <i className="fas fa-receipt text-xl mb-1 mt-1 block"></i>
            <span className="text-[10px] font-extrabold tracking-wide">Riwayat</span>
          </button>
          <button onClick={() => navigate('login')} className={`bottom-nav-item ${view === 'login' || view === 'admin-dashboard' ? 'text-purple-600' : 'text-slate-400'} flex flex-col items-center justify-center w-16 h-12 tap-effect smooth-transition relative`}>
            {(view === 'login' || view === 'admin-dashboard') && <span className="absolute top-0 w-8 h-1 bg-purple-600 rounded-b-full shadow-[0_2px_8px_rgba(147,51,234,0.6)]"></span>}
            <i className="fas fa-shield-alt text-xl mb-1 mt-1 block"></i>
            <span className="text-[10px] font-extrabold tracking-wide">Creator</span>
          </button>
        </div>
      )}
    </>
  );
}
