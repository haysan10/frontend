import React from 'react';

const appIcons = [
  { icon: 'fa-bolt', color: 'bg-amber-100 text-amber-500', shadow: 'shadow-amber-200' },
  { icon: 'fa-box-open', color: 'bg-emerald-100 text-emerald-500', shadow: 'shadow-emerald-200' },
  { icon: 'fa-rocket', color: 'bg-blue-100 text-blue-500', shadow: 'shadow-blue-200' },
  { icon: 'fa-star', color: 'bg-purple-100 text-purple-500', shadow: 'shadow-purple-200' },
  { icon: 'fa-heart', color: 'bg-rose-100 text-rose-500', shadow: 'shadow-rose-200' },
];

export default function ViewPortal({ forms, userTotalForms, openForm, viewPublicResponses, navigate }) {
  const activeForms = forms.filter(f => f.status === 'ACTIVE');

  return (
    <div className="relative z-10 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 mb-10 text-center relative overflow-hidden border border-white/60">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400"></div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 text-sm font-bold mb-6 backdrop-blur-md">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Sistem Aktif & Terhubung
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
            Selamat datang di <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600">FormHub Catalog</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Platform digital untuk mengelola, mengisi, dan memantau formulir secara real-time dengan pengalaman tanpa batas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="animated-bg rounded-[2rem] p-8 text-slate-800 shadow-xl shadow-blue-200/40 relative overflow-hidden tap-effect cursor-pointer group border border-white/50" onClick={() => navigate('user-history')}>
              <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 group-hover:rotate-12 smooth-transition duration-500"><i className="fas fa-fingerprint text-[12rem] text-blue-900"></i></div>
              <p className="text-sm text-blue-900/70 font-bold tracking-widest uppercase mb-2">Aktivitas Anda</p>
              <div className="flex items-baseline gap-2">
                <h1 className="text-6xl font-black tracking-tight text-blue-950">{userTotalForms}</h1>
                <span className="text-lg font-bold text-blue-800/80">Pengiriman</span>
              </div>
              <div className="mt-8 pt-5 border-t border-blue-300/30 flex justify-between items-center text-sm font-bold text-blue-900 bg-white/40 px-5 py-3 rounded-2xl backdrop-blur-md group-hover:bg-white/60 smooth-transition">
                <span>Lihat Riwayat Detail</span>
                <div className="bg-white p-2 rounded-xl shadow-sm group-hover:translate-x-1 smooth-transition"><i className="fas fa-arrow-right text-blue-600"></i></div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-card p-6 sm:p-8 rounded-[2rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-slate-800 text-xl sm:text-2xl flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-xl text-lg"><i className="fas fa-shapes"></i></div>
                  Katalog Layanan
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {activeForms.length === 0 ? (
                  <div className="col-span-full text-center text-slate-400 text-sm py-12 font-medium bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">Belum ada form yang dipublikasikan.</div>
                ) : activeForms.map((f, idx) => {
                  const realIdx = forms.indexOf(f);
                  const style = appIcons[idx % appIcons.length];
                  return (
                    <div key={f.form_id} className="flex flex-col items-center tap-effect cursor-pointer group" onClick={() => openForm(realIdx)}>
                      <div className={`w-full aspect-square rounded-[2rem] ${style.color} flex items-center justify-center text-4xl shadow-lg ${style.shadow} mb-4 group-hover:-translate-y-2 group-active:scale-95 smooth-transition duration-300 border-2 border-transparent group-hover:border-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                        <i className={`fas ${style.icon} relative z-10 group-hover:scale-110 smooth-transition text-5xl`}></i>
                      </div>
                      <span className="text-sm font-extrabold text-slate-700 text-center leading-tight w-full px-2 line-clamp-2 group-hover:text-blue-600 smooth-transition">{f.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-[2rem]">
              <div className="flex justify-between items-center mb-6 border-b border-white/50 pb-4">
                <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl text-lg"><i className="fas fa-chart-pie"></i></div>
                  Transparansi Data
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-xl border border-emerald-200/50 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeForms.filter(f => {
                  try {
                    const schema = JSON.parse(f.schema_config || '[]');
                    const sf = schema.find(s => s.id === 'sys_style');
                    return !sf || !sf.config || sf.config.isPublic !== false;
                  } catch { return true; }
                }).length === 0 ? (
                  <div className="col-span-full text-slate-400 text-sm mt-2 italic bg-white/30 p-4 rounded-xl">Belum ada form publik untuk ditampilkan.</div>
                ) : activeForms.filter(f => {
                  try {
                    const schema = JSON.parse(f.schema_config || '[]');
                    const sf = schema.find(s => s.id === 'sys_style');
                    return !sf || !sf.config || sf.config.isPublic !== false;
                  } catch { return true; }
                }).map((f, idx) => {
                  const style = appIcons[idx % appIcons.length];
                  return (
                    <div key={f.form_id} className="bg-white/60 backdrop-blur-sm border border-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm tap-effect group hover:shadow-md hover:-translate-y-1 hover:bg-white smooth-transition duration-300 cursor-pointer" onClick={() => viewPublicResponses(f.form_id, f.title)}>
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`w-14 h-14 rounded-2xl ${style.color} flex-shrink-0 flex items-center justify-center text-xl shadow-inner`}>
                          <i className={`fas ${style.icon}`}></i>
                        </div>
                        <div className="truncate pr-2">
                          <h4 className="font-extrabold text-slate-800 text-base truncate group-hover:text-blue-600 smooth-transition">{f.title}</h4>
                          <p className="text-xs font-bold text-slate-400 truncate mt-1">Lihat rekapitulasi data statis</p>
                        </div>
                      </div>
                      <div className="bg-slate-100/80 h-10 w-10 rounded-full flex items-center justify-center text-slate-400 flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 smooth-transition">
                        <i className="fas fa-chevron-right text-xs"></i>
                      </div>
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
