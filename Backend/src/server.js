import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

import messageroutes from './routes/message.routes.js';
import authRoutes from './routes/auth.routes.js';
import connectDB from './lib/db.js';

dotenv.config();

const app = express();

const __dirname = path.resolve(); // ✅ fix name

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/message", messageroutes);


// make ready for deployment
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist"))); // ✅ Vite uses dist

    // ✅ FIX: remove app.get("/*") and use this
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT );
    connectDB();
});

