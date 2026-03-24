import express from 'express';
import { signup } from '../controllers/auth.controllers.js';
const router = express.Router();

router.get('/api/auth/signup', signup);

router.get('/api/auth/login', (req, res) => {
    res.send("login endpoint");
});

router.get('/api/auth/logout', (req, res) => {
    res.send("forgot password endpoint");
});

export default router;
