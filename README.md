# Obesicheck - Obesity Chekers - Machine Learning
## Bangkit Capstone Project 2024

Bangkit Capstone Team ID : C242-PR593 <br>
Here is our repository for the Bangkit 2024 Batch 2 Capstone Project - Machine Learning.

## DESCRIPTION
Our capstone project used 2 machine learning models, the first model was used to predict a person's obesity level based on their eating habits and physical condition, such as how often they eat high-calorie foods, usually eat vegetables or not, how many main meals they have daily, how much water they have daily, how often they have physical activity, how much time they use technological devices, and etc. Then for the second model is used to provide suggestions or recommendations for vegetables, protein intake, juice, and activities carried out in one week based on the predicted results of the person's obesity level.

## METHOD
Model 1 for predict obesity level using classification model with Neural Networks.

Model 2 for give recommendation food and activity using multi-label classification model with Neural Networks.

## TOOLS
- Python
- TensorFlow
- NumPy
- Pandas
- Matplotlib
- Scikit-Learn
- json
- Google Colab

## DATASET
For the dataset that we use in this capstone project is sourced from Kaggle.

[Dataset Model 1](https://www.kaggle.com/datasets/fatemehmehrparvar/obesity-levels)

[Dataset Model 2](https://www.kaggle.com/datasets/manohar025/gym-and-diet-recommendation)

For the second model dataset, we adjust it by dividing the activity data into days based on the source of American College of Sports Medicine (ACSM). ACSM recommend that to promote and maintain health, all healthy adults aged 18 to 65 years need:
- Do moderately intense cardio 30 minutes a day, 5 days a week.
- Do vigorously intense cardio 20 minutes a day, 3 days a week.
- Do 8-10 strength training exercises, 8-12 repetitions of each exercise twice a week.

[American College of Sports Medicine (ACSM) Paper](https://worksafe.public-health.uiowa.edu/pubs/bulletin/Physical-Activity-Healthy-Adults-%20ACSM%20-AHA.pdf)

## HOW TO USE THE MODEL
The way the first machine learning model works is that users fill out surveys such as:
- Gender
- Age
- Height
- Weight
- Has a family member suffered or suffers from overweight?
- Do you eat high caloric food frequently?
- Do you usually eat vegetables in your meals?
- How many main meals do you have daily?
- Do you eat any food between meals?
- Do you smoke?
- How much water do you drink daily?
- Do you monitor the calories you eat daily?
- How often do you have physical activity?
- How much time do you use technological devices such as cell phone, videogames, television, computer and others?
- How often do you drink alcohol?
- Which transportation do you usually use?

based on the results of the survey will produce a prediction of the obesity level of the user.

Then for how the second machine learning model works, users fill out the survey again, such as:
- Gender, Age, Height, Weight, and BMI (the user does not need to fill in the data because it has been filled in the first survey)
- User Obesity Level (based on results from the first model)
- Hypertension Status
- Diabetes Status
- Fitness Goal (Weight Gain/Weight Loss)
- Fitness Type (Cardio Fitness/Muscular Fitness)

based on the results of the second survey will produce recommendations for vegetables, protein intake, juice, and activities that must be done in a week.

## DEPLOYMENT 
We use TensorFlow.js to deploy a trained Machine Learning model.
