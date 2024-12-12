const { db } = require('./firestore');

// fungsi untuk mengambil gambar berdasarkan makanan diet
const getFoodImages = async (inputString) => {
    const images = {};
    
    // membagi input berdasarkan kategori
    const categories = inputString.split(';').map(category => category.trim());

    for (const category of categories) {
        // membagi kategori berdasarkan nama dan item
        const [categoryName, itemsString] = category.split(':').map(part => part.trim());
        const foodItems = itemsString.split(',').map(item => item.trim());

        // inisialisasi objek untuk kategori tersebut
        images[categoryName] = {};

        // Looping melalui fooditem  dan mengambil URL gambar dari Firestore
        for (const foodItem of foodItems) {
            const docSnapshot = await db.collection('food_images').doc(foodItem).get();
            if (docSnapshot.exists) {
                const data = docSnapshot.data();
                if (data && data.imageUrl) {
                    images[categoryName][foodItem] = {
                        imageUrl: data.imageUrl || null,
                        description: data.description || null,
                    }; 
                }
            }
        }
    }

    return images; 
};

module.exports = getFoodImages;