const axios = require('axios');

const data = {
    'gender': ['pria'],
    'age': [18],
    'height': [168],
    'weight': [47.5],
    'BMI': [16.83],
    'hypertension_status': ['tidak'],
    'diabetes_status': ['tidak'],
    'user_obesity_level': ['Insufficient_Weight'],
    'fitness_goal': ['Weight Gain'],
    'fitness_type': ['Muscular Fitness']
};

// Send the data to Flask API
axios.post('http://127.0.0.1:5000/predict', data)
    .then(response => {
        console.log('Predictions:', response.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
