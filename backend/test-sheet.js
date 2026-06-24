import dotenv from 'dotenv';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Load variables from .env
dotenv.config();

async function testConnection() {
    console.log("⏳ Initializing connection to Google Sheets...");

    try {
        // 1. Authenticate
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fixes newlines in .env
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // 2. Connect to Document
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        console.log(`✅ Connected successfully to Document: "${doc.title}"`);

        // 3. Find the Tab
        const sheet = doc.sheetsByTitle['Transactions'];
        if (!sheet) {
            throw new Error('Could not find a tab named "Transactions". Did you create it?');
        }
        console.log(`✅ Found tab: "Transactions"`);

        // 4. Write a Test Row
        console.log("⏳ Attempting to write a test row...");
        await sheet.addRow({
            Date: new Date().toLocaleDateString('en-GB'),
            Time: new Date().toLocaleTimeString(),
            Type: 'OUT',
            Process: 'TEST_PROCESS',
            Brand: 'TEST_BRAND',
            Grade: 'CONNECTION_TEST_OK',
            Quantity: 999
        });

        console.log("🚀 SUCCESS! Check your Google Sheet. The row was added.");

    } catch (error) {
        console.error("❌ FAILED. Here is the error:");
        console.error(error.message);
    }
}

// Run the function
testConnection();