// src/controllers/transactionController.js
import { getRecentTransactionsFromSheet, deleteTransactionFromSheet } from '../services/sheetService.js';

export const getRecentTransactions = async (req, res) => {
    try {
        // Call the service function
        const logs = await getRecentTransactionsFromSheet();
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('❌ Controller Error (Get Transactions):', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const rowNumber = Number(req.params.rowNumber);

        // Call the service function
        await deleteTransactionFromSheet(rowNumber);

        console.log(`🗑️ Successfully deleted transaction at row ${rowNumber}`);
        res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('❌ Controller Error (Delete Transaction):', error);
        if (error.message === "Row not found in sheet") {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};