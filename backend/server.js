import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Configurations
import { connectDatabase } from './src/config/googleSheets.js';
import { startWhatsAppRobot } from './src/config/whatsappClient.js';

// Import Routes
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import salesRoutes from './src/routes/salesRoutes.js'; // <-- MAKE SURE THIS IS UNCOMMENTED

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/inventory', inventoryRoutes);
app.use('/api/create-order', salesRoutes); // <-- MAKE SURE THIS SAYS '/api/create-order'

// Boot Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);

    // Initialize External Services
    await connectDatabase();
    startWhatsAppRobot();
});