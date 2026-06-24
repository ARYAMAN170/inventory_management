import waClient from '../config/whatsappClient.js';
import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

export const sendInvoiceWhatsApp = async (phone, customerName, pdfPath, invoiceNumber) => {
    if (!waClient.info) {
        throw new Error('WhatsApp client is not logged in or ready.');
    }

    // Format the number for India (+91) and append the required WhatsApp ID suffix
    const formattedNumber = `91${phone.replace(/\D/g, '')}@c.us`;

    const media = MessageMedia.fromFilePath(pdfPath);
    const caption = `Hello ${customerName},\n\nYour dispatch order is confirmed. Please find attached Dispatch Challan: ${invoiceNumber}.\n\nThank you!`;

    await waClient.sendMessage(formattedNumber, media, { caption });
    console.log(`✅ WhatsApp Invoice sent to ${customerName}`);
};