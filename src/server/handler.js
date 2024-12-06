const { db } = require('../services/firebase');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.getRootHandler = (req, res) => {
    res.status(200).send("Service Running");
};

// Fungsi untuk Register
exports.registerHandler = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({ message: "Username dan password wajib diisi." });
        }

        // Cek apakah user dengan username ini sudah ada
        const userSnapshot = await db.collection('user_account').where('username', '==', username).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ message: "Username sudah terdaftar." });
        }

        // Generate unique user ID
        const id_user = crypto.randomUUID();

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const date = new Date();
        const offsetWIB = 7 * 60 * 60 * 1000;
        const wibDate = new Date(date.getTime() + offsetWIB);
        const created_at = wibDate.toISOString().replace('Z', '+07:00');

        // Simpan data user ke Firestore
        await db.collection('user_account').doc(id_user).set({
            id_user,
            username,
            password: hashedPassword,
            created_at: created_at,
            updated_at: null,
            user_profile_image: null,
            id_feedback: null,
        });

        return res.status(201).json({ message: "User berhasil didaftarkan." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

// Fungsi untuk Login
exports.loginHandler = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username dan password wajib diisi." });
        }

        const userSnapshot = await db.collection('user_account').where('username', '==', username).get();

        if (userSnapshot.empty) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Username atau password salah." });
        }

        // Membuat JWT Token
        const token = jwt.sign(
            { id_user: userDoc.id, username: userData.username },
            'C242-PR593obesicheck',
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: "Login berhasil.",
            token: token,
            user: { id_user: userDoc.id, username: userData.username }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

// Endpoint untuk mengedit data user
exports.editUserHandler = async (req, res) => {
    try {
        const id_user = req.user.id_user;
        const { username, user_profile_image } = req.body;

        // Ambil data user dari koleksi user_account berdasarkan id_user
        const userDoc = await db.collection('user_account').doc(id_user).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        const currentData = userDoc.data();

        const date = new Date();
        const offsetWIB = 7 * 60 * 60 * 1000;
        const wibDate = new Date(date.getTime() + offsetWIB);
        const updated_at = wibDate.toISOString().replace('Z', '+07:00');

        // Perbarui data dengan nilai baru jika ada, jika tidak gunakan nilai yang sudah ada
        const updatedData = {
            username: username || currentData.username,
            user_profile_image: user_profile_image || currentData.user_profile_image,
            updated_at: updated_at
        };

        // Perbarui data di Firestore
        await db.collection('user_account').doc(id_user).update(updatedData);

        return res.status(200).json({
            message: "Data user berhasil diperbarui.",
            updatedData: updatedData,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

exports.addUserDetailsHandler = async (req, res) => {
    try {
        const { gender, age, weight, height } = req.body;
        const id_user = req.user.id_user;  // Ambil id_user dari token yang telah diverifikasi

        // Validasi input
        if (!gender || !age || !weight || !height) {
            return res.status(400).json({ message: "Semua field wajib diisi." });
        }

        // Hitung BMI
        const bmi = weight / (height * height); // BMI = berat badan (kg) / (tinggi badan (m) ^ 2)

        // Buat ID unik untuk user detail
        const id_users = crypto.randomUUID();

        // Simpan data User ke Firestore
        await db.collection('users').doc(id_users).set({
            id_users,
            id_user,        // Referensi ke id_user dari entitas user_account
            gender,
            age,
            weight,
            height,
            bmi,
        });

        // Kembalikan response sukses
        return res.status(201).json({ message: "Data pengguna berhasil disimpan." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

// Fungsi untuk mengubah data user (age, gender, height, weight)
exports.updateUserDetailsHandler = async (req, res) => {
    try {
        const id_user = req.user.id_user; // Mengambil id_user dari token yang telah diverifikasi
        const { age, gender, height, weight } = req.body;

        // Validasi input
        if (age === undefined || gender === undefined || height === undefined || weight === undefined) {
            return res.status(400).json({ message: "Semua field (age, gender, height, weight) wajib diisi." });
        }

        // Mencari dokumen dengan id_user di koleksi users
        const querySnapshot = await db.collection('users').where('id_user', '==', id_user).get();

        if (querySnapshot.empty) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        // Perbarui semua dokumen yang ditemukan
        const userDetails = { age, gender, height, weight };
        querySnapshot.forEach(async (doc) => {
            await db.collection('users').doc(doc.id).update(userDetails);
        });

        return res.status(200).json({
            message: "Data user berhasil diperbarui.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

exports.getUserDetailsHandler = async (req, res) => {
    try {
        const id_user = req.user.id_user; // Mengambil id_user dari token yang telah diverifikasi

        // Query ke koleksi 'users' untuk menemukan dokumen berdasarkan id_user
        const querySnapshot = await db.collection('users').where('id_user', '==', id_user).get();

        if (querySnapshot.empty) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        // Ambil data dari dokumen yang ditemukan
        const userData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json({
            message: "Data user berhasil diambil.",
            data: userData[0], // Asumsikan hanya satu dokumen per id_user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};


exports.addFeedbackHandler = async (req, res) => {
    try {
        const { rating, description } = req.body;
        const id_user = req.user.id_user;  // Mengambil id_user dari token yang telah diverifikasi

        // Validasi input
        if (!rating || !description) {
            return res.status(400).json({ message: "Semua field wajib diisi." });
        }

        // Validasi rating (misalnya rating harus antara 1 dan 5)
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating harus antara 1 hingga 5." });
        }

        // Buat ID feedback unik
        const id_feedback = crypto.randomUUID();
        const date = new Date();
        const offsetWIB = 7 * 60 * 60 * 1000;
        const wibDate = new Date(date.getTime() + offsetWIB);
        const created_at = wibDate.toISOString().replace('Z', '+07:00');

        // Simpan feedback ke Firestore
        await db.collection('feedback').doc(id_feedback).set({
            id_feedback,
            id_user,
            rating,
            description,
            created_at: created_at,
        });

        // Update id_feedback pada user_account
        const userRef = db.collection('user_account').doc(id_user);
        await userRef.update({
            id_feedback: id_feedback,
        });

        return res.status(201).json({ message: "Feedback berhasil diberikan." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};


// Fungsi untuk mengambil data user beserta feedback-nya
exports.getUserWithFeedbackHandler = async (req, res) => {
    try {
        const id_user = req.user.id_user;

        if (req.user.id_user !== id_user) {
            return res.status(403).json({ message: "Anda tidak memiliki izin untuk melihat data pengguna ini." });
        }
        // Pastikan ID pengguna dalam token sesuai dengan ID pengguna yang diminta
        if (req.user.id_user !== id_user) {
            return res.status(403).json({ message: "Anda tidak memiliki izin untuk melihat data pengguna ini." });
        }

        const userDoc = await db.collection('user_account').doc(id_user).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        const userData = userDoc.data();

        const feedbackSnapshot = await db.collection('feedback').where('id_user', '==', id_user).get();

        const feedbackList = feedbackSnapshot.docs.map(doc => doc.data());

        // Menambahkan feedback ke data user
        const userWithFeedback = {
            ...userData,
            feedback: feedbackList,
        };

        return res.status(200).json(userWithFeedback);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};