// src/services/getFoodImages.js
const { db } = require('./firestore');

// Function to get image URLs based on food items from multiple categories
const getFoodImages = async (inputString) => {
    const images = {};
    
    // Split the input string into categories
    const categories = inputString.split(';').map(category => category.trim());

    for (const category of categories) {
        // Split category into name and items
        const [categoryName, itemsString] = category.split(':').map(part => part.trim());
        const foodItems = itemsString.split(',').map(item => item.trim());

        // Initialize the images object for this category
        images[categoryName] = {};

        // Loop through the food items and fetch image URLs from Firestore
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

    return images; // Return the object containing image URLs for all categories
};

module.exports = getFoodImages; // Export the function