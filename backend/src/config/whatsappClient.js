import pkg from 'whatsapp-web.js';
const { Client, RemoteAuth } = pkg;
import { MongoStore } from 'wwebjs-mongo';
import mongoose from 'mongoose';
import qrcode from 'qrcode-terminal';
import os from 'os';

let waClient = null; // We store it here so other files can grab it later

export const startWhatsAppRobot = async () => {
    try {
        console.log('⏳ Connecting to MongoDB for WhatsApp session...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 MongoDB Connected successfully!');

        // Tell WhatsApp to use MongoDB as its hard drive
        const store = new MongoStore({ mongoose: mongoose });
        const isWindows = os.platform() === 'win32';

        waClient = new Client({
            authStrategy: new RemoteAuth({
                store: store,
                backupSyncIntervalMs: 300000 // Automatically saves the session every 5 minutes
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'],
                executablePath: isWindows ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined,
            }
        });

        waClient.on('qr', (qr) => {
            console.log('📱 SCAN THIS QR CODE WITH THE FACTORY WHATSAPP ACCOUNT:');
            qrcode.generate(qr, { small: true });
        });

        waClient.on('remote_session_saved', () => {
            console.log('☁️ WhatsApp Session safely backed up to MongoDB!');
        });

        waClient.on('ready', () => {
            console.log('✅ WhatsApp Robot is connected and ready!');
        });

        waClient.initialize();
    } catch (error) {
        console.error('❌ Failed to start WhatsApp Robot:', error);
    }
};

// Export a function to get the client when sending messages
export const getWaClient = () => waClient;