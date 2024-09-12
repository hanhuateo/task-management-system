require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
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
app.use(cookieParser());

const corsOption = {
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
