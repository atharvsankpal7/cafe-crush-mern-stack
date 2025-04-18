import express  from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import staffRouter from "./routes/staffRoute.js";
import salesRouter from "./routes/salesRoutes.js";
import stockRouter from "./routes/stockRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js"
import reviewRouter from "./routes/reviewRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000;

// middlewares
app.use(cors(
    {
        origin:"*"
    }
))
app.use(express.json({limit: '100mb'}))
app.use(express.urlencoded({limit: '100mb', extended: true}))

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/staff", staffRouter)
app.use("/api/sales", salesRouter)
app.use("/api/stock", stockRouter)
app.use("/api/restaurant", restaurantRouter)
app.use("/api/review", reviewRouter)

app.get("/", (req, res) => {
    res.send("API Working")
});

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))