import express from 'express';

const router = express.Router();

router.get('/api/auth/signup',(res,req) => {
    res.send("Signup endpoint");    
});

router.get('/api/auth/login',(res,req) => {
    res.send("login endpoint");
});

router.get('/api/auth/logout',(res,req)=> {
    res.send("forgot password endpoint");
});

export default router;