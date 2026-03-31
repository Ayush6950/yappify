import express from 'express';
import { signup } from '../controllers/auth.controllers.js';


const router = express.Router();

router.post('/signup', signup);   // ✅ FIXED
router.post('/login', (req, res) => {
    res.send("login endpoint");
});
router.post('/logout', (req, res) => {
    res.send("logout endpoint");
});

export default router;