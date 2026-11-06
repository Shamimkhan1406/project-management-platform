import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
    path: "./.env",
});

import app from "./app.js";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
    console.log(`server is listening on port http://localhost:${PORT}`);
})
}).catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with failure
})