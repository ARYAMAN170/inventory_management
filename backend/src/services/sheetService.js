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
    const { type, process: factoryProcess, brand, grade, quantity ,partyName} = data;

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
        Party: partyName,
        Status: 'Active'
    });
};
export const logSalesOrder = async (orderData, netTotal, invoiceNumber) => {
    const sheet = doc.sheetsByTitle['Transactions'];
    if (!sheet) throw new Error("Transactions sheet not found!");

    const now = new Date();

    // Format exactly to match your Google Sheet columns
    const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); // HH:MM:SS AM/PM

    // Append a row for every single item in the dispatch order
    for (const item of orderData.items) {
        await sheet.addRow({
            'Date': dateStr,
            'Time': timeStr,
            'Type': 'OUT', // Since this is a dispatch/sales generator, type is always OUT
            'Process': item.rawProcess.toUpperCase(),
            'Brand': item.rawBrand.toUpperCase(),
            'Grade': item.rawGrade.toUpperCase(),
            'Quantity': Number(item.quantity) // Number of bags logged safely
        });
    }
    console.log(`📊 Successfully logged ${orderData.items.length} items to Transactions sheet!`);
};// Fetch all orders for the tracking dashboard
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
// src/services/sheetService.js

// 1. Function to fetch recent logs
export const getRecentTransactionsFromSheet = async () => {
    const sheet = doc.sheetsByTitle['Transactions'];
    if (!sheet) throw new Error("Transactions sheet not found!");

    const rows = await sheet.getRows();
    const recentRows = rows.slice(-5).reverse();

    return recentRows.map(row => ({
        rowNumber: row.rowNumber,
        date: row.get('Date') || '',
        time: row.get('Time') || '',
        type: row.get('Type') || '',
        process: row.get('Process') || '',
        brand: row.get('Brand') || '',
        grade: row.get('Grade') || '',
        quantity: row.get('Quantity') || '',
        party: row.get('Party') || 'Unknown'
    }));
};

// 2. Function to delete a log
export const deleteTransactionFromSheet = async (rowNumber) => {
    const sheet = doc.sheetsByTitle['Transactions'];
    if (!sheet) throw new Error("Transactions sheet not found!");

    const rows = await sheet.getRows();
    const rowToDelete = rows.find(r => r.rowNumber === rowNumber);

    if (!rowToDelete) throw new Error("Row not found in sheet");

    await rowToDelete.delete();
};
// ==========================================
// SYNC CURRENT STOCK TO OPENING STOCK (BATCH UPDATE)
// ==========================================
// ==========================================
// SYNC CURRENT STOCK TO OPENING STOCK (BATCH UPDATE)
// ==========================================
export const syncOpeningStock = async (req, res) => {
    try {
        // ---------------------------------------------------------
        // PART 1: INVENTORY BATCH UPDATE (1 API CALL)
        // ---------------------------------------------------------
        const invSheet = doc.sheetsByTitle['Current_Inventory'];
        if (!invSheet) throw new Error("Current_Inventory sheet not found!");

        // Load all cells into memory at once
        await invSheet.loadCells();

        let processCol = -1, openingCol = -1, currentStockCol = -1;

        // Find columns robustly (ignoring spaces and case)
        for (let c = 0; c < invSheet.columnCount; c++) {
            const cellValue = invSheet.getCell(0, c).value;
            if (!cellValue) continue; // Skip empty cells

            const headerVal = cellValue.toString().trim().toLowerCase();
            if (headerVal === 'process') processCol = c;
            if (headerVal === 'opening') openingCol = c;
            if (headerVal === 'current stock') currentStockCol = c;
        }

        // Safety check to prevent the "-1" crash!
        if (processCol === -1 || openingCol === -1 || currentStockCol === -1) {
            throw new Error(`Missing columns in Current_Inventory sheet! Check your headers. Process found: ${processCol !== -1}, Opening found: ${openingCol !== -1}, Current Stock found: ${currentStockCol !== -1}`);
        }

        // Loop through the rows in memory and move the numbers
        for (let r = 1; r < invSheet.rowCount; r++) {
            const processCell = invSheet.getCell(r, processCol);

            if (processCell.value) {
                const currentStockCell = invSheet.getCell(r, currentStockCol);
                const openingCell = invSheet.getCell(r, openingCol);

                openingCell.value = Number(currentStockCell.value) || 0;
            }
        }

        await invSheet.saveUpdatedCells();

        // ---------------------------------------------------------
        // PART 2: ARCHIVE TRANSACTIONS BATCH UPDATE (1 API CALL)
        // ---------------------------------------------------------
        const txSheet = doc.sheetsByTitle['Transactions'];
        if (txSheet) {
            await txSheet.loadCells();

            let statusCol = -1;

            for (let c = 0; c < txSheet.columnCount; c++) {
                const cellValue = txSheet.getCell(0, c).value;
                if (!cellValue) continue;

                if (cellValue.toString().trim().toLowerCase() === 'status') {
                    statusCol = c;
                    break;
                }
            }

            if (statusCol !== -1) {
                for (let r = 1; r < txSheet.rowCount; r++) {
                    const statusCell = txSheet.getCell(r, statusCol);
                    // Standardize the check to ignore case and spaces
                    if (statusCell.value && statusCell.value.toString().trim().toLowerCase() === 'active') {
                        statusCell.value = 'Archived';
                    }
                }
                await txSheet.saveUpdatedCells();
            } else {
                console.warn('⚠️ Status column not found in Transactions sheet. Skipping archive.');
            }
        }

        res.status(200).json({ success: true, message: 'Stock synced and transactions archived successfully!' });
    } catch (error) {
        console.error('❌ Error syncing stock:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};