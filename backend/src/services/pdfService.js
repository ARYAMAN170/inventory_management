import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = (orderData) => {
    return new Promise((resolve, reject) => {
        try {
            // Ignore all pricing/charges fields completely
            const { customerName, phone, date, items, invoiceNumber } = orderData;

            const dir = './invoices';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            const filePath = path.join(dir, `Dispatch_${invoiceNumber}.pdf`);

            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // --- HEADER ---
            doc.fontSize(18).font('Helvetica-Bold');
            doc.text('DISPATCH CHALLAN', 40, 40, { align: 'center' });

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`Challan No:  ${invoiceNumber}`, 400, 75);
            doc.text(`Date:        ${date}`, 400, 90);

            doc.text('To,', 40, 75);
            doc.fontSize(12).text(customerName.toUpperCase(), 60, 90);
            doc.fontSize(10).font('Helvetica').text(`Ph: ${phone}`, 60, 105);

            // --- TABLE HEADERS ---
            const tableTop = 140;
            doc.rect(40, tableTop, 515, 20).stroke();
            doc.font('Helvetica-Bold').fontSize(10);

            const colX = { sno: 50, part: 100, qty: 320, wt: 390, totWt: 470 };
            doc.text('S.No', colX.sno, tableTop + 5);
            doc.text('Particulars', colX.part, tableTop + 5);
            doc.text('Bags (Qty)', colX.qty, tableTop + 5);
            doc.text('Bag Wt.', colX.wt, tableTop + 5);
            doc.text('Total Wt.', colX.totWt, tableTop + 5);

            // --- TABLE ROWS ---
            let y = tableTop + 25;
            let totalBags = 0;
            let totalGrossWeight = 0;

            doc.font('Helvetica');
            items.forEach((item, i) => {
                // Enforce the 25kg rule strictly on the backend
                const bags = parseInt(item.quantity) || 0;
                const totalWt = bags * 25;

                totalBags += bags;
                totalGrossWeight += totalWt;

                doc.text((i + 1).toString(), colX.sno, y);
                doc.text(item.particular ? item.particular.toUpperCase() : '', colX.part, y, { width: 200 });
                doc.text(bags.toString(), colX.qty, y);
                doc.text('25 Kgs', colX.wt, y);
                doc.text(totalWt + ' Kgs', colX.totWt, y);
                y += 20;
            });

            // Draw an outer box around the items
            doc.rect(40, tableTop + 20, 515, y - (tableTop + 20) + 10).stroke();

            // --- SUMMARY FOOTER ---
            const summaryTop = y + 10;
            doc.rect(40, summaryTop, 515, 30).stroke();

            doc.font('Helvetica-Bold').fontSize(11);
            doc.text('TOTAL:', colX.part, summaryTop + 10);
            doc.text(totalBags.toString() + ' Bags', colX.qty - 10, summaryTop + 10);
            doc.text(totalGrossWeight.toString() + ' Kgs', colX.totWt - 15, summaryTop + 10);

            // --- SIGNATURES ---
            doc.font('Helvetica-Bold').fontSize(10)

            doc.end();

            // Return 0 so your Google Sheet logs 0 in the 'Amount' column
            stream.on('finish', () => resolve({ filePath, netTotal: 0 }));
            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};