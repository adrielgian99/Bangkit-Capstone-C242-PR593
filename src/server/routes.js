const express = require("express");
const router = express.Router();
const { getRootHandler, registerHandler, loginHandler, editUserHandler, addUserDetailsHandler, getUserDetailsHandler, updateUserDetailsHandler, addFeedbackHandler, getUserWithFeedbackHandler } = require("./handler");
const authenticateJWT = require('../middleware/authenticateJWT'); // Middleware untuk verifikasi JWT

router.get("/", getRootHandler); //Root

router.post('/register', registerHandler); //Register Akun dengan entitas User_Account
router.post('/login', loginHandler); //Login Akun dengan entitas User_Account

router.get('/user/:id_user', authenticateJWT, getUserWithFeedbackHandler); //Get Data Akun entitas User_Account beserta Data entitas Feedback
router.put('/user/:id_user', authenticateJWT, editUserHandler); //Put(Ganti) Data Akun entitas User_Account

router.post('/addUserDetails', authenticateJWT, addUserDetailsHandler); //Post Data Akun entitas Users yang terhubung dengan entitas User_Account
router.get('/getUserDetails', authenticateJWT, getUserDetailsHandler); //Get Data Akun entitas Users yang terhubung dengan entitas User_Account
router.put('/updateUserDetails', authenticateJWT, updateUserDetailsHandler); //Put(Ganti) Data Akun entitas Users yang terhubung dengan entitas User_Account

router.post('/feedback', authenticateJWT, addFeedbackHandler); //Post Feedback


router.get('/index', authenticateJWT, (req, res) => {
    res.json({ message: `Selamat datang, ${req.user.username}` });
});

module.exports = router;
