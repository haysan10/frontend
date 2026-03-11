export default function ViewPublicResponses({ publicResponseTitle, publicResponseData, navigate }) {
  const data = publicResponseData;
  const hasData = data && data.rows && data.rows.length > 0;
  const headers = hasData ? data.headers.slice(1) : [];
  const rows = hasData ? data.rows : [];

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <button onClick={() => navigate('portal')} className="h-10 w-10 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 mr-4 tap-effect smooth-transition">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{publicResponseTitle}</h2>
              <p className="text-slate-500 text-sm mt-1">Data Respons Publik Real-time</p>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-x-auto border border-slate-200 rounded-3xl shadow-sm w-full p-1 sm:p-2">
          {hasData ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {rows.map((row, ri) => {
                  const cells = row.slice(1);
                  return (
                    <tr key={ri} className="hover:bg-slate-50 smooth-transition">
                      {cells.map((cell, ci) => {
                        let display = cell;
                        if (typeof cell === 'string' && cell.includes('drive.google.com')) {
                          return <td key={ci} className="px-5 sm:px-6 py-4 sm:py-5 text-sm font-medium border-b border-slate-100 whitespace-nowrap"><a href={cell} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 smooth-transition"><i className="fas fa-external-link-alt mr-2"></i>Lihat File</a></td>;
                        }
                        if (ci === 0 && typeof cell === 'string' && cell.match(/^\d{4}-\d{2}-\d{2}T/)) {
                          display = new Date(cell).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
                        }
                        return <td key={ci} className="px-5 sm:px-6 py-4 sm:py-5 text-sm font-medium text-slate-700 border-b border-slate-100 whitespace-nowrap">{display || '-'}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center">
              <div className="inline-flex h-20 w-20 bg-slate-50 text-slate-300 rounded-full items-center justify-center text-4xl mb-4"><i className="fas fa-folder-open"></i></div>
              <h3 className="text-lg font-extrabold text-slate-700">Data Kosong</h3>
              <p className="text-slate-500 text-sm">Belum ada orang yang mengisi form ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
