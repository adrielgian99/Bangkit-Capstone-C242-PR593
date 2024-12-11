// Import TensorFlow.js untuk Node.js
const tf = require('@tensorflow/tfjs');
const fs = require('fs');

// Path ke file model dan mapping
const MODEL_PATH = './tfjs_model/model.json';
const MAPPING_PATH = './label_encoder_mapping.json';

// Muat mapping LabelEncoder
const labelEncoders = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));

// Daftar kolom output
const outputColumns = [
    'vegetables', 'protein_intake', 'juice',
    'monday_schedule', 'tuesday_schedule',
    'wednesday_schedule', 'thursday_schedule',
    'friday_schedule', 'saturday_schedule', 'sunday_schedule'
];

// Preprocessing data
function preprocessInput(data, oneHotEncoder, labelEncoders, scaler) {
    // One-hot encode categorical inputs
    const categoricalColumns = ['gender', 'hypertension_status', 'diabetes_status', 'fitness_goal', 'fitness_type'];
    const oneHotEncodedData = categoricalColumns.flatMap(col => oneHotEncoder[col][data[col]]);

    // Label encode categorical inputs
    const labelEncodedData = [labelEncoders.user_obesity_level[data.user_obesity_level]];

    // Normalize numerical columns
    const normalizedData = scaler.transform([[data.age, data.height, data.weight, data.BMI]])[0];

    // Combine all processed features
    return [...normalizedData, ...labelEncodedData, ...oneHotEncodedData];
}

// Fungsi untuk memuat model
async function loadModel() {
    try {
        const model = await tf.loadLayersModel(`file://${MODEL_PATH}`);
        console.log('Model loaded successfully');
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

// Fungsi untuk melakukan prediksi
async function predict(model, inputData) {
    // Konversi input ke tensor
    const inputTensor = tf.tensor2d([inputData]);

    // Melakukan prediksi
    const predictions = model.predict(inputTensor);

    // Decode predictions
    const decodedPredictions = {};
    predictions.forEach((prediction, index) => {
        const maxIndex = prediction.argMax(-1).dataSync()[0];
        decodedPredictions[outputColumns[index]] = Object.keys(labelEncoders[outputColumns[index]])
            .find(key => labelEncoders[outputColumns[index]][key] === maxIndex);
    });

    return decodedPredictions;
}

// Data dummy untuk input
const userInput = {
    gender: 'pria',
    age: 22,
    height: 170,
    weight: 95.0,
    BMI: 32.90,
    hypertension_status: 'tidak',
    diabetes_status: 'tidak',
    user_obesity_level: 'Obesity_Type_I',
    fitness_goal: 'Weight Loss',
    fitness_type: 'Cardio Fitness',
};

// Dummy encoders dan scaler
const oneHotEncoder = {
    gender: { pria: [1, 0], perempuan: [0, 1] },
    hypertension_status: { tidak: [1, 0], iya: [0, 1] },
    diabetes_status: { tidak: [1, 0], iya: [0, 1] },
    fitness_goal: { 'Weight Loss': [1, 0], 'Weight Gain': [0, 1] },
    fitness_type: { 'Cardio Fitness': [1, 0], 'Muscular Fitness': [0, 1] },
};

const scaler = {
    min: [18, 130, 32.0, 9.52],
    max: [63, 202, 130.0, 57.99],
    transform(data) {
        return data.map((val, idx) => (val - this.min[idx]) / (this.max[idx] - this.min[idx]));
    },
};

// Jalankan proses prediksi
(async () => {
    try {
        // Preprocess input data
        const inputData = preprocessInput(userInput, oneHotEncoder, labelEncoders, scaler);

        // Load model
        const model = await loadModel();

        // Predict and display result
        const predictions = await predict(model, inputData);
        console.log('Predictions:', predictions);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();