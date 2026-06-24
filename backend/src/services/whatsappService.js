import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;
import { getWaClient } from '../config/whatsappClient.js';
import fs from 'fs';

export const sendInvoiceWhatsApp = async (phone, customerName, pdfPath, invoiceNumber) => {
    const waClient = getWaClient();

    if (!waClient) {
        throw new Error('WhatsApp client is still booting up.');
    }

    // Format the Indian phone number for WhatsApp
    const formattedPhone = `91${phone.replace(/\D/g, '')}@c.us`;

    // The custom Dispatch text
    const caption = `Hello ${customerName},\n\nYour dispatch order is confirmed. Please find attached Dispatch Challan: ${invoiceNumber}.\n\nThank you!`;

    // Read the PDF and send it
    const media = MessageMedia.fromFilePath(pdfPath);

    await waClient.sendMessage(formattedPhone, media, { caption });
    console.log(`✅ Dispatch Challan sent via WhatsApp to ${phone}`);

    // Clean up the PDF to save server space
    fs.unlinkSync(pdfPath);
};