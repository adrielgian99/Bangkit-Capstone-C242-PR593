const { Firestore } = require('@google-cloud/firestore');

async function storeData(id, data) {
    const db = new Firestore();

    // Mengakses collection user_account
    const userCollection = db.collection('user_account');

    // Menyimpan data ke dalam document dengan ID tertentu
    return userCollection.doc(id).set(data);
}

module.exports = storeData;
