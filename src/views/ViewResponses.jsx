import { useEffect, useRef, useState } from 'react';
import { Chart, DoughnutController, ArcElement, Legend, Tooltip } from 'chart.js';
import * as api from '../services/api';

Chart.register(DoughnutController, ArcElement, Legend, Tooltip);

export default function ViewResponses({ responseTitle, responseData, responseTab, setResponseTab, currentFormId, showToast, navigate }) {
  const chartsRef = useRef([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [localData, setLocalData] = useState(responseData);

  useEffect(() => { setLocalData(responseData); }, [responseData]);

  // Render Charts
  useEffect(() => {
    if (responseTab !== 'stats' || !localData || !localData.rows.length) return;
    // Cleanup old charts
    chartsRef.current.forEach(c => c.destroy());
    chartsRef.current = [];

    // Create charts for each column
    localData.headers.forEach((header, colIdx) => {
      if (colIdx < 2) return;
      const counts = {};
      localData.rows.forEach(row => {
        const val = row[colIdx];
        if (val && String(val).trim() !== '') {
          String(val).split(',').map(v => v.trim()).forEach(mVal => {
            if (mVal !== '') counts[mVal] = (counts[mVal] || 0) + 1;
          });
        }
      });
      const labels = Object.keys(counts);
      if (labels.length > 1 && labels.length <= 8) {
        setTimeout(() => {
          const ctx = document.getElementById('chart_' + colIdx)?.getContext('2d');
          if (!ctx) return;
          const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels,
              datasets: [{ data: Object.values(counts), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'], borderWidth: 0, hoverOffset: 5 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 11, family: 'Plus Jakarta Sans', weight: 'bold' } } } }, cutout: '70%' }
          });
          chartsRef.current.push(chart);
        }, 100);
      }
    });

    return () => { chartsRef.current.forEach(c => c.destroy()); chartsRef.current = []; };
  }, [responseTab, localData]);

  const handleEditCell = (rowIdx, colIdx, oldVal) => {
    setEditingCell({ rowIdx, colIdx });
    setEditValue(oldVal === '-' ? '' : oldVal);
  };

  const handleSaveCell = async () => {
    if (!editingCell) return;
    const { rowIdx, colIdx } = editingCell;
    const newVal = editValue.trim();
    try {
      await api.updateResponseCell(currentFormId, rowIdx, colIdx, newVal);
      setLocalData(prev => {
        const next = { ...prev, rows: prev.rows.map((r, ri) => ri === rowIdx ? r.map((c, ci) => ci === colIdx ? newVal : c) : r) };
        return next;
      });
      showToast('Data sel berhasil diubah.', 'success');
    } catch { showToast('Gagal menyimpan perubahan.', 'error'); }
    setEditingCell(null);
  };

  const downloadCSV = () => {
    if (!localData || localData.rows.length === 0) return showToast('Belum ada data untuk diekspor.', 'info');
    let csv = 'data:text/csv;charset=utf-8,';
    csv += localData.headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';
    localData.rows.forEach(row => {
      csv += row.map(c => `"${(c === null || c === undefined ? '' : String(c)).replace(/"/g, '""')}"`).join(',') + '\r\n';
    });
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `DataExport_${currentFormId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV sedang diunduh.', 'success');
  };

  const data = localData;
  const hasData = data && data.rows && data.rows.length > 0;
  const headers = hasData ? data.headers.slice(1) : [];

  // Determine which columns have chart-worthy data
  const chartColumns = hasData ? data.headers.map((header, colIdx) => {
    if (colIdx < 2) return null;
    const counts = {};
    data.rows.forEach(row => {
      const val = row[colIdx];
      if (val && String(val).trim() !== '') {
        String(val).split(',').map(v => v.trim()).forEach(mVal => {
          if (mVal !== '') counts[mVal] = (counts[mVal] || 0) + 1;
        });
      }
    });
    const labels = Object.keys(counts);
    if (labels.length > 1 && labels.length <= 8) return { colIdx, header };
    return null;
  }).filter(Boolean) : [];

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <button onClick={() => navigate('admin-dashboard')} className="h-12 w-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 mr-4 tap-effect shadow-sm">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate max-w-xs sm:max-w-md lg:max-w-xl">{responseTitle}</h2>
              <p className="text-slate-500 text-sm">Analisis dan Manajemen Data Respons</p>
            </div>
          </div>
          <button onClick={downloadCSV} className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 tap-effect smooth-transition flex items-center justify-center">
            <i className="fas fa-file-excel mr-2"></i> Ekspor CSV
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50">
            <button onClick={() => setResponseTab('data')} className={`px-8 py-4 border-b-2 font-bold text-sm ${responseTab === 'data' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white smooth-transition'}`}>Tabel Data</button>
            <button onClick={() => setResponseTab('stats')} className={`px-8 py-4 border-b-2 font-bold text-sm ${responseTab === 'stats' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white smooth-transition'}`}>Visualisasi Data</button>
          </div>

          <div className="p-6 sm:p-8">
            {responseTab === 'data' && (
              <div>
                <div className="mb-4 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 p-3 rounded-xl inline-flex items-center">
                  <i className="fas fa-lightbulb mr-2 text-blue-500"></i> Klik langsung pada sel tabel untuk mengedit (Live Edit).
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-2xl w-full">
                  {hasData ? (
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>{headers.map((h, i) => <th key={i} className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap bg-slate-50 border-b border-slate-200">{h}</th>)}</tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100 text-sm">
                        {data.rows.map((row, ri) => {
                          const cells = row.slice(1);
                          return (
                            <tr key={ri} className="hover:bg-slate-50 smooth-transition">
                              {cells.map((cell, ci) => {
                                const actualColIdx = ci + 1;
                                let display = cell;
                                if (typeof cell === 'string' && cell.includes('drive.google.com')) {
                                  return <td key={ci} className="px-6 py-4 border-b border-slate-100 whitespace-nowrap"><a href={cell} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 smooth-transition"><i className="fas fa-paperclip mr-2"></i>Buka Lampiran</a></td>;
                                }
                                if (typeof cell === 'string' && cell.match(/^\d{4}-\d{2}-\d{2}T/)) {
                                  display = new Date(cell).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
                                }
                                const isEditing = editingCell && editingCell.rowIdx === ri && editingCell.colIdx === actualColIdx;
                                if (actualColIdx > 1) {
                                  return (
                                    <td key={ci} className="px-6 py-4 border-b border-slate-100 whitespace-nowrap cursor-pointer text-slate-700" onClick={() => !isEditing && handleEditCell(ri, actualColIdx, display)}>
                                      {isEditing ? (
                                        <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={handleSaveCell} onKeyDown={e => e.key === 'Enter' && handleSaveCell()} className="border-2 border-blue-500 p-2 w-full text-sm rounded-xl bg-white font-bold outline-none shadow-sm" autoFocus />
                                      ) : (
                                        <span className="border-b border-dashed border-blue-300 pb-0.5 hover:text-blue-600">{display || '-'}</span>
                                      )}
                                    </td>
                                  );
                                }
                                return <td key={ci} className="px-6 py-4 border-b border-slate-100 whitespace-nowrap text-slate-500 font-medium">{display || '-'}</td>;
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center text-slate-400">Belum ada data respons.</div>
                  )}
                </div>
              </div>
            )}

            {responseTab === 'stats' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hasData && (
                  <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 flex justify-between items-center h-full relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10"><i className="fas fa-database text-9xl"></i></div>
                    <div className="relative z-10">
                      <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2">Total Data Masuk</div>
                      <div className="text-5xl font-extrabold">{data.rows.length}</div>
                    </div>
                  </div>
                )}
                {chartColumns.map(({ colIdx, header }) => (
                  <div key={colIdx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center hover:shadow-md smooth-transition">
                    <h4 className="text-sm font-extrabold text-slate-700 mb-6 text-center w-full truncate px-2">{header}</h4>
                    <div className="relative w-full aspect-square max-w-[220px]"><canvas id={'chart_' + colIdx}></canvas></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
