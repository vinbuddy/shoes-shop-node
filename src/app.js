import express from "express";
import env from "dotenv";
import path from "path";
import mongoose from "mongoose";
import expressLayouts from "express-ejs-layouts";
import { fileURLToPath } from "url";
import { dirname } from "path";

import router from "./routes/index.js";

const app = express();
env.config();

const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.set("layout extractScripts", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(PORT, async () => {
    const uri = process.env.MONGODB_URI;
    try {
        await mongoose.connect(uri);
        console.log(`Database connected 🚀`);

        console.log(`running on http://localhost:${PORT}`);
    } catch (error) {
        console.log("error: ", error.message);
        process.exit(1);
    }
});
