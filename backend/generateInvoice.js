import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = (orderData) => {
    return new Promise((resolve, reject) => {
        try {
            const { customerName, grade, quantity, invoiceNumber } = orderData;

            // Ensure an 'invoices' directory exists
            const dir = './invoices';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            const filePath = path.join(dir, `Invoice_${invoiceNumber}.pdf`);
            const doc = new PDFDocument({ margin: 50 });

            // Pipe the PDF into a file
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // --- Draw the PDF ---
            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('FACTORY NAME', { align: 'left' });
            doc.fontSize(10).font('Helvetica').fillColor('gray').text('Tax Invoice / Bill of Supply', { align: 'left' });
            doc.moveDown();

            // Invoice Details
            doc.fillColor('black').fontSize(12);
            doc.text(`Invoice No: ${invoiceNumber}`);
            doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`);
            doc.moveDown();

            // Customer Details
            doc.font('Helvetica-Bold').text('Billed To:');
            doc.font('Helvetica').text(customerName);
            doc.moveDown(2);

            // Order Table Header
            doc.font('Helvetica-Bold');
            doc.text('Item Description', 50, 250);
            doc.text('Quantity', 400, 250);

            // Line Break
            doc.moveTo(50, 265).lineTo(500, 265).stroke();

            // Order Row
            doc.font('Helvetica');
            doc.text(`${grade} (Plastic Granules)`, 50, 280);
            doc.text(`${quantity} Bags`, 400, 280);

            doc.end();

            // Wait for the file to finish writing before resolving
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);

        } catch (error) {
            reject(error);
        }
    });
};