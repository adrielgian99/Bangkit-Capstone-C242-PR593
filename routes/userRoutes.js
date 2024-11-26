const express = require("express");
const router = express.Router();

const users = [
    { id: 1, name: "John Doe", email: "johndoe@example.com", bmi: 24.5 },
    { id: 2, name: "Jane Doe", email: "janedoe@example.com", bmi: 27.2 }
];

// GET: Ambil semua pengguna
router.get("/", (req, res) => {
    res.status(200).json(users);
});

// POST: Tambah pengguna baru
router.post("/", (req, res) => {
    const { name, email, bmi } = req.body;

    if (!name || !email || !bmi) {
        return res.status(400).json({ message: "Semua data harus diisi!" });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        bmi
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

module.exports = router;
