import express from 'express';
import path from 'path';
import { ENV } from './lib/env.js'; 
import { connectDB } from './lib/db.js';
import messageroutes from './routes/message.routes.js';
import authRoutes from './routes/auth.routes.js';
import "dotenv/config";

const app = express();
app.use(express.json());

const __dirname = path.resolve(); // ✅ fix name

const PORT = ENV.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/message", messageroutes);


// make ready for deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist"))); // ✅ Vite uses dist

    // ✅ FIX: remove app.get("/*") and use this
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}

const startServer = async () => {
    await connectDB();
       app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();