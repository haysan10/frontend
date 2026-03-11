export default function ViewLogin({ adminPin, setAdminPin, handleAdminLogin }) {
  return (
    <div>
      <div className="max-w-md mx-auto px-6 py-12 sm:py-24">
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-[1.5rem] items-center justify-center text-4xl mb-6 shadow-inner border border-white">
            <i className="fas fa-fingerprint"></i>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Creator Portal</h1>
          <p className="text-slate-500 text-sm">Masukkan PIN keamanan workspace Anda.</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <input type="password" value={adminPin} onChange={e => setAdminPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} className="w-full border-2 border-slate-100 rounded-2xl p-5 text-center text-2xl tracking-[0.5em] font-bold mb-6 bg-slate-50 focus:bg-white focus:border-blue-500 smooth-transition outline-none" placeholder="PIN" inputMode="numeric" />
          <button onClick={handleAdminLogin} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold hover:bg-blue-600 shadow-lg shadow-slate-200 tap-effect text-lg smooth-transition">Verifikasi Akses</button>
        </div>
      </div>
    </div>
  );
}
