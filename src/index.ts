import express from "express";
import "dotenv";
import { configDotenv } from "dotenv";
configDotenv();
const app = express();

const PORT = process.env.PORT || 8000;

app.get("/", async (req, res) => {
    res.send("Hello World!!!")
})

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
});