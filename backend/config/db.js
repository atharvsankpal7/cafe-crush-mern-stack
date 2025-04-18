import { Db } from "mongodb";
import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect("mongodb+srv://CafeCrush:12345@cluster0.qiu3t.mongodb.net/food-del")
    .then((host) => console.log("DB Connected on port", host.connection.host));
};

// add your mongoDB connection string above.
// Do not use '@' symbol in your databse user's password else it will show an error.
