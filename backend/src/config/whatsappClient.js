import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

// Initialize the client with your local Chrome path
const waClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // If you use Chrome, this path is usually correct for Windows
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    }
});

// Generate the QR code in the terminal
waClient.on('qr', (qr) => {
    console.log('📱 SCAN THIS QR CODE WITH THE FACTORY WHATSAPP ACCOUNT:');
    qrcode.generate(qr, { small: true });
});

waClient.on('ready', () => {
    console.log('✅ WhatsApp Robot is connected and ready!');
});

// A helper function to boot up the robot
export const startWhatsAppRobot = () => {
    waClient.initialize();
};

export default waClient;