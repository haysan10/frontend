export default function ViewSetup({ setupDbId, setSetupDbId, setupPin, setSetupPin, handleSetup }) {
  return (
    <div>
      <div className="max-w-md mx-auto bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 m-4 sm:mt-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-50 p-5 rounded-3xl mb-4 text-blue-600"><i className="fas fa-cogs text-4xl"></i></div>
          <h2 className="text-2xl font-extrabold text-slate-800">Inisialisasi Sistem</h2>
          <p className="text-slate-500 text-sm mt-2">Hubungkan aplikasi dengan Google Spreadsheet Anda.</p>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Spreadsheet ID</label>
            <input type="text" value={setupDbId} onChange={e => setSetupDbId(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-slate-800 bg-slate-50 focus:bg-white focus:border-blue-400 smooth-transition text-base" placeholder="1A2B3C4D5E..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Buat PIN Keamanan Admin</label>
            <input type="password" value={setupPin} onChange={e => setSetupPin(e.target.value)} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-slate-800 bg-slate-50 focus:bg-white focus:border-blue-400 smooth-transition text-center tracking-[0.5em] text-xl font-bold" placeholder="••••••" />
          </div>
          <button onClick={handleSetup} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold hover:bg-blue-600 shadow-lg shadow-slate-300 smooth-transition tap-effect mt-4 text-lg">Mulai Setup Otomatis</button>
        </div>
      </div>
    </div>
  );
}
