import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

// Authenticate with Google
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // The replace function fixes a common issue where Windows breaks the newline characters in the key
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

// A helper function to boot up the connection when the server starts
export const connectDatabase = async () => {
    try {
        await doc.loadInfo();
        console.log(`📊 Connected to Google Sheets Database: ${doc.title}`);
    } catch (error) {
        console.error('❌ Failed to connect to Google Sheets:', error);
    }
};