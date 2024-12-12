const { db } = require('./firestore'); 

// Fungsi untuk mendapatkan URL gambar dan deskripsi berdasarkan nama latihan dari output jadwal
const getImageUrlsFromExercises = async (exercises) => {
    const images = {};

    // Looping melalui exercises dan mengambil URL gambar dan deskripsi dari Firestore
    for (const exercise of exercises) {
        const docSnapshot = await db.collection('activity_images').doc(exercise).get();
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            if (data && data.imageUrl) {
                images[exercise] = {
                    imageUrl: data.imageUrl || null,
                    description: data.description || null,
                }; 
            }
        }
    }

    return images; 
};

module.exports = getImageUrlsFromExercises; 