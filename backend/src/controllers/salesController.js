import { generateInvoicePDF } from '../services/pdfService.js';
import { sendInvoiceWhatsApp } from '../services/whatsappService.js';
import { logSalesOrder ,addInventoryItemIfMissing} from '../services/sheetService.js';

export const createOrder = async (req, res) => {
    try {
        const orderData = req.body;

        // 1. Generate a unique invoice number
        const invoiceNumber = `INV-${Date.now().toString().slice(-5)}`;
        orderData.invoiceNumber = invoiceNumber;

        // 2. Generate the PDF
        const { filePath, netTotal } = await generateInvoicePDF(orderData);

        // 3. Log the Order to Google Sheets FIRST
        await logSalesOrder(orderData, netTotal, invoiceNumber);

        // 4. NEW FEATURE: Auto-add any custom materials to the Inventory Sheet
        for (const item of orderData.items) {
            if (item.isNew && item.rawProcess && item.rawBrand && item.rawGrade) {
                await addInventoryItemIfMissing(item.rawProcess, item.rawBrand, item.rawGrade);
            }
        }

        // 5. Try to send via WhatsApp
        let whatsappStatus = "Sent";
        try {
            await sendInvoiceWhatsApp(orderData.phone, orderData.customerName, filePath, invoiceNumber);
        } catch (waError) {
            console.warn('⚠️ WhatsApp skipped:', waError.message);
            whatsappStatus = "Not Sent (Robot offline)";
        }

        res.status(200).json({
            success: true,
            message: `Order logged! WhatsApp: ${whatsappStatus}`
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to process order' });
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