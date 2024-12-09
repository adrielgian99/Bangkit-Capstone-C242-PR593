const axios = require('axios');

// Data yang ingin dikirim
const data = {
    'Gender': ['pria'],
    'Age': [30],
    'Height': [170],
    'Weight': [69.0],
    'family_history_with_overweight': ['iya'],
    'FAVC': ['iya'],
    'FCVC': ['kadang-kadang'],
    'NCP': ['tiga kali'],
    'CAEC': ['kadang-kadang'],
    'SMOKE': ['tidak'],
    'CH2O': ['lebih dari 2 liter'],
    'SCC': ['tidak'],
    'FAF': ['kisaran 1-2 hari'],
    'TUE': ['lebih dari 5 jam'],
    'CALC': ['tidak'],
    'MTRANS': ['mobil']
};

// Kirim POST request ke API Python
axios.post('http://127.0.0.1:5000/predict', data)
    .then((response) => {
        console.log('Response from Python:', response.data);
    })
    .catch((error) => {
        console.error('Error sending request:', error);
    });
