import {logMaterialTransaction } from '../services/sheetService.js';
import { doc } from '../config/googleSheets.js';
// Handle GET requests
export const getLiveInventory = async (req, res) => {
    try {
        const sheet = doc.sheetsByTitle['Current_Inventory'];
        const rows = await sheet.getRows();

        const inventoryData = rows.map(row => ({
            process: row.get('Process'),
            brand: row.get('Brand'),
            grade: row.get('Grade'),
            opening: Number(row.get('Opening')) || 0,
            totalIn: Number(row.get('Total IN')) || 0,
            totalOut: Number(row.get('Total OUT')) || 0,
            currentStock: Number(row.get('Current Stock')) || 0 // This reads your formula output!
        })).filter(item => item.process); // Filter out empty lines

        res.status(200).json({ success: true, data: inventoryData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Handle POST requests
export const logTransaction = async (req, res) => {
    try {
        await logMaterialTransaction(req.body);
        res.status(200).json({ success: true, message: 'Transaction logged successfully' });
    } catch (error) {
        console.error('Transaction Log Error:', error);
        res.status(500).json({ success: false, error: 'Failed to log transaction' });
    }
};
