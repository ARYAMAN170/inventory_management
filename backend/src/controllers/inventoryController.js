import { fetchLiveInventory, logMaterialTransaction } from '../services/sheetService.js';

// Handle GET requests
export const getInventory = async (req, res) => {
    try {
        const data = await fetchLiveInventory();
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Inventory Fetch Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
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