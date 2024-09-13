require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors")


// importing routes
const users = require("./routes/users");
const group = require("./routes/group");
const auth = require("./routes/auth");

const errorMiddleware = require("./middlewares/errors");
const ErrorHandler = require("./utils/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}
}))
app.use(cookieParser());

const corsOption = {
    credentials: true,
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
}
app.use(cors(corsOption));

app.use("/users", users);
app.use("/group", group);
app.use("/auth", auth);

// handle unhandled routes
app.all("*", (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

app.use(errorMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(
        `Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
    );
});
