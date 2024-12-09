# Gunakan image dasar Python 3.7
FROM python:3.7-slim

# Setel direktori kerja di dalam container
WORKDIR /app

# Menyalin file model.h5 dan server.py ke dalam container
COPY . .

# Install dependencies
RUN pip install --no-cache-dir pandas numpy tensorflow scikit-learn flask

# Tentukan port yang akan digunakan
EXPOSE 8080

# Jalankan server Flask
CMD ["python", "server.py"]
