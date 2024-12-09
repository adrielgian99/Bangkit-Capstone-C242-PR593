const { db } = require('../services/firebase');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

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
        const bmiRounded = weight / (height * height);
        const bmi = Math.round(bmiRounded * 100) / 100; // BMI = berat badan (kg) / (tinggi badan (m) ^ 2)

        // Cari data pengguna berdasarkan id_user
        const querySnapshot = await db.collection('users').where('id_user', '==', id_user).get();

        if (!querySnapshot.empty) {
            // Jika id_user sudah ada, ambil dokumen yang ditemukan dan update data
            const userDoc = querySnapshot.docs[0];  // Ambil dokumen pertama yang ditemukan
            const userDocRef = userDoc.ref;  // Ambil referensi dokumen

            // Update data di dokumen tersebut dengan merge
            await userDocRef.update({
                gender,
                age,
                weight,
                height,
                bmi
            }, { merge: true }); // Gunakan merge: true untuk menggabungkan tanpa menghapus data yang lain

            return res.status(200).json({ message: "Data pengguna berhasil diperbarui." });
        } else {
            // Jika id_user belum ada, buat data baru
            const id_users = crypto.randomUUID(); // ID unik untuk user detail
            await db.collection('users').doc(id_users).set({
                id_user,  // Menyimpan id_user sebagai document ID
                gender,
                age,
                weight,
                height,
                bmi
            });

            return res.status(201).json({ message: "Data pengguna berhasil disimpan." });
        }
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

        // Cari apakah feedback untuk id_user sudah ada di koleksi feedback
        const feedbackSnapshot = await db.collection('feedback').where('id_user', '==', id_user).get();

        if (!feedbackSnapshot.empty) {
            // Jika sudah ada, ambil dokumen yang ditemukan
            const existingFeedbackDoc = feedbackSnapshot.docs[0];  // Ambil dokumen pertama yang ditemukan
            const feedbackRef = existingFeedbackDoc.ref;

            // Update data feedback yang ada
            await feedbackRef.update({
                rating,
                description,
                created_at: created_at,
            });

            // Update id_feedback pada user_account
            const userRef = db.collection('user_account').doc(id_user);
            await userRef.update({
                id_feedback: existingFeedbackDoc.id,  // Gunakan id_feedback yang sudah ada
            });

            return res.status(200).json({ message: "Feedback berhasil diperbarui." });
        } else {
            // Jika tidak ada, buat dokumen baru untuk feedback
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
        }

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

exports.predict1 = async (req, res) => {
    try {
        const { id_user } = req.user; // Ambil `id_user` dari token yang telah diverifikasi

        // Query untuk mencari user berdasarkan id_user
        const querySnapshot = await db.collection('users').where('id_user', '==', id_user).get();

        // Periksa apakah dokumen ditemukan
        if (querySnapshot.empty) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }

        // Ambil data dari dokumen yang ditemukan
        const userData = querySnapshot.docs[0].data();

         // Siapkan data gabungan
         const combinedData = {
            Gender: userData.gender ? [userData.gender] : [],
            Age: userData.age ? [userData.age] : [],
            Height: userData.height ? [userData.height] : [],
            Weight: userData.weight ? [userData.weight] : [],
            ...req.body // Gabungkan dengan data dari request body
        };

        // Kirim data ke API Python
        const response = await axios.post('http://127.0.0.1:5000/predict', combinedData);

        // Kirimkan respon dari API Python ke client
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error:', error.message);

        // Kirimkan error ke client
        return res.status(500).json({ error: 'Terjadi kesalahan saat memproses prediksi.' });
    }
};

exports.predict2 = async (req, res) => {
    try {
        // Ambil id_user dari JWT token
        const id_user = req.user.id_user;

        // Ambil data dari request body (data yang dikirimkan)
        const data = req.body;

        // Ambil data user dari koleksi users berdasarkan id_user
        const querySnapshot = await db.collection('users').where('id_user', '==', id_user).get();

        if (querySnapshot.empty) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ambil data dari dokumen yang ditemukan
        const userDoc = querySnapshot.docs[0];  // Karena id_user seharusnya unik
        const userData = userDoc.data();

        // Ambil nilai dari data user
        const gender = userData.gender || null;
        const age = userData.age || null;
        const height = userData.height || null;
        const weight = userData.weight || null;
        const BMI = userData.bmi || null;
        const user_obesity_level = userData.user_obesity_level || 'Unknown'; // Menangani jika tidak ada nilai

        // Gabungkan data user dengan data body dari request
        const combinedData = {
            gender: gender ? [gender] : [],
            age: age ? [age] : [],
            height: height ? [height] : [],
            weight: weight ? [weight] : [],
            BMI: BMI ? [BMI] : [],
            user_obesity_level: user_obesity_level, // Tambahkan user_obesity_level
            ...data,  // Gabungkan dengan data yang datang dari body request
        };

        // Kirim data ke Flask server
        const response = await axios.post('http://127.0.0.1:5000/predict', combinedData, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Hasil respons dari Flask
        const result = response.data;

        // Cek apakah dokumen dengan id_user sudah ada di A_D_recomendations
        const existingDocSnapshot = await db.collection('A_D_recomendations')
            .where('id_user', '==', id_user)
            .get();

        if (!existingDocSnapshot.empty) {
            // Jika sudah ada, ambil ID dokumen dan update
            const existingDoc = existingDocSnapshot.docs[0];
            await existingDoc.ref.update({
                monday_schedule: result.monday_schedule || null,
                tuesday_schedule: result.tuesday_schedule || null,
                wednesday_schedule: result.wednesday_schedule || null,
                thursday_schedule: result.thursday_schedule || null,
                friday_schedule: result.friday_schedule || null,
                saturday_schedule: result.saturday_schedule || null,
                sunday_schedule: result.sunday_schedule || null,
                juice: result.juice || null,
                protein_intake: result.protein_intake || null,
                vegetables: result.vegetables || null,
                user_obesity_level: user_obesity_level, // Update user_obesity_level
            });

            // Kirim respons sukses jika berhasil update
            return res.status(200).json({
                message: 'Data successfully updated in Firestore',
                result,
            });
        } else {
            // Jika tidak ada, buat dokumen baru
            const docRef = db.collection('A_D_recomendations').doc(); // Buat dokumen baru dengan ID unik
            await docRef.set({
                id_a_d_recom: docRef.id,
                id_user: id_user, // Tambahkan id_user
                monday_schedule: result.monday_schedule || null,
                tuesday_schedule: result.tuesday_schedule || null,
                wednesday_schedule: result.wednesday_schedule || null,
                thursday_schedule: result.thursday_schedule || null,
                friday_schedule: result.friday_schedule || null,
                saturday_schedule: result.saturday_schedule || null,
                sunday_schedule: result.sunday_schedule || null,
                juice: result.juice || null,
                protein_intake: result.protein_intake || null,
                vegetables: result.vegetables || null,
                user_obesity_level: user_obesity_level, // Tambahkan user_obesity_level
            });

            // Kirim respons sukses jika berhasil simpan data baru
            return res.status(200).json({
                message: 'Data successfully saved to Firestore',
                result,
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to process request' });
    }
};