import express from 'express';
import dotenv from 'dotenv';
import messageroutes from './routes/message.routes.js';

import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/message", messageroutes);
app.listen(PORT,() =>{
    console.log ("Server is running on port " + PORT)
});

    