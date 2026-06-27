import { generateInvoicePDF } from '../services/pdfService.js';
import fs from 'fs';
import { sendInvoiceWhatsApp } from '../services/whatsappService.js';
import { logSalesOrder ,addInventoryItemIfMissing} from '../services/sheetService.js';

// Inside your order controller (e.g., src/controllers/orderController.js)

export const createOrder = async (req, res) => {
    //await doc.loadInfo();
    try {
        const { action, ...orderData } = req.body;

        // 1. ALWAYS LOG TO GOOGLE SHEETS
        // await logSalesOrder(orderData);

        // 2. HANDLE 'LOG ONLY' ACTION
        if (action === 'log') {
            return res.status(200).json({ success: true, message: 'Logged successfully.' });
        }

        // 3. HANDLE 'DOWNLOAD' ACTION
        if (action === 'download') {
            // Generate a random invoice number if the frontend didn't send one
            if (!orderData.invoiceNumber) {
                orderData.invoiceNumber = Date.now().toString().slice(-6);
            }

            // A. Trigger your existing service (Wait for it to save to the './invoices' folder)
            const { filePath } = await generateInvoicePDF(orderData);

            // B. Read the newly created file from the server's hard drive
            const pdfBuffer = fs.readFileSync(filePath);

            // C. Send the file down to the user's browser
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Challan_${orderData.customerName.replace(/\s+/g, '_')}.pdf"`);
            res.status(200).send(pdfBuffer);

            // D. Delete the physical file from the server so we don't waste storage space
            fs.unlinkSync(filePath);

            return; // End execution
        }

        // 4. FALLBACK
        return res.status(400).json({ success: false, error: 'Invalid action requested.' });

    } catch (error) {
        console.error('❌ Order Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
import { fetchAllOrders, updateOrderStatusInSheet } from '../services/sheetService.js';

// GET /api/orders
export const getOrders = async (req, res) => {
    try {
        const data = await fetchAllOrders();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/orders/status
export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body; // e.g. status: 'Fulfilled' or 'Partially Completed'
        await updateOrderStatusInSheet(orderId, status);
        res.status(200).json({ success: true, message: `Order status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};