const axios = require('axios');

async function makePrediction(inputData) {
    try {
        // Kirim data ke API Python
        const response = await axios.post('http://127.0.0.1:5000/predict', inputData);
        console.log('Hasil prediksi:', response.data);
    } catch (error) {
        console.error('Terjadi error:', error);
    }
}

const genderMapping = {
    'pria': 1,
    'wanita': 0
};

const inputData = {
    gender: ['pria'],
    age: [22],
    height: [170],
    weight: [95.0],
    BMI: [32.90],
    hypertension_status: ['tidak'],
    diabetes_status: ['tidak'],
    user_obesity_level: ['Obesity_Type_I'],
    fitness_goal: ['Weight Loss'],
    fitness_type: ['Cardio Fitness']
};

// Mengirim data untuk prediksi
makePrediction(inputData);

