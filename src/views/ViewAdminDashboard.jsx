import { useEffect } from 'react';

export default function ViewAdminDashboard({ forms, activeCount, adminTab, setAdminTab, builderCreateNew, builderEditForm, viewResponses, handleDeleteForm, loadDatabaseList, loadDatabaseData, dbList, dbData, navigate }) {
  useEffect(() => {
    if (adminTab === 'database') loadDatabaseList();
  }, [adminTab]);

  const switchTab = (tab) => setAdminTab(tab);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex justify-between items-center mb-8 hidden sm:flex">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Creator</h2>
            <p className="text-slate-500 mt-1">Kelola formulir dan analisis data.</p>
          </div>
          <button onClick={builderCreateNew} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 tap-effect smooth-transition flex items-center">
            <i className="fas fa-plus mr-2"></i> Buat Form Baru
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="admin-gradient rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10"><i className="fas fa-chart-line text-9xl"></i></div>
              <p className="text-sm text-indigo-100 font-semibold mb-6">Status Workspace</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{activeCount}</h1>
                  <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mt-1 block">Form Aktif</span>
                </div>
                <div className="text-right border-l border-indigo-400/30 pl-4">
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">-</h1>
                  <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mt-1 block">Respons</span>
                </div>
              </div>
            </div>

            {/* Desktop Tab Sidebar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hidden lg:block">
              <div className="space-y-2">
                <button onClick={() => switchTab('forms')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold smooth-transition flex items-center ${adminTab === 'forms' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <div className="w-8"><i className="fas fa-folder-open"></i></div> Daftar Formulir
                </button>
                <button onClick={() => switchTab('database')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold smooth-transition flex items-center ${adminTab === 'database' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <div className="w-8"><i className="fas fa-database"></i></div> Master Database
                </button>
              </div>
            </div>

            {/* Mobile Menu Grid */}
            <div className="lg:hidden">
              <h3 className="font-extrabold text-slate-800 mb-4 text-base">Menu Creator</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center tap-effect cursor-pointer group" onClick={builderCreateNew}>
                  <div className="w-14 h-14 rounded-[1rem] bg-blue-50 text-blue-600 text-2xl flex items-center justify-center"><i className="fas fa-plus-square"></i></div>
                  <span className="text-[10px] font-bold mt-2 text-center">Buat Form</span>
                </div>
                <div className="flex flex-col items-center tap-effect cursor-pointer group" onClick={() => switchTab('forms')}>
                  <div className="w-14 h-14 rounded-[1rem] bg-indigo-50 text-indigo-600 text-2xl flex items-center justify-center"><i className="fas fa-folder-open"></i></div>
                  <span className="text-[10px] font-bold mt-2 text-center">Formulir</span>
                </div>
                <div className="flex flex-col items-center tap-effect cursor-pointer group" onClick={() => switchTab('database')}>
                  <div className="w-14 h-14 rounded-[1rem] bg-emerald-50 text-emerald-600 text-2xl flex items-center justify-center"><i className="fas fa-database"></i></div>
                  <span className="text-[10px] font-bold mt-2 text-center">Database</span>
                </div>
                <div className="flex flex-col items-center tap-effect cursor-pointer group" onClick={() => navigate('setup')}>
                  <div className="w-14 h-14 rounded-[1rem] bg-slate-100 text-slate-600 text-2xl flex items-center justify-center"><i className="fas fa-cog"></i></div>
                  <span className="text-[10px] font-bold mt-2 text-center">Setup</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            {/* Forms Tab */}
            {adminTab === 'forms' && (
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200 min-h-[500px]">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-800 text-xl">Daftar Formulir</h3>
                </div>
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <table className="min-w-full divide-y divide-slate-100 hidden sm:table">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Formulir</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                      {forms.map(f => {
                        const badgeColor = f.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
                        const badgeIcon = f.status === 'ACTIVE' ? 'fa-globe' : 'fa-file-signature';
                        const badgeText = f.status === 'ACTIVE' ? 'Publik' : 'Draft';
                        return (
                          <tr key={f.form_id} className="hover:bg-slate-50 smooth-transition">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-extrabold text-slate-800 text-sm">{f.title}</div>
                              <div className="text-[10px] font-mono text-slate-400 mt-1">{f.form_id}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${badgeColor}`}><i className={`fas ${badgeIcon} mr-1`}></i>{badgeText}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleDeleteForm(f.form_id)} className="bg-white border border-rose-200 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-rose-50 smooth-transition" title="Hapus Form"><i className="fas fa-trash-alt"></i></button>
                                <button onClick={() => builderEditForm(f.form_id)} className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 smooth-transition"><i className="fas fa-edit mr-1"></i>Edit Builder</button>
                                {f.status === 'ACTIVE' && (
                                  <button onClick={() => viewResponses(f.form_id, f.title)} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 smooth-transition"><i className="fas fa-chart-bar mr-1"></i>Analisis Data</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Mobile Cards */}
                  <div className="space-y-4 sm:hidden">
                    {forms.map(f => {
                      const badgeColor = f.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
                      const badgeIcon = f.status === 'ACTIVE' ? 'fa-globe' : 'fa-file-signature';
                      const badgeText = f.status === 'ACTIVE' ? 'Publik' : 'Draft';
                      return (
                        <div key={f.form_id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-3/4"><h4 className="font-extrabold text-slate-800 text-sm line-clamp-2">{f.title}</h4></div>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border ${badgeColor}`}><i className={`fas ${badgeIcon} mr-1`}></i>{badgeText}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteForm(f.form_id)} className="w-10 flex-shrink-0 bg-rose-50 text-rose-600 py-2.5 rounded-xl text-xs font-bold tap-effect hover:bg-rose-100"><i className="fas fa-trash-alt"></i></button>
                            <button onClick={() => builderEditForm(f.form_id)} className="flex-1 bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-bold tap-effect hover:bg-slate-100 border border-slate-100"><i className="fas fa-edit mr-1"></i>Edit</button>
                            {f.status === 'ACTIVE' && (
                              <button onClick={() => viewResponses(f.form_id, f.title)} className="flex-1 bg-indigo-50 text-indigo-700 py-2.5 rounded-xl text-xs font-bold tap-effect hover:bg-indigo-100"><i className="fas fa-chart-bar mr-1"></i>Data</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Database Tab */}
            {adminTab === 'database' && (
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200 min-h-[500px]">
                <h3 className="font-extrabold text-slate-800 mb-2 text-xl">Master Database (VLOOKUP)</h3>
                <p className="text-sm text-slate-500 mb-6">Pilih sheet di Spreadsheet Anda untuk melihat data sumber.</p>
                <select onChange={e => loadDatabaseData(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-4 bg-slate-50 font-bold text-slate-700 app-select mb-6" defaultValue="">
                  <option value="" disabled>-- Pilih Sheet Master --</option>
                  {dbList.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
                {dbData && (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>{dbData.headers.map((h, i) => <th key={i} className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest">{h}</th>)}</tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100 text-sm">
                        {dbData.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-slate-50">
                            {row.map((cell, ci) => <td key={ci} className="px-5 py-4 border-b border-slate-100 whitespace-nowrap text-slate-700 font-medium">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
