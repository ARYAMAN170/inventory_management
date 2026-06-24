import { useState, useMemo, useEffect } from 'react';

// ==========================================
// 1. SHARED TYPES & DATA
// ==========================================
interface CatalogItem {
  id: string; process: string; brand: string; grade: string;
}

interface TransactionState {
  type: 'IN' | 'OUT' | null;
  process: string | null; brand: string | null; grade: string | null; quantity: string;
}

const mockCatalog: CatalogItem[] = [
  { id: 'HM012T_MRPL', process: 'PP-MOULDING', brand: 'MRPL', grade: 'HM012T' },
  { id: 'M12RR_HMEL', process: 'PP-MOULDING', brand: 'HMEL', grade: 'M12RR' },
  { id: 'MH13_OPAL', process: 'PP-MOULDING', brand: 'OPAL', grade: 'MH-13' },
  { id: 'F10SR_HMEL', process: 'PP-FILM', brand: 'HMEL', grade: 'F10SR' },
  { id: 'V35GRI_HMEL', process: 'PP-RAFFIA', brand: 'HMEL', grade: 'V35GRI' },
  { id: 'H050MN_RIL', process: 'PP-THERMOFOAMING', brand: 'RIL', grade: 'H050MN' },
  { id: 'F18S010_GAIL', process: 'LLDPE-FILM', brand: 'GAIL', grade: 'F18S010' },
  { id: 'B63003A_GAIL', process: 'HDPE-HDBLOW', brand: 'GAIL', grade: 'B63003A' },
  { id: 'CALCIUM_PCC', process: 'PVC', brand: 'PCC', grade: 'CALCIUM' },
  { id: 'MB_SOLTEX', process: 'MASTER BATCH', brand: 'SOLTEX', grade: 'MASTER BATCH' },
];

// ==========================================
// 2. SHARED UI COMPONENTS
// ==========================================
const FactoryQuantityPad = ({ transactionType, selectedItem, quantity, setQuantity, onSubmit, onCancel, isLoading }: any) => {
  const handlePadClick = (num: string) => {
    if (quantity === '' && num === '0') return; 
    if (quantity.length >= 4) return; 
    setQuantity(quantity + num);
  };
  const isReceiving = transactionType === 'IN';

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-200 mt-6">
      <div className="text-center mb-6">
        <h2 className="text-lg text-gray-500 font-bold uppercase mb-2">
          {isReceiving ? 'Receiving Material:' : 'Issuing Material:'}
        </h2>
        <div className={`text-2xl font-extrabold py-3 px-6 rounded-xl inline-block border-2 ${isReceiving ? 'text-green-900 bg-green-50 border-green-200' : 'text-blue-900 bg-blue-50 border-blue-200'}`}>
          {selectedItem}
        </div>
      </div>
      <div className="bg-gray-50 border-4 border-gray-300 rounded-xl h-24 mb-6 flex items-center justify-end px-6">
        <span className="text-6xl font-mono text-gray-800">{quantity || '0'}</span>
        <span className="text-2xl text-gray-400 ml-3">Bags</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handlePadClick(num.toString())} className="h-20 text-4xl font-bold bg-white border-2 border-gray-200 rounded-xl active:bg-gray-100">{num}</button>
        ))}
        <button onClick={() => setQuantity(quantity.slice(0, -1))} className="h-20 text-2xl font-bold bg-red-50 text-red-700 border-2 border-red-200 rounded-xl active:bg-red-100">DEL</button>
        <button onClick={() => handlePadClick('0')} className="h-20 text-4xl font-bold bg-white border-2 border-gray-200 rounded-xl active:bg-gray-100">0</button>
        <button onClick={() => setQuantity('')} className="h-20 text-xl font-bold bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl active:bg-gray-200">CLR</button>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-gray-100">
        <button onClick={onCancel} className="p-6 text-xl font-bold text-gray-700 bg-white border-4 border-gray-300 rounded-xl active:bg-gray-100">BACK</button>
        <button onClick={onSubmit} disabled={!quantity || isLoading} className={`p-6 text-xl font-bold text-white rounded-xl transition-colors ${isLoading || !quantity ? 'bg-gray-400 border-4 border-gray-500 cursor-not-allowed' : isReceiving ? 'bg-green-600 border-4 border-green-700 active:bg-green-800' : 'bg-blue-600 border-4 border-blue-700 active:bg-blue-800'}`}>
          {isLoading ? 'SAVING...' : 'CONFIRM LOG'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. MODULE: INVENTORY DASHBOARD
// ==========================================
const InventoryDashboard = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/inventory');
        const result = await response.json();
        if (result.success) setInventory(result.data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  if (isLoading) return <div className="text-center p-10 text-2xl font-bold text-gray-500">Loading Live Inventory Database...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-900 font-bold uppercase text-xs">
            <tr>
              <th className="p-4">Process</th><th className="p-4">Brand</th><th className="p-4">Grade</th>
              <th className="p-4 text-center">Opening</th><th className="p-4 text-center text-green-700">IN</th>
              <th className="p-4 text-center text-blue-700">OUT</th><th className="p-4 text-center bg-gray-200 text-black text-base">CURRENT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium">{item.process}</td><td className="p-4">{item.brand}</td>
                <td className="p-4 font-bold">{item.grade}</td><td className="p-4 text-center text-gray-500">{item.opening}</td>
                <td className="p-4 text-center font-bold text-green-600">{item.totalIn}</td>
                <td className="p-4 text-center font-bold text-blue-600">{item.totalOut}</td>
                <td className="p-4 text-center font-extrabold text-xl bg-gray-50 border-l border-gray-200">{item.current}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 4. MODULE: MATERIAL LOGGER
// ==========================================
// ==========================================
// 4. MODULE: MATERIAL LOGGER (LIVE DATA)
// ==========================================
const MaterialLogger = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tx, setTx] = useState<TransactionState>({ type: null, process: null, brand: null, grade: null, quantity: '' });

  // Fetch Live Inventory Data
  useEffect(() => {
    fetch('http://localhost:5000/api/inventory')
      .then(res => res.json())
      .then(data => { if (data.success) setInventory(data.data); })
      .catch(err => console.error('Failed to load inventory for logger:', err));
  }, []);

  // Cascading Dropdowns using LIVE data
  const availableProcesses = useMemo(() => [...new Set(inventory.map(c => c.process).filter(Boolean))], [inventory]);
  const availableBrands = useMemo(() => tx.process ? [...new Set(inventory.filter(c => c.process === tx.process).map(c => c.brand).filter(Boolean))] : [], [tx.process, inventory]);
  const availableGrades = useMemo(() => tx.brand ? inventory.filter(c => c.process === tx.process && c.brand === tx.brand).map(c => c.grade).filter(Boolean) : [], [tx.process, tx.brand, inventory]);

  const handleSelect = (key: keyof TransactionState, value: string) => {
    setTx(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'process') { next.brand = null; next.grade = null; }
      if (key === 'brand') { next.grade = null; }
      return next;
    });
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (isLoading) return; 
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tx),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert(`✅ Logged ${tx.quantity} bags of ${tx.grade} (${tx.type})`);
        setStep(1); setTx({ type: null, process: null, brand: null, grade: null, quantity: '' });
      } else alert(`❌ Failed: ${data.error}`);
    } catch (error) {
      alert('❌ Network error.');
    } finally { setIsLoading(false); }
  };

  const ButtonGrid = ({ items, stepKey }: any) => (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {items.map((item: string) => (
        <button key={item} onClick={() => handleSelect(stepKey, item)} className="p-8 text-2xl font-bold bg-slate-700 text-white rounded-xl active:bg-slate-900 transition-colors shadow-sm">{item}</button>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4, 5].map(num => <div key={num} className={`h-2 flex-1 rounded-full ${step >= num ? (tx.type === 'IN' ? 'bg-green-600' : tx.type === 'OUT' ? 'bg-blue-600' : 'bg-slate-600') : 'bg-gray-200'}`} />)}
      </div>
      
      {step === 1 && (
        <div className="grid grid-cols-1 gap-6 mt-8">
          <button onClick={() => { setTx({...tx, type: 'IN'}); setStep(2); }} className="p-10 text-4xl font-extrabold bg-green-600 text-white rounded-xl active:bg-green-800 shadow-md">IN (Receive Material)</button>
          <button onClick={() => { setTx({...tx, type: 'OUT'}); setStep(2); }} className="p-10 text-4xl font-extrabold bg-blue-600 text-white rounded-xl active:bg-blue-800 shadow-md">OUT (Issue to Machine)</button>
        </div>
      )}
      {step === 2 && <ButtonGrid items={availableProcesses} stepKey="process" />}
      {step === 3 && <ButtonGrid items={availableBrands} stepKey="brand" />}
      {step === 4 && <ButtonGrid items={availableGrades} stepKey="grade" />}
      {step === 5 && <FactoryQuantityPad transactionType={tx.type} selectedItem={`${tx.grade} (${tx.brand})`} quantity={tx.quantity} setQuantity={(val:any) => setTx({ ...tx, quantity: val })} onSubmit={handleSubmit} onCancel={() => setStep(4)} isLoading={isLoading} />}
    </div>
  );
};

// ==========================================
// 5. MODULE: SALES & INVOICE GENERATOR
// ==========================================
// ==========================================
// 5. MODULE: DISPATCH SUMMARY (LIVE DATA)
// ==========================================
// ==========================================
// 5. MODULE: DISPATCH SUMMARY (LIVE DATA + CUSTOM ITEMS)
// ==========================================
const SalesGenerator = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  // Notice we added isCustom: false to the default state
  const [items, setItems] = useState([{ process: '', brand: '', grade: '', quantity: 1, isCustom: false }]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/inventory')
      .then(res => res.json())
      .then(data => { if (data.success) setInventory(data.data); })
      .catch(err => console.error('Failed to load inventory for sales:', err));
  }, []);

  const availableProcesses = [...new Set(inventory.map(c => c.process).filter(Boolean))];
  const getBrandsForProcess = (process: string) => [...new Set(inventory.filter(c => c.process === process).map(c => c.brand).filter(Boolean))];
  const getGradesForBrand = (process: string, brand: string) => inventory.filter(c => c.process === process && c.brand === brand).map(c => c.grade).filter(Boolean);

  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
    const newItems = [...items] as any;
    newItems[index][field] = value;
    
    // Auto-clear downstream fields if using dropdowns
    if (!newItems[index].isCustom) {
      if (field === 'process') { newItems[index].brand = ''; newItems[index].grade = ''; }
      if (field === 'brand') { newItems[index].grade = ''; }
    }
    
    // If they switch modes, clear the inputs so they don't get confused
    if (field === 'isCustom') {
      newItems[index].process = ''; newItems[index].brand = ''; newItems[index].grade = '';
    }
    
    setItems(newItems);
  };

  const handleGenerate = async () => {
    if (!customerInfo.name || !customerInfo.phone || !items[0].grade) return alert("Fill customer details and complete at least 1 item.");
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.name, 
          phone: customerInfo.phone, 
          date: new Date().toLocaleDateString('en-GB'),
          items: items.map(i => ({ 
            particular: `${i.process} - ${i.grade} (${i.brand})`, 
            rawProcess: i.process,   // Send raw data for Google Sheets
            rawBrand: i.brand,       // Send raw data for Google Sheets
            rawGrade: i.grade,       // Send raw data for Google Sheets
            isNew: i.isCustom,       // Tell backend to auto-add to DB
            quantity: Number(i.quantity), 
            weight: Number(i.quantity) * 25, 
            price: 0 
          })),
          packing: 0, freight: 0, advance: 0, previousBalance: 0
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert("✅ Dispatch Summary generated & sent via WhatsApp!");
        setCustomerInfo({ name: '', phone: '' }); 
        setItems([{ process: '', brand: '', grade: '', quantity: 1, isCustom: false }]);
      } else alert(`❌ Failed: ${data.error}`);
    } catch (error) { alert("Network Error"); } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-3xl font-black text-gray-800">Dispatch Order Form</h2>
        <p className="text-gray-500 font-bold mt-1 text-sm">Select inventory or type a custom material to generate dispatch summary.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div><label className="block font-bold text-gray-700 mb-2">Customer Name</label><input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-lg uppercase" placeholder="MANOHAR JI" /></div>
        <div><label className="block font-bold text-gray-700 mb-2">WhatsApp Number</label><input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-lg" placeholder="9876543210" /></div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-12 gap-2 font-bold text-sm text-gray-600 mb-2 px-2 uppercase tracking-wider">
          <div className="col-span-3">Process</div>
          <div className="col-span-3">Brand</div>
          <div className="col-span-3">Grade</div>
          <div className="col-span-2 text-center">Bags</div>
          <div className="col-span-1 text-right">Weight</div>
        </div>

        {items.map((item, index) => {
          const availableB = getBrandsForProcess(item.process);
          const availableG = getGradesForBrand(item.process, item.brand);
          const weight = item.quantity ? item.quantity * 25 : 0;

          return (
            <div key={index} className="mb-4 bg-gray-50 p-3 rounded-lg border">
              {/* TOGGLE CUSTOM ITEM BUTTON */}
              <div className="flex justify-end mb-2">
                <button onClick={() => handleItemChange(index, 'isCustom', !item.isCustom)} className={`text-xs font-bold px-3 py-1 rounded-full border ${item.isCustom ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'}`}>
                  {item.isCustom ? '← Cancel Custom Material' : '+ Type Custom Material'}
                </button>
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  {item.isCustom ? (
                    <input type="text" placeholder="Type Process..." value={item.process} onChange={e => handleItemChange(index, 'process', e.target.value)} className="w-full p-3 border-2 border-orange-300 rounded font-bold text-sm bg-white uppercase" />
                  ) : (
                    <select value={item.process} onChange={e => handleItemChange(index, 'process', e.target.value)} className="w-full p-3 border border-gray-300 rounded font-bold text-sm bg-white">
                      <option value="">Select Process...</option>
                      {availableProcesses.map(p => <option key={p as string} value={p as string}>{p as string}</option>)}
                    </select>
                  )}
                </div>
                
                <div className="col-span-3">
                  {item.isCustom ? (
                    <input type="text" placeholder="Type Brand..." value={item.brand} onChange={e => handleItemChange(index, 'brand', e.target.value)} className="w-full p-3 border-2 border-orange-300 rounded font-bold text-sm bg-white uppercase" />
                  ) : (
                    <select value={item.brand} onChange={e => handleItemChange(index, 'brand', e.target.value)} disabled={!item.process} className="w-full p-3 border border-gray-300 rounded font-bold text-sm bg-white disabled:bg-gray-100">
                      <option value="">Select Brand...</option>
                      {availableB.map(b => <option key={b as string} value={b as string}>{b as string}</option>)}
                    </select>
                  )}
                </div>

                <div className="col-span-3">
                  {item.isCustom ? (
                    <input type="text" placeholder="Type Grade..." value={item.grade} onChange={e => handleItemChange(index, 'grade', e.target.value)} className="w-full p-3 border-2 border-orange-300 rounded font-bold text-sm bg-white uppercase" />
                  ) : (
                    <select value={item.grade} onChange={e => handleItemChange(index, 'grade', e.target.value)} disabled={!item.brand} className="w-full p-3 border border-gray-300 rounded font-bold text-sm bg-white disabled:bg-gray-100">
                      <option value="">Select Grade...</option>
                      {availableG.map(g => <option key={g as string} value={g as string}>{g as string}</option>)}
                    </select>
                  )}
                </div>

                <div className="col-span-2">
                  <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} min="1" className="w-full p-3 border border-gray-300 rounded font-bold text-center" />
                </div>
                
                <div className="col-span-1 text-right font-black text-gray-800 pr-2">
                  {weight} Kg
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={() => setItems([...items, { process: '', brand: '', grade: '', quantity: 1, isCustom: false }])} className="text-blue-600 font-bold text-sm hover:underline p-2">+ Add Another Material</button>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-1/3 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center text-sm mb-2 text-gray-600 font-bold">
            <span>Total Bags Owed:</span>
            <span className="text-xl text-gray-800">{items.reduce((sum, item) => sum + Number(item.quantity), 0)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-gray-600">
            <span>Total Gross Weight:</span>
            <span className="text-xl text-gray-800">{items.reduce((sum, item) => sum + (Number(item.quantity) * 25), 0)} Kg</span>
          </div>
        </div>
      </div>

      <button onClick={handleGenerate} disabled={isProcessing} className={`w-full py-5 rounded-xl font-black text-white text-xl shadow-lg ${isProcessing ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'}`}>
        {isProcessing ? 'PROCESSING & SENDING...' : 'CONFIRM DISPATCH & SEND WHATSAPP'}
      </button>
    </div>
  );
};
const OrderTracker = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State for the Partial Dispatch Modal
  const [partialOrder, setPartialOrder] = useState<any>(null);
  const [partialQty, setPartialQty] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/create-order/list');
      const result = await response.json();
      if (result.success) setOrders(result.data.reverse());
    } catch (error) {
      console.error('Network Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    // Optimistic UI update
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));

    try {
      const response = await fetch('http://localhost:5000/api/create-order/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const result = await response.json();
      if (!result.success) {
        alert("Failed to update status in Google Sheets.");
        fetchOrders();
      }
    } catch (error) {
      console.error("Network error:", error);
      fetchOrders();
    } finally {
      setIsUpdating(false);
      setPartialOrder(null);
      setPartialQty('');
    }
  };

  const handlePartialSubmit = () => {
    if (!partialQty) return;
    const newStatus = `Partially Completed (${partialQty} Dispatched)`;
    handleUpdateStatus(partialOrder.orderId, newStatus);
  };

  if (isLoading) return <div className="text-center p-10 text-2xl font-bold text-gray-500">Loading Order Database...</div>;

  const pendingOrders = orders.filter(o => o.status !== 'Fulfilled');
  const fulfilledOrders = orders.filter(o => o.status === 'Fulfilled');

  const OrderCard = ({ order }: { order: any }) => {
    const isPartial = order.status.includes('Partial');
    
    return (
      <div className={`bg-white border-2 ${isPartial ? 'border-orange-400 shadow-orange-50' : 'border-gray-200'} rounded-xl p-5 shadow-sm hover:shadow-md transition-all mb-4`}>
        <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
          <div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{order.orderId}</span>
            <h3 className="text-lg font-bold text-gray-800">{order.customerName}</h3>
            <p className="text-sm text-gray-500">{order.phone}</p>
          </div>
          <div className="text-right">
            {isPartial && <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded mb-1 inline-block">PARTIAL</span>}
            <p className="text-lg font-black text-gray-800">₹{order.totalAmount}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-100 text-sm font-medium text-gray-700">
          {order.itemsSummary}
        </div>

        {isPartial && (
          <div className="mb-3 text-sm font-bold text-orange-800 bg-orange-50 p-2 rounded border border-orange-100">
            Current Log: {order.status}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {order.status !== 'Fulfilled' ? (
            <>
              <button disabled={isUpdating} onClick={() => handleUpdateStatus(order.orderId, 'Fulfilled')} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm">
                Mark 100% Fulfilled
              </button>
              <button disabled={isUpdating} onClick={() => setPartialOrder(order)} className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200 font-bold py-2 rounded-lg text-sm transition-colors">
                Partial Dispatch
              </button>
            </>
          ) : (
            <button disabled={isUpdating} onClick={() => handleUpdateStatus(order.orderId, 'Pending')} className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-lg transition-colors text-sm">
              Undo
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-gray-800 border-b pb-4 w-full">Order Tracking Board</h2>
        <button onClick={fetchOrders} className="absolute right-0 top-2 text-blue-600 font-bold hover:underline bg-white py-2 px-4 rounded-lg border shadow-sm">↻ Refresh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 items-start">
        {/* PENDING COLUMN */}
        <div className="bg-orange-50/30 rounded-2xl p-4 border-2 border-orange-100 min-h-[500px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xl font-extrabold text-orange-800">Pending & Partial</h3>
            <span className="bg-orange-200 text-orange-800 font-black px-3 py-1 rounded-full text-sm">{pendingOrders.length}</span>
          </div>
          <div className="space-y-4">
            {pendingOrders.length === 0 ? <p className="text-center text-orange-400 font-bold py-10">No pending orders.</p> : pendingOrders.map(order => <OrderCard key={order.orderId} order={order} />)}
          </div>
        </div>

        {/* FULFILLED COLUMN */}
        <div className="bg-green-50/30 rounded-2xl p-4 border-2 border-green-100 min-h-[500px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xl font-extrabold text-green-800">Fulfilled Dispatch</h3>
            <span className="bg-green-200 text-green-800 font-black px-3 py-1 rounded-full text-sm">{fulfilledOrders.length}</span>
          </div>
          <div className="space-y-4">
            {fulfilledOrders.length === 0 ? <p className="text-center text-green-400 font-bold py-10">No fulfilled orders yet.</p> : fulfilledOrders.map(order => <OrderCard key={order.orderId} order={order} />)}
          </div>
        </div>
      </div>

      {/* MODAL POPUP */}
      {partialOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-xs">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-8 border-orange-500 mx-4">
            <h3 className="text-2xl font-black text-gray-800 mb-1">Log Partial Status</h3>
            <p className="text-gray-500 mb-6 text-sm font-medium">Update how much has been sent out from the office record.</p>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Order Particulars</span>
              <p className="font-bold text-gray-800 text-sm">{partialOrder.itemsSummary}</p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">Amount Handed Over (e.g. "20 Bags Sent")</label>
              <input 
                type="text" 
                value={partialQty} 
                onChange={e => setPartialQty(e.target.value)} 
                placeholder="e.g. 20 Bags"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-bold text-lg"
                autoFocus
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setPartialOrder(null)} className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handlePartialSubmit} disabled={!partialQty} className="flex-1 py-4 font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-md">Update Office Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const CustomerCRM = () => <div className="p-10 text-center text-xl font-bold text-gray-400 border-4 border-dashed rounded-xl mt-10">Customer CRM Directory Coming Soon...</div>;


// ==========================================
// 7. MAIN APP ROUTER (THE OS SHELL)
// ==========================================
export default function App() {
  const [activeModule, setActiveModule] = useState<'INVENTORY' | 'LOG' | 'SALE' | 'ORDERS' | 'CUSTOMERS'>('INVENTORY');

  const menuItems = [
    { id: 'INVENTORY', label: 'Live Inventory', icon: '📊' },
    { id: 'LOG', label: 'Log Raw Material', icon: '🏭' },
    { id: 'SALE', label: 'Sales & Invoicing', icon: '🧾' },
    { id: 'ORDERS', label: 'Order Tracking', icon: '🚚' },
    { id: 'CUSTOMERS', label: 'Customer CRM', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-gray-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black tracking-wider text-blue-400">FACTORY<span className="text-white">OS</span></h1>
          <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Management System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left font-bold transition-all ${
                activeModule === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center px-8 justify-between shadow-sm">
          <h2 className="text-2xl font-extrabold text-gray-800">{menuItems.find(m => m.id === activeModule)?.label}</h2>
          <div className="text-sm font-bold text-gray-500 bg-gray-100 py-2 px-4 rounded-lg">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            {activeModule === 'INVENTORY' && <InventoryDashboard />}
            {activeModule === 'LOG' && <MaterialLogger />}
            {activeModule === 'SALE' && <SalesGenerator />}
            {activeModule === 'ORDERS' && <OrderTracker />}
            {activeModule === 'CUSTOMERS' && <CustomerCRM />}
          </div>
        </main>
      </div>
    </div>
  );
}