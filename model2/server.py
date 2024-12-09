from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, LabelEncoder, MinMaxScaler
from tensorflow.keras.models import load_model

app = Flask(__name__)

# Load the pre-trained model and other necessary components
model = load_model('./model2/gym_and_diet_model.h5')

# Load the encoder and scaler if saved or create them again
onehot_encoder = OneHotEncoder(sparse=False)
label_encoder = {}
scaler = MinMaxScaler()

# Preprocessing setup (assuming the encoder and scaler were trained earlier)
categorical_columns1 = ["gender", "hypertension_status", "diabetes_status", "fitness_goal", "fitness_type"]
categorical_columns2 = [
    "user_obesity_level", "vegetables", "protein_intake", "juice", 
    "monday_schedule", "tuesday_schedule", "wednesday_schedule", 
    "thursday_schedule", "friday_schedule", "saturday_schedule", "sunday_schedule"
]

# Simulate the fitting of the one-hot encoder, label encoder, and scaler if they were not saved
# Note: Ideally, you should save and load these components (fit and load from disk) to avoid retraining every time.
# For simplicity, I will demonstrate how they could be fitted from the dataset
# Load the dataset again for the purpose of fitting the preprocessors
dataset_url = 'https://raw.githubusercontent.com/adrielgian99/Bangkit-Capstone-C242-PR593/machine_learning/Clean_Dataset/gym_and_diet_recommendation_clean_dataset.csv'
df = pd.read_csv(dataset_url)

# Fit the one-hot encoder
onehot_encoder.fit(df[categorical_columns1])

# Fit the label encoders
for column in categorical_columns2:
    label_encoder[column] = LabelEncoder()
    label_encoder[column].fit(df[column])

# Fit the scaler
scaler.fit(df[['age', 'height', 'weight', 'BMI']])


@app.route('/predict', methods=['POST'])
def predict():
    # Get the data from the incoming request
    data = request.get_json()

    # Preprocess new data
    new_data = pd.DataFrame(data)

    # One-hot encode categorical columns
    new_data_encoded = onehot_encoder.transform(new_data[categorical_columns1])

    new_data_encoded_df = pd.DataFrame(new_data_encoded, columns=onehot_encoder.get_feature_names(categorical_columns1))

    new_data = pd.concat([new_data.reset_index(drop=True), new_data_encoded_df], axis=1)

    # Label encode user_obesity_level
    new_data["user_obesity_level"] = label_encoder["user_obesity_level"].transform(new_data["user_obesity_level"])

    # Normalize numerical columns
    new_data[['age', 'height', 'weight', 'BMI']] = scaler.transform(new_data[['age', 'height', 'weight', 'BMI']])

    # Prepare features for prediction
    input_columns = ["age", "height", "weight", "BMI", "user_obesity_level"] + new_data_encoded_df.columns.tolist()
    X_new = new_data[input_columns]

    # Make predictions
    predictions = model.predict(X_new)

    # Decode predictions
    decoded_predictions = {}
    output_columns = [
        "vegetables", "protein_intake", "juice", "monday_schedule", "tuesday_schedule", 
        "wednesday_schedule", "thursday_schedule", "friday_schedule", 
        "saturday_schedule", "sunday_schedule"
    ]

    for i, output in enumerate(output_columns):
        decoded_predictions[output] = label_encoder[output].inverse_transform([np.argmax(predictions[i])])[0]

    # Return predictions as a JSON response
    return jsonify(decoded_predictions)


if __name__ == '__main__':
    app.run(debug=True)
