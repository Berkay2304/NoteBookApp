const path = require('path');
const authRoutes = require('./routes/auth');     //  POST /auth/…
const noteRoutes = require('./routes/notes');    //  GET /notes, POST /notes, …

require("dotenv").config(); //.env dosyasını okuyoruz

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json()); //json gövdelerini parse etmemizi sağlıyor
app.use("/auth", authRoutes);
app.use(noteRoutes);
//MongoDB Bağlantısı
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("App has connected to mongoDB succesfully."))
    .catch((err) => {
        console.error("An database connection error has occured.")
        process.exit(1);
    });

// Test-Route    
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use(express.static('public'));
//Sunucuyu Başlatma
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server has working on port ${PORT}.`)
});