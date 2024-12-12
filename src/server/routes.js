const express = require("express");
const router = express.Router();
const multer = require('multer');
const { getRootHandler, registerHandler, loginHandler, editUserHandler, addUserDetailsHandler, getUserDetailsHandler, updateUserDetailsHandler, addFeedbackHandler, getUserWithFeedbackHandler,predict1, predict2 } = require("./handler");
const authenticateJWT = require('../middleware/authenticateJWT'); // Middleware untuk verifikasi JWT

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage }); // Create multer instance

router.get("/", getRootHandler); //Root

router.post('/register', registerHandler); //Register Akun dengan entitas User_Account
router.post('/login', loginHandler); //Login Akun dengan entitas User_Account

router.get('/user/:id_user', authenticateJWT, getUserWithFeedbackHandler); //Get Data Akun entitas User_Account beserta Data entitas Feedback
router.put('/user/:id_user', upload.single('user_profile_image'), authenticateJWT, editUserHandler); //Put(Ganti) Data Akun entitas User_Account

router.post('/addUserDetails', authenticateJWT, addUserDetailsHandler); //Post Data Akun entitas Users yang terhubung dengan entitas User_Account
router.get('/getUserDetails', authenticateJWT, getUserDetailsHandler); //Get Data Akun entitas Users yang terhubung dengan entitas User_Account
router.put('/updateUserDetails', authenticateJWT, updateUserDetailsHandler); //Put(Ganti) Data Akun entitas Users yang terhubung dengan entitas User_Account

router.post('/feedback', authenticateJWT, addFeedbackHandler); //Post Feedback

router.post('/predict1', authenticateJWT, predict1);
router.post('/predict2', authenticateJWT, predict2);

router.get('/index', authenticateJWT, (req, res) => {
    res.json({ message: `Selamat datang, ${req.user.username}` });
});

module.exports = router;
