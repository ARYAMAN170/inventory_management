import { generateInvoicePDF } from '../services/pdfService.js';
import { sendInvoiceWhatsApp } from '../services/whatsappService.js';
import { logSalesOrder ,addInventoryItemIfMissing} from '../services/sheetService.js';

// Inside your order controller (e.g., src/controllers/orderController.js)

export const createOrder = async (req, res) => {
    try {
        const orderData = req.body;

        // 1. Log the transaction to Google Sheets (Keep your existing sheetService logic)
        // await logSalesOrder(orderData, netTotal, invoiceNumber);

        // 2. Generate the PDF (Keep whatever PDF generator you are currently using)
        // const pdfBuffer = await generateYourPDF(orderData);

        // 3. SEND THE FILE DIRECTLY TO THE FRONTEND
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Challan_${orderData.customerName}.pdf"`);

        // Send the raw PDF buffer back
        res.status(200).send(pdfBuffer);

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