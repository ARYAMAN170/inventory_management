import { doc } from '../config/googleSheets.js';

export const fetchLiveInventory = async () => {
    const sheet = doc.sheetsByTitle['Current_Inventory'];
    if (!sheet) throw new Error('Current_Inventory tab not found');

    const rows = await sheet.getRows();

    // Format the data exactly how React expects it
    return rows.map(row => ({
        process: row.get('Process'),
        brand: row.get('Brand'),
        grade: row.get('Grade'),
        opening: row.get('Opening Stock') || '0',
        totalIn: row.get('Total IN') || '0',
        totalOut: row.get('Total OUT') || '0',
        current: row.get('Current Stock') || '0'
    }));
};

export const logMaterialTransaction = async (data) => {
    // Remember to rename process to factoryProcess so we don't break Node's process object!
    const { type, process: factoryProcess, brand, grade, quantity } = data;

    const sheet = doc.sheetsByTitle['Transactions'];
    if (!sheet) throw new Error('Transactions tab not found');

    await sheet.addRow({
        Date: new Date().toLocaleDateString('en-GB'),
        Time: new Date().toLocaleTimeString(),
        Type: type,
        Process: factoryProcess,
        Brand: brand,
        Grade: grade,
        Quantity: Number(quantity),
    });
};
export const logSalesOrder = async (orderData, netTotal, invoiceNumber) => {
    const { customerName, phone, date, items } = orderData;

    const sheet = doc.sheetsByTitle['Orders'];
    if (!sheet) {
        console.warn("⚠️ Orders tab not found in Google Sheets. Skipping DB log.");
        return;
    }

    // Combine items into a readable string for the spreadsheet
    const itemsSummary = items.map(i => `${i.quantity}x ${i.particular}`).join(', ');

    await sheet.addRow({
        'Order ID': invoiceNumber,
        'Date': date,
        'Customer Name': customerName,
        'Phone': phone,
        'Total Amount': netTotal,
        'Status': 'Pending',
        'Items Summary': itemsSummary
    });
};
// Fetch all orders for the tracking dashboard
export const fetchAllOrders = async () => {
    const sheet = doc.sheetsByTitle['Orders'];
    if (!sheet) throw new Error('Orders tab not found');

    const rows = await sheet.getRows();
    return rows.map(row => ({
        orderId: row.get('Order ID'),
        date: row.get('Date'),
        customerName: row.get('Customer Name'),
        phone: row.get('Phone'),
        totalAmount: row.get('Total Amount'),
        status: row.get('Status') || 'Pending',
        itemsSummary: row.get('Items Summary')
    }));
};

// Update an order's status (e.g., from Pending to Fulfilled)
export const updateOrderStatusInSheet = async (orderId, newStatus) => {
    const sheet = doc.sheetsByTitle['Orders'];
    if (!sheet) throw new Error('Orders tab not found');

    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(row => row.get('Order ID') === orderId);

    if (!rowToUpdate) throw new Error('Order not found');

    rowToUpdate.set('Status', newStatus);
    await rowToUpdate.save(); // Persists change back to Google Sheets
};
// Add custom materials to the Live Inventory sheet on the fly
export const addInventoryItemIfMissing = async (process, brand, grade) => {
    const sheet = doc.sheetsByTitle['Current_Inventory'];
    if (!sheet) return;

    const rows = await sheet.getRows();

    // Check if it already exists
    const exists = rows.find(r =>
        r.get('Process')?.toUpperCase() === process.toUpperCase() &&
        r.get('Brand')?.toUpperCase() === brand.toUpperCase() &&
        r.get('Grade')?.toUpperCase() === grade.toUpperCase()
    );

    // If it does not exist, append it to the sheet!
    if (!exists) {
        await sheet.addRow({
            'Process': process.toUpperCase(),
            'Brand': brand.toUpperCase(),
            'Grade': grade.toUpperCase(),
            'Opening Stock': 0,
            'Total IN': 0,
            'Total OUT': 0,
            'Current Stock': 0
        });
        console.log(`✅ Auto-added new material to inventory: ${process} - ${brand} - ${grade}`);
    }
};