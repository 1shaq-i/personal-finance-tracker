// 4EqO6JDhOqd4Y7eJ
import express, { Express } from "express";
import mongoose from "mongoose";
import financialRecordRouter from './routes/financial-records'

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const mongoURI: string = "mongodb+srv://ishaqahmed:4EqO6JDhOqd4Y7eJ@personalfinancetracker.8trwffj.mongodb.net/";

mongoose.connect(mongoURI).then(() => console.log("Connected to MongoDB")).catch((err) => console.error("Failed to connect to MongoDB:", err));

app.use("/financial-records", financialRecordRouter);

app.listen(port, () => {
    console.log(`Server Running on Port ${port}`);
});