import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, RemoteAuth } = pkg;
import { MongoStore } from 'wwebjs-mongo';
import mongoose from 'mongoose';
import qrcode from 'qrcode-terminal';
import os from 'os';

let waClient = null;

export const startWhatsAppRobot = async () => {
    try {
        // Determine if we are on local Windows PC or Linux Cloud
        const isWindows = os.platform() === 'win32';
        let selectedAuthStrategy;

        if (isWindows) {
            console.log('💻 Windows detected: Using Local Storage for WhatsApp session.');
            selectedAuthStrategy = new LocalAuth();
        } else {
            console.log('⏳ Cloud detected: Connecting to MongoDB for WhatsApp session...');
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('📦 MongoDB Connected successfully!');

            const store = new MongoStore({ mongoose: mongoose });
            selectedAuthStrategy = new RemoteAuth({
                store: store,
                backupSyncIntervalMs: 300000 // Backup every 5 mins
            });
        }

        waClient = new Client({
            authStrategy: selectedAuthStrategy,
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', // Prevents Docker container memory crashes
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process', // Forces Chrome to use less RAM
                    '--disable-gpu'
                ],
                executablePath: isWindows ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined,
            }
        });

        waClient.on('qr', (qr) => {
            console.log('\n=========================================================');
            console.log('📱 WHATSAPP QR CODE GENERATED!');
            console.log('Render breaks terminal QR codes, so click the link below');
            console.log('to view a clean QR code in a new web browser tab:');

            // This converts the raw QR string into a safe web link
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
            console.log(`\n${qrImageUrl}\n`);

            console.log('=========================================================\n');
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

export const getWaClient = () => waClient;