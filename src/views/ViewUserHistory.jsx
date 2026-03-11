export default function ViewUserHistory({ navigate }) {
  const history = JSON.parse(localStorage.getItem('form_history') || '[]');
  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('portal')} className="hidden sm:flex h-10 w-10 bg-white border border-slate-200 shadow-sm rounded-full items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 mr-4 tap-effect smooth-transition">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Riwayat Jawaban</h1>
            <p className="text-slate-500 text-sm mt-1">Daftar form yang telah Anda selesaikan.</p>
          </div>
        </div>
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-200 mt-6 shadow-sm">
              <i className="fas fa-ghost text-6xl text-slate-200 mb-4"></i>
              <h3 className="text-xl font-extrabold text-slate-700">Belum Ada Riwayat</h3>
              <p className="text-slate-500 text-sm mt-2">Formulir yang Anda kirimkan akan muncul di sini.</p>
            </div>
          ) : history.map((h, i) => (
            <div key={i} className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center hover:shadow-md smooth-transition">
              <div className="bg-blue-50 text-blue-600 h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center mr-5 flex-shrink-0 text-xl"><i className="fas fa-check-double"></i></div>
              <div className="flex-grow overflow-hidden">
                <h4 className="font-extrabold text-slate-800 text-base sm:text-lg truncate">{h.title}</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium"><i className="far fa-clock mr-1"></i>{new Date(h.date).toLocaleString('id-ID')}</p>
              </div>
              <div className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hidden sm:block">Terkirim</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
