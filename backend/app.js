require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors")


// importing routes
const auth = require("./routes/auth");

// const errorMiddleware = require("./middlewares/errors");
// const ErrorHandler = require("./utils/errorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

const code = {
	auth01: "A001", // invalid credentials
	auth02: "A002", // user is not active
	auth03: "A003", // user does not have permission
	payload01: "P001", // mandatory keys missing
	payload02: "P002", // invalid values
	payload03: "P003", // value out of range
	payload04: "P004", // task state error
    url01: "U001", // url is incorrect
    success01: "S001", // no errors, successful
    error01: "E001" // general error
};

const corsOption = {
    credentials: true,
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
}
app.use(cors(corsOption));

app.use("/api/task", auth);

// handle unhandled routes
app.use((req, res, next) => {
    // next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
    return res.status(400).json({ code: code.url01 });
});

// app.use(errorMiddleware);


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(
        `Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
    );
});
