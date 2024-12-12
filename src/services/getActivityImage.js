// getActivityImage.js
const { db } = require('./firestore'); // Ensure you have the Firestore instance

// Function to get image URLs based on exercise names from the schedule output
const getImageUrlsFromExercises = async (exercises) => {
    const images = {};

    // Loop through the exercises and fetch image URLs from Firestore
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

    return images; // Return the object containing image URLs
};

module.exports = getImageUrlsFromExercises; // Export the function