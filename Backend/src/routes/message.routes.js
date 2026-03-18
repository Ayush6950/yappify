import express from "express";

const router = express.Router();


router.get('/send' , (res, req) => {
    res.send("send message endpoint");
});

export default router;