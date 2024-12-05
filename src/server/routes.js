const express = require("express");
const router = express.Router();
const { getRootHandler, registerHandler, loginHandler, editUserHandler, addFeedbackHandler, getUserWithFeedbackHandler } = require("./handler");
const authenticateJWT = require('../middleware/authenticateJWT'); // Middleware untuk verifikasi JWT

router.get("/", getRootHandler);
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/feedback', authenticateJWT, addFeedbackHandler);
router.get('/user/:id_user', authenticateJWT, getUserWithFeedbackHandler);
router.put('/user/:id_user', authenticateJWT, editUserHandler);


router.get('/index', authenticateJWT, (req, res) => {
    res.json({ message: `Selamat datang, ${req.user.username}` });
});

module.exports = router;
