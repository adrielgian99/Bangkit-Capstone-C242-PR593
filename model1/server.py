import json
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder

app = Flask(__name__)

# Memuat model Keras yang telah dilatih
model = tf.keras.models.load_model('./model1/model.h5')

# Preprocessing pipeline
scaler = StandardScaler()
onehot_encoder = OneHotEncoder(sparse=False)
label_encoder = LabelEncoder()

# Kolom untuk preprocessing
numerical_cols = ['Age', 'Height', 'Weight']
categorical_cols = ['Gender', 'family_history_with_overweight', 'FAVC', 'FCVC', 'NCP', 
                    'CAEC', 'SMOKE', 'CH2O', 'SCC', 'FAF', 'TUE', 'CALC', 'MTRANS']

# Anda perlu melatih scaler dan encoder ini dengan data pelatihan yang sesuai
# Memuat dataset untuk pelatihan (misalnya CSV)
dataset_url = 'https://raw.githubusercontent.com/adrielgian99/Bangkit-Capstone-C242-PR593/machine_learning/Clean_Dataset/Data_Obesitas_new.csv'
df = pd.read_csv(dataset_url)

# Melatih scaler untuk kolom numerik
scaler.fit(df[numerical_cols])

# Melatih one-hot encoder untuk kolom kategorikal
onehot_encoder.fit(df[categorical_cols])

# Melatih label encoder untuk kolom target
label_encoder.fit(df['NObeyesdad'])

# Endpoint untuk prediksi
@app.route('/predict', methods=['POST'])
def predict():
    # Mengambil data JSON dari request
    data = request.get_json()

    # Mengonversi data JSON menjadi DataFrame untuk diproses
    df_input = pd.DataFrame(data)

    # Pra-pemrosesan data input
    X_new = preprocess_data(df_input)

    # Melakukan prediksi
    predictions = model.predict(X_new)
    predicted_labels = np.argmax(predictions, axis=1)

    # Menangani hasil prediksi menggunakan LabelEncoder
    try:
        predicted_labels = label_encoder.inverse_transform(predicted_labels)
    except ValueError as e:
        print("Handling unseen label error:", e)
        predicted_labels = ["unknown" for _ in predicted_labels]

    # Mengembalikan hasil prediksi dalam bentuk JSON
    return jsonify(predicted_labels.tolist())

# Fungsi untuk pra-pemrosesan data
def preprocess_data(df):
    # Pastikan kolom numerik sudah ditransformasikan
    df[numerical_cols] = scaler.transform(df[numerical_cols])

    # One-Hot Encoding untuk kolom kategori
    categorical_data = onehot_encoder.transform(df[categorical_cols])

    # Menggabungkan data numerik dan data kategori yang sudah di-encode
    encoded_df = pd.DataFrame(categorical_data, columns=onehot_encoder.get_feature_names(categorical_cols))
    
    # Menggabungkan kembali data numerik dan data kategori yang sudah diproses
    df_processed = pd.concat([df[numerical_cols], encoded_df], axis=1)

    return df_processed

if __name__ == '__main__':
    app.run(debug=True)
