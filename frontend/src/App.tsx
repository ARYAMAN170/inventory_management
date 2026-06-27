import { useState, useMemo, useEffect } from 'react';

// ==========================================
// BACKEND CONFIGURATION — CHANGE THIS URL
// ==========================================
const BASE_URL = 'https://inventory-management-452p.onrender.com';
//https://inventory-management-452p.onrender.com
// ==========================================
// SHARED TYPES
// ==========================================
interface TransactionState {
  type: 'IN' | 'OUT' | null;
  process: string | null;
  brand: string | null;
  grade: string | null;
  quantity: string;
  partyName: string;
}

// ==========================================
// SHARED UI: QUANTITY PAD
// ==========================================
const FactoryQuantityPad = ({ transactionType, selectedItem, quantity, setQuantity, partyName, setPartyName, onSubmit, onCancel, isLoading }: any) => {
  const handlePadClick = (num: string) => {
    if (quantity === '' && num === '0') return;
    if (quantity.length >= 4) return;
    setQuantity(quantity + num);
  };
  const isReceiving = transactionType === 'IN';

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          {isReceiving ? 'Receiving Material' : 'Issuing Material'}
        </p>
        <div className={`text-xl font-black py-3 px-5 rounded-xl inline-block ${isReceiving ? 'text-emerald-800 bg-emerald-50 ring-1 ring-emerald-200' : 'text-indigo-800 bg-indigo-50 ring-1 ring-indigo-200'}`}>
          {selectedItem}
        </div>
      </div>

      {/* DYNAMIC FIELD: Supplier vs Customer Input */}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder={isReceiving ? "Enter Supplier Name..." : "Enter Customer/Party Name..."}
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          className="w-full px-4 py-3 text-center font-bold text-gray-700 bg-gray-50 ring-1 ring-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase"
        />
      </div>

      <div className="bg-gray-50 ring-1 ring-gray-200 rounded-xl h-20 mb-4 flex items-center justify-end px-5">
        <span className="text-5xl font-mono font-bold text-gray-800">{quantity || '0'}</span>
        <span className="text-lg text-gray-400 ml-2 font-medium">bags</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handlePadClick(num.toString())}
            className="h-16 text-3xl font-bold bg-white ring-1 ring-gray-200 rounded-xl active:bg-gray-100 text-gray-800">
            {num}
          </button>
        ))}
        <button onClick={() => setQuantity(quantity.slice(0, -1))}
          className="h-16 text-xl font-bold bg-red-50 text-red-600 ring-1 ring-red-200 rounded-xl active:bg-red-100">
          ⌫
        </button>
        <button onClick={() => handlePadClick('0')}
          className="h-16 text-3xl font-bold bg-white ring-1 ring-gray-200 rounded-xl active:bg-gray-100 text-gray-800">
          0
        </button>
        <button onClick={() => setQuantity('')}
          className="h-16 text-sm font-bold bg-gray-100 text-gray-600 ring-1 ring-gray-200 rounded-xl active:bg-gray-200">
          CLR
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        <button onClick={onCancel}
          className="py-4 text-base font-bold text-gray-600 bg-white ring-1 ring-gray-200 rounded-xl active:bg-gray-50">
          Back
        </button>
        <button onClick={onSubmit} disabled={!quantity || isLoading || !partyName.trim()}
          className={`py-4 text-base font-bold text-white rounded-xl transition-colors ${isLoading || !quantity || !partyName.trim() ? 'bg-gray-300 cursor-not-allowed' : isReceiving ? 'bg-emerald-600 active:bg-emerald-800' : 'bg-indigo-600 active:bg-indigo-800'}`}>
          {isLoading ? 'Saving…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};
// ==========================================
// MODULE: INVENTORY DASHBOARD
// ==========================================

const InventoryDashboard = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track expanded state for both levels
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [expandedSubCats, setExpandedSubCats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`${BASE_URL}/api/inventory`)
      .then(r => r.json())
      .then(result => { if (result.success) setInventory(result.data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Group items by Main Category -> Sub Category (Process)
  const groupedInventory = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {};
    inventory.forEach(item => {
      const processName = (item.process || 'OTHER').trim().toUpperCase();
      // Extract main category (e.g., "PP" from "PP-MOULDING")
      const mainCategory = processName.split('-')[0].trim();
      const subCategory = processName; 

      if (!groups[mainCategory]) groups[mainCategory] = {};
      if (!groups[mainCategory][subCategory]) groups[mainCategory][subCategory] = [];

      groups[mainCategory][subCategory].push(item);
    });
    return groups;
  }, [inventory]);

  const toggleCategory = (cat: string) => setExpandedCats(p => ({ ...p, [cat]: !p[cat] }));
  const toggleSubCategory = (sub: string) => setExpandedSubCats(p => ({ ...p, [sub]: !p[sub] }));

  // Helper to calculate totals for an array of items
  const calcTotals = (items: any[]) => ({
    opening: items.reduce((s, i) => s + Number(i.opening || 0), 0),
    in: items.reduce((s, i) => s + Number(i.totalIn || 0), 0),
    out: items.reduce((s, i) => s + Number(i.totalOut || 0), 0),
    current: items.reduce((s, i) => s + Number(i.current || 0), 0),
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium">Loading inventory…</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-indigo-50 text-indigo-800 rounded-xl p-3 text-center ring-1 ring-indigo-100">
          <p className="text-xl font-black">{inventory.length}</p>
          <p className="text-xs font-bold opacity-70 uppercase tracking-wide">Total Grades</p>
        </div>
      </div>

      {/* Level 1: Main Category Accordion */}
      <div className="space-y-4">
        {Object.entries(groupedInventory).map(([mainCat, subCats]) => {
          const isMainOpen = expandedCats[mainCat];
          
          // Calculate Grand Totals for this Main Category (e.g., ALL PP)
          const allItemsInMain = Object.values(subCats).flat();
          const mainTotals = calcTotals(allItemsInMain);
          const isMainOutOfStock = mainTotals.current <= 0;

          return (
            <div key={mainCat} className="bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden shadow-sm transition-all">
              
              {/* Main Category Header */}
              <button onClick={() => toggleCategory(mainCat)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-transparent data-[open=true]:border-gray-200" data-open={isMainOpen}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {mainCat.substring(0, 3)}
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">{mainCat}</h3>
                    <span className="text-gray-500 text-sm font-bold">
                      {Object.keys(subCats).length} Processes
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-5">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total {mainCat} Stock</p>
                    <p className={`text-2xl font-black ${isMainOutOfStock ? 'text-red-600' : 'text-gray-900'}`}>
                      {mainTotals.current} <span className="text-sm font-medium text-gray-500">bags</span>
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isMainOpen ? 'rotate-180 bg-gray-200' : 'bg-gray-100'}`}>
                    <span className="text-gray-500 font-bold text-xs">▼</span>
                  </div>
                </div>
              </button>

              {/* Level 2: Sub-Category Accordion (Processes) */}
              {isMainOpen && (
                <div className="bg-gray-50/50 p-3 space-y-3">
                  {Object.entries(subCats).map(([subCat, items]) => {
                    const isSubOpen = expandedSubCats[subCat];
                    const subTotals = calcTotals(items);
                    const isSubOutOfStock = subTotals.current <= 0;
                    
                    // Cleanup subcategory name (remove prefix if it matches mainCat for cleaner UI, e.g., "PP-MOULDING" -> "MOULDING")
                    const displayName = subCat.startsWith(`${mainCat}-`) ? subCat.replace(`${mainCat}-`, '') : subCat;

                    return (
                      <div key={subCat} className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden shadow-sm">
                        
                        {/* Sub-Category Header */}
                        <button onClick={() => toggleSubCategory(subCat)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                            <div className="text-left">
                              <h4 className="text-lg font-black text-gray-800">{displayName}</h4>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{items.length} variants</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-lg ${isSubOutOfStock ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
                              <span className="font-black">{subTotals.current}</span>
                              <span className="text-[10px] font-bold ml-1 uppercase opacity-70">bags</span>
                            </div>
                            <span className={`text-gray-400 font-bold text-xs transition-transform ${isSubOpen ? 'rotate-180' : ''}`}>▼</span>
                          </div>
                        </button>

                        {/* Level 3: The Data Table (Grades) */}
                        {isSubOpen && (
                          <div className="border-t border-gray-100">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-indigo-50/30 border-b border-gray-200">
                                  <tr>
                                    {['Brand', 'Grade', 'Opening', 'In', 'Out', 'Current'].map(h => (
                                      <th key={h} className={`px-5 py-3 font-bold text-[11px] uppercase tracking-wider ${h === 'Brand' || h === 'Grade' ? 'text-left' : 'text-center'} ${h === 'Current' ? 'text-indigo-900 bg-indigo-50' : 'text-gray-500'}`}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {items.map((item, i) => {
                                    const isOutOfStock = Number(item.current) <= 0;
                                    return (
                                      <tr key={i} className={`transition-colors ${isOutOfStock ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                                        <td className="px-5 py-3 text-gray-600 font-medium">{item.brand}</td>
                                        <td className="px-5 py-3 font-black text-gray-800">{item.grade}</td>
                                        <td className="px-5 py-3 text-center text-gray-400">{item.opening}</td>
                                        <td className="px-5 py-3 text-center font-bold text-emerald-600">{item.totalIn}</td>
                                        <td className="px-5 py-3 text-center font-bold text-sky-600">{item.totalOut}</td>
                                        <td className={`px-5 py-3 text-center font-black ${isOutOfStock ? 'text-red-600 bg-red-50/50' : 'text-gray-900 bg-indigo-50/30'}`}>{item.current}</td>
                                      </tr>
                                    );
                                  })}
                                  {/* EXACT PAPER STYLE TOTAL ROW */}
                                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                                    <td colSpan={2} className="px-5 py-3.5 font-black text-gray-900 uppercase tracking-widest text-xs text-right">
                                      {displayName} TOTAL :
                                    </td>
                                    <td className="px-5 py-3.5 text-center font-black text-gray-600">{subTotals.opening}</td>
                                    <td className="px-5 py-3.5 text-center font-black text-emerald-700">+{subTotals.in}</td>
                                    <td className="px-5 py-3.5 text-center font-black text-sky-700">-{subTotals.out}</td>
                                    <td className="px-5 py-3.5 text-center font-black text-indigo-900 bg-indigo-100">{subTotals.current}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden p-3 space-y-3 bg-gray-50/50">
                              {items.map((item, i) => {
                                const isOutOfStock = Number(item.currentStock) <= 0;
                                return (
                                  <div key={i} className={`bg-white rounded-xl ring-1 p-3 ${isOutOfStock ? 'ring-red-200 bg-red-50/30' : 'ring-gray-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-black text-gray-900 text-sm">{item.grade}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{item.brand}</p>
                                      </div>
                                      <div className={`text-right rounded-lg px-2 py-1 ${isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-900'}`}>
                                        <span className="font-black">{item.currentStock}</span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1 text-center text-xs">
                                      <div className="bg-gray-50 rounded py-1"><span className="text-gray-400 text-[10px] mr-1">OP</span><span className="font-bold text-gray-600">{item.opening}</span></div>
                                      <div className="bg-emerald-50 rounded py-1"><span className="text-emerald-400 text-[10px] mr-1">IN</span><span className="font-bold text-emerald-700">+{item.totalIn}</span></div>
                                      <div className="bg-sky-50 rounded py-1"><span className="text-sky-400 text-[10px] mr-1">OUT</span><span className="font-bold text-sky-700">-{item.totalOut}</span></div>
                                    </div>
                                  </div>
                                );
                              })}
                              {/* Mobile Sub-total Block */}
                              <div className="bg-gray-800 text-white rounded-xl p-3 mt-2 flex justify-between items-center">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{displayName} TOTAL</p>
                                  <p className="text-lg font-black">{subTotals.current} bags</p>
                                </div>
                                <div className="text-right text-[10px] font-bold space-y-0.5">
                                  <p className="text-emerald-400">IN: +{subTotals.in}</p>
                                  <p className="text-sky-400">OUT: -{subTotals.out}</p>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(groupedInventory).length === 0 && (
          <div className="text-center py-12 text-gray-400 font-bold bg-white rounded-2xl ring-1 ring-gray-200">
            No items in inventory
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MODULE: MATERIAL LOGGER
// ==========================================

const MaterialLogger = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const [tx, setTx] = useState<TransactionState>({ type: null, process: null, brand: null, grade: null, quantity: '', partyName: '' });

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [expandedSubCats, setExpandedSubCats] = useState<Record<string, boolean>>({});

  const fetchRecentLogs = () => {
    fetch(`${BASE_URL}/api/transactions`)
      .then(r => r.json())
      .then(data => { if (data.success) setRecentLogs(data.data); })
      .catch(console.error);
  };

  useEffect(() => {
    fetch(`${BASE_URL}/api/inventory`)
      .then(r => r.json())
      .then(data => { if (data.success) setInventory(data.data); })
      .catch(console.error);
    
    fetchRecentLogs();
  }, []);

  const groupedInventory = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {};
    inventory.forEach(item => {
      const processName = (item.process || 'OTHER').trim().toUpperCase();
      const mainCategory = processName.split('-')[0].trim();
      const subCategory = processName;

      if (!groups[mainCategory]) groups[mainCategory] = {};
      if (!groups[mainCategory][subCategory]) groups[mainCategory][subCategory] = [];

      groups[mainCategory][subCategory].push(item);
    });
    return groups;
  }, [inventory]);

  const toggleCategory = (cat: string) => setExpandedCats(p => ({ ...p, [cat]: !p[cat] }));
  const toggleSubCategory = (sub: string) => setExpandedSubCats(p => ({ ...p, [sub]: !p[sub] }));

  const handleSelectMaterial = (item: any) => {
    setTx(prev => ({ ...prev, process: item.process, brand: item.brand, grade: item.grade }));
    setStep(3);
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/inventory`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tx),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep(1);
        setTx({ type: null, process: null, brand: null, grade: null, quantity: '', partyName: '' });
        setExpandedCats({});
        setExpandedSubCats({});
        fetchRecentLogs();
      } else alert(`❌ Failed: ${data.error}`);
    } catch { alert('❌ Network error.'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteLog = async (rowNumber: number) => {
    if (!window.confirm("Are you sure you want to delete this log? It will be removed from Google Sheets.")) return;
    
    setIsDeleting(rowNumber);
    try {
      const res = await fetch(`${BASE_URL}/api/transactions/${rowNumber}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchRecentLogs();
      } else alert(`❌ Failed: ${data.error}`);
    } catch { alert('❌ Network error.'); }
    finally { setIsDeleting(null); }
  };

  const stepLabels = ['Type', 'Select Material', 'Quantity'];
  const isIn = tx.type === 'IN';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* ================================== */}
      {/* 1. THE LOGGER COMPONENT            */}
      {/* ================================== */}
      <div>
        <div className="flex items-center gap-1.5 mb-6">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-1.5 rounded-full mb-1 transition-colors ${step > i ? (isIn ? 'bg-emerald-500' : 'bg-indigo-500') : 'bg-gray-200'}`} />
              <p className={`text-xs font-bold hidden sm:block ${step > i ? 'text-gray-600' : 'text-gray-300'}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4 sm:p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-4 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 text-center">Select transaction type</p>
              <button onClick={() => { setTx({ ...tx, type: 'IN' }); setStep(2); }}
                className="w-full py-8 text-2xl font-black bg-emerald-600 text-white rounded-2xl active:bg-emerald-800 shadow-sm transition-transform active:scale-95">
                ↓ IN — Receive Material
              </button>
              <button onClick={() => { setTx({ ...tx, type: 'OUT' }); setStep(2); }}
                className="w-full py-8 text-2xl font-black bg-indigo-600 text-white rounded-2xl active:bg-indigo-800 shadow-sm transition-transform active:scale-95">
                ↑ OUT — Issue to Machine
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">Select Material to Log</p>
              {Object.entries(groupedInventory).map(([mainCat, subCats]) => {
                const isMainOpen = expandedCats[mainCat];
                return (
                  <div key={mainCat} className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden shadow-sm">
                    <button onClick={() => toggleCategory(mainCat)} className={`w-full flex items-center justify-between p-4 transition-colors ${isMainOpen ? 'bg-gray-50 border-b border-gray-200' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-white ${isIn ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                          {mainCat.substring(0, 3)}
                        </div>
                        <h3 className="text-xl font-black text-gray-900">{mainCat}</h3>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${isMainOpen ? 'rotate-180 bg-gray-200' : 'bg-gray-100'}`}>
                        <span className="text-gray-500 font-bold text-xs">▼</span>
                      </div>
                    </button>

                    {isMainOpen && (
                      <div className="bg-gray-50 p-2 space-y-2">
                        {Object.entries(subCats).map(([subCat, items]) => {
                          const isSubOpen = expandedSubCats[subCat];
                          const displayName = subCat.startsWith(`${mainCat}-`) ? subCat.replace(`${mainCat}-`, '') : subCat;
                          return (
                            <div key={subCat} className="bg-white rounded-lg ring-1 ring-gray-200 overflow-hidden">
                              <button onClick={() => toggleSubCategory(subCat)} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                                <h4 className="text-base font-black text-gray-800">{displayName}</h4>
                                <span className={`text-gray-400 font-bold text-xs transition-transform ${isSubOpen ? 'rotate-180' : ''}`}>▼</span>
                              </button>
                              {isSubOpen && (
                                <div className="bg-gray-50/50 border-t border-gray-100 flex flex-col">
                                  {items.map((item, i) => (
                                    <button key={i} onClick={() => handleSelectMaterial(item)} className="w-full text-left p-3 hover:bg-indigo-50 active:bg-indigo-100 transition-colors flex justify-between items-center border-b border-gray-100 last:border-0 group">
                                      <div>
                                        <span className="font-black text-gray-900 group-hover:text-indigo-700 block sm:inline">{item.grade}</span>
                                        <span className="text-xs text-gray-500 font-bold sm:ml-2">{item.brand}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-gray-400">Stock: {item.currentStock}</span>
                                        <span className={`text-xs font-black text-white px-3 py-1.5 rounded-lg shadow-sm ${isIn ? 'bg-emerald-500' : 'bg-indigo-500'}`}>Select ➔</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <FactoryQuantityPad
              transactionType={tx.type}
              selectedItem={`${tx.grade} (${tx.brand})`}
              quantity={tx.quantity}
              setQuantity={(val: any) => setTx({ ...tx, quantity: val })}
              partyName={tx.partyName}
              setPartyName={(val: string) => setTx({ ...tx, partyName: val })}
              onSubmit={handleSubmit}
              onCancel={() => setStep(2)}
              isLoading={isLoading}
            />
          )}

          {step === 2 && (
            <button onClick={() => setStep(1)} className="mt-6 w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to Type Selection
            </button>
          )}
        </div>
      </div>

      {/* ================================== */}
      {/* 2. RECENT TRANSACTIONS VIEW        */}
      {/* ================================== */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-black text-gray-900 mb-4">Recent Activity</h3>
        
        {recentLogs.length === 0 ? (
          <div className="text-center py-6 text-gray-400 font-bold bg-white rounded-xl ring-1 ring-gray-200 text-sm">
            No recent transactions found.
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => {
              const isLogReceiving = log.type === 'IN';
              // Safely handle both "person" (old backend) and "party" (new backend) fields
              const partyLabel = log.party || log.person || 'Unknown Party'; 
              
              return (
                <div key={log.rowNumber} className="bg-white rounded-xl ring-1 ring-gray-200 p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${isLogReceiving ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {isLogReceiving ? '↓ IN' : '↑ OUT'}
                    </div>
                    {/* Details */}
                    <div>
                      <p className="font-black text-gray-900 text-sm sm:text-base">
                        {log.quantity} bags <span className="text-gray-400 font-medium ml-1">of {log.grade}</span>
                      </p>
                      <div className="text-xs text-gray-500 font-bold flex flex-wrap gap-x-2 mt-0.5">
                        <span>{log.process}</span>
                        <span>•</span>
                        <span className="text-gray-800 uppercase">{partyLabel}</span>
                        <span>•</span>
                        <span className="font-medium">{log.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteLog(log.rowNumber)}
                    disabled={isDeleting === log.rowNumber}
                    className="p-2 sm:p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                    title="Delete Entry"
                  >
                    {isDeleting === log.rowNumber ? '...' : '🗑️'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

// ==========================================
// MODULE: DISPATCH / SALES
// ==========================================
const SalesGenerator = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [items, setItems] = useState([{ process: '', brand: '', grade: '', quantity: 1, isCustom: false }]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/inventory`)
      .then(r => r.json())
      .then(data => { if (data.success) setInventory(data.data); })
      .catch(console.error);
  }, []);

  const availableProcesses = [...new Set(inventory.map(c => c.process).filter(Boolean))];
  const getBrandsForProcess = (p: string) => [...new Set(inventory.filter(c => c.process === p).map(c => c.brand).filter(Boolean))];
  const getGradesForBrand = (p: string, b: string) => inventory.filter(c => c.process === p && c.brand === b).map(c => c.grade).filter(Boolean);

  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
    const newItems = [...items] as any;
    newItems[index][field] = value;
    if (!newItems[index].isCustom) {
      if (field === 'process') { newItems[index].brand = ''; newItems[index].grade = ''; }
      if (field === 'brand') { newItems[index].grade = ''; }
    }
    if (field === 'isCustom') { newItems[index].process = ''; newItems[index].brand = ''; newItems[index].grade = ''; }
    setItems(newItems);
  };

  const handleGenerate = async () => {
    if (!customerInfo.name || !customerInfo.phone || !items[0].grade) return alert("Fill customer details and at least 1 item.");
    setIsProcessing(true);
    try {
      const res = await fetch(`${BASE_URL}/api/create-order`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name,
          phone: customerInfo.phone,
          date: new Date().toLocaleDateString('en-GB'),
          items: items.map(i => ({
            particular: `${i.process} - ${i.grade} (${i.brand})`,
            rawProcess: i.process, rawBrand: i.brand, rawGrade: i.grade,
            isNew: i.isCustom,
            quantity: Number(i.quantity),
            weight: Number(i.quantity) * 25,
            price: 0
          })),
          packing: 0, freight: 0, advance: 0, previousBalance: 0
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Dispatch summary generated & sent via WhatsApp!");
        setCustomerInfo({ name: '', phone: '' });
        setItems([{ process: '', brand: '', grade: '', quantity: 1, isCustom: false }]);
      } else alert(`❌ Failed: ${data.error}`);
    } catch { alert("Network error"); }
    finally { setIsProcessing(false); }
  };

  const totalBags = items.reduce((s, i) => s + Number(i.quantity), 0);
  const totalWeight = totalBags * 25;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Customer info */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Customer Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Customer Name</label>
            <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full px-4 py-3 ring-1 ring-gray-200 rounded-xl text-sm font-bold uppercase bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="MANOHAR JI" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">WhatsApp Number</label>
            <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full px-4 py-3 ring-1 ring-gray-200 rounded-xl text-sm font-bold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="9876543210" />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Materials</p>
        <div className="space-y-4">
          {items.map((item, index) => {
            const availableB = getBrandsForProcess(item.process);
            const availableG = getGradesForBrand(item.process, item.brand);
            const weight = item.quantity ? item.quantity * 25 : 0;

            return (
              <div key={index} className="bg-gray-50 rounded-xl p-4 ring-1 ring-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-gray-500">Item {index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleItemChange(index, 'isCustom', !item.isCustom)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ring-1 transition-colors ${item.isCustom ? 'bg-orange-100 text-orange-700 ring-orange-300' : 'bg-white text-gray-500 ring-gray-200 hover:bg-gray-100'}`}>
                      {item.isCustom ? '← From list' : '+ Custom'}
                    </button>
                    {items.length > 1 && (
                      <button onClick={() => setItems(items.filter((_, i) => i !== index))}
                        className="text-xs font-bold px-2 py-1.5 rounded-full ring-1 bg-white text-red-500 ring-red-200">
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Process</label>
                    {item.isCustom
                      ? <input type="text" placeholder="Type process…" value={item.process} onChange={e => handleItemChange(index, 'process', e.target.value)}
                          className="w-full px-3 py-2.5 ring-2 ring-orange-300 rounded-lg text-sm font-bold bg-white uppercase focus:outline-none" />
                      : <select value={item.process} onChange={e => handleItemChange(index, 'process', e.target.value)}
                          className="w-full px-3 py-2.5 ring-1 ring-gray-200 rounded-lg text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                          <option value="">Select…</option>
                          {availableProcesses.map(p => <option key={p as string} value={p as string}>{p as string}</option>)}
                        </select>
                    }
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Brand</label>
                    {item.isCustom
                      ? <input type="text" placeholder="Type brand…" value={item.brand} onChange={e => handleItemChange(index, 'brand', e.target.value)}
                          className="w-full px-3 py-2.5 ring-2 ring-orange-300 rounded-lg text-sm font-bold bg-white uppercase focus:outline-none" />
                      : <select value={item.brand} onChange={e => handleItemChange(index, 'brand', e.target.value)} disabled={!item.process}
                          className="w-full px-3 py-2.5 ring-1 ring-gray-200 rounded-lg text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40">
                          <option value="">Select…</option>
                          {availableB.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
                        </select>
                    }
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Grade</label>
                    {item.isCustom
                      ? <input type="text" placeholder="Type grade…" value={item.grade} onChange={e => handleItemChange(index, 'grade', e.target.value)}
                          className="w-full px-3 py-2.5 ring-2 ring-orange-300 rounded-lg text-sm font-bold bg-white uppercase focus:outline-none" />
                      : <select value={item.grade} onChange={e => handleItemChange(index, 'grade', e.target.value)} disabled={!item.brand}
                          className="w-full px-3 py-2.5 ring-1 ring-gray-200 rounded-lg text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40">
                          <option value="">Select…</option>
                          {availableG.map(g => {
                            const invMatch = inventory.find(i => i.process === item.process && i.brand === item.brand && i.grade === g);
                            const stockLeft = invMatch ? invMatch.currentStock : 0;
                            return (
                              <option key={g as string} value={g as string}>
                                {g as string} ({stockLeft} Bags Left)
                              </option>
                            );
                          })}
                        </select>
                    }
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Bags</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} min="1"
                        className="w-full px-3 py-2.5 ring-1 ring-gray-200 rounded-lg text-sm font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      <span className="text-xs text-gray-500 font-bold whitespace-nowrap">{weight} kg</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setItems([...items, { process: '', brand: '', grade: '', quantity: 1, isCustom: false }])}
          className="mt-3 w-full py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors ring-1 ring-indigo-100">
          + Add Another Material
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gray-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total</p>
          <p className="text-2xl font-black">{totalBags} bags · {totalWeight} kg</p>
        </div>
        <button onClick={handleGenerate} disabled={isProcessing}
          className={`px-6 py-4 rounded-xl font-black text-sm transition-colors ${isProcessing ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 active:bg-gray-200'}`}>
          {isProcessing ? 'Sending…' : 'Confirm & WhatsApp'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MODULE: ORDER TRACKING
// ==========================================
const OrderTracker = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [partialOrder, setPartialOrder] = useState<any>(null);
  const [partialQty, setPartialQty] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/create-order/list`);
      const result = await res.json();
      if (result.success) setOrders(result.data.reverse());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    try {
      const res = await fetch(`${BASE_URL}/api/create-order/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const result = await res.json();
      if (!result.success) { alert("Failed to update status."); fetchOrders(); }
    } catch { fetchOrders(); }
    finally { setIsUpdating(false); setPartialOrder(null); setPartialQty(''); }
  };

  const handlePartialSubmit = () => {
    if (!partialQty) return;
    handleUpdateStatus(partialOrder.orderId, `Partially Completed (${partialQty} Dispatched)`);
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium">Loading orders…</p>
    </div>
  );

  const pendingOrders = orders.filter(o => o.status !== 'Fulfilled');
  const fulfilledOrders = orders.filter(o => o.status === 'Fulfilled');

  const OrderCard = ({ order }: { order: any }) => {
    const isPartial = order.status?.includes('Partial');
    return (
      <div className={`bg-white rounded-2xl ring-1 ${isPartial ? 'ring-orange-200' : 'ring-gray-200'} p-4 mb-3`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-bold text-gray-400 tracking-widest">{order.orderId}</p>
            <p className="font-black text-gray-900">{order.customerName}</p>
            <p className="text-sm text-gray-500">{order.phone}</p>
          </div>
          <div className="text-right">
            {isPartial && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full block mb-1">PARTIAL</span>}
            <p className="font-black text-gray-900">₹{order.totalAmount}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 font-medium mb-3 ring-1 ring-gray-100">
          {order.itemsSummary}
        </div>
        {isPartial && (
          <div className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-2 rounded-lg mb-3 ring-1 ring-orange-100">
            {order.status}
          </div>
        )}
        <div className="flex gap-2">
          {order.status !== 'Fulfilled' ? (
            <>
              <button disabled={isUpdating} onClick={() => handleUpdateStatus(order.orderId, 'Fulfilled')}
                className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm active:bg-emerald-800 transition-colors">
                ✓ Fulfilled
              </button>
              <button disabled={isUpdating} onClick={() => setPartialOrder(order)}
                className="flex-1 bg-orange-50 text-orange-700 ring-1 ring-orange-200 font-bold py-2.5 rounded-xl text-sm active:bg-orange-100">
                Partial
              </button>
            </>
          ) : (
            <button disabled={isUpdating} onClick={() => handleUpdateStatus(order.orderId, 'Pending')}
              className="px-4 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors">
              Undo
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-black text-gray-900">Orders</h2>
        <button onClick={fetchOrders} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl ring-1 ring-indigo-100 hover:bg-indigo-100">
          ↻ Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-black text-orange-700 text-sm uppercase tracking-wide">Pending</h3>
            <span className="bg-orange-100 text-orange-700 font-black text-xs px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
          </div>
          {pendingOrders.length === 0
            ? <div className="text-center py-12 text-orange-300 text-sm font-bold bg-orange-50 rounded-2xl ring-1 ring-orange-100">No pending orders</div>
            : pendingOrders.map(o => <OrderCard key={o.orderId} order={o} />)}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-black text-emerald-700 text-sm uppercase tracking-wide">Fulfilled</h3>
            <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-2 py-0.5 rounded-full">{fulfilledOrders.length}</span>
          </div>
          {fulfilledOrders.length === 0
            ? <div className="text-center py-12 text-emerald-300 text-sm font-bold bg-emerald-50 rounded-2xl ring-1 ring-emerald-100">No fulfilled orders yet</div>
            : fulfilledOrders.map(o => <OrderCard key={o.orderId} order={o} />)}
        </div>
      </div>

      {/* Partial Modal */}
      {partialOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-orange-500">
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-900 mb-1">Partial dispatch</h3>
              <p className="text-sm text-gray-500 mb-5">Enter how much was sent from the office.</p>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 ring-1 ring-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Order</p>
                <p className="font-bold text-gray-800 text-sm">{partialOrder.itemsSummary}</p>
              </div>
              <input type="text" value={partialQty} onChange={e => setPartialQty(e.target.value)}
                placeholder="e.g. 20 bags"
                className="w-full px-4 py-4 ring-2 ring-gray-200 rounded-xl focus:ring-orange-400 focus:outline-none font-bold text-lg mb-5"
                autoFocus />
              <div className="flex gap-3">
                <button onClick={() => setPartialOrder(null)} className="flex-1 py-3.5 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                <button onClick={handlePartialSubmit} disabled={!partialQty}
                  className="flex-1 py-3.5 font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-40 shadow-sm">
                  Update Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MODULE: CUSTOMER CRM (PLACEHOLDER)
// ==========================================
const CustomerCRM = () => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <div className="text-5xl mb-4">👥</div>
    <p className="text-lg font-black text-gray-700 mb-1">Customer CRM</p>
    <p className="text-sm font-medium">Coming soon</p>
  </div>
);

// ==========================================
// MAIN APP
// ==========================================
export default function App() {
  const [activeModule, setActiveModule] = useState<'INVENTORY' | 'LOG' | 'SALE' | 'ORDERS' | 'CUSTOMERS'>('INVENTORY');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'INVENTORY', label: 'Inventory', icon: '📊' },
    { id: 'LOG', label: 'Log Material', icon: '🏭' },
    { id: 'SALE', label: 'Dispatch', icon: '🧾' },
    { id: 'ORDERS', label: 'Orders', icon: '🚚' },
    { id: 'CUSTOMERS', label: 'Customers', icon: '👥' },
  ];

  const activeItem = menuItems.find(m => m.id === activeModule);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:flex w-60 bg-gray-950 text-white flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-gray-800">
          <h1 className="text-lg font-black tracking-tight">
            <span className="text-indigo-400">FACTORY</span>OS
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium tracking-widest uppercase">Management System</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveModule(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-sm transition-colors ${activeModule === item.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 font-medium">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Mobile Header ── */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 z-30">
          <h1 className="text-base font-black">
            <span className="text-indigo-500">FACTORY</span>OS
          </h1>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </header>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[57px] left-0 right-0 bg-gray-950 z-40 py-2 px-3 shadow-2xl">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => { setActiveModule(item.id as any); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-bold text-sm mb-1 transition-colors ${activeModule === item.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Desktop Page Header ── */}
        <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center px-6 justify-between flex-shrink-0">
          <h2 className="text-lg font-black text-gray-900">{activeItem?.icon} {activeItem?.label}</h2>
          <p className="text-xs font-bold text-gray-400">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-24 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {activeModule === 'INVENTORY' && <InventoryDashboard />}
            {activeModule === 'LOG' && <MaterialLogger />}
            {activeModule === 'SALE' && <SalesGenerator />}
            {activeModule === 'ORDERS' && <OrderTracker />}
            {activeModule === 'CUSTOMERS' && <CustomerCRM />}
          </div>
        </main>

        {/* ── Mobile Bottom Nav ── */}
        {/* ── Mobile Bottom Nav ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setActiveModule(item.id as any); setMobileMenuOpen(false); }}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${activeModule === item.id ? 'text-indigo-600' : 'text-gray-400'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] font-bold ${activeModule === item.id ? 'text-indigo-600' : 'text-gray-400'}`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}