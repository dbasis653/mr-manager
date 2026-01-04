import express from "express";
import cors from "cors";

const app = express();

//BASIC EXPRESS CONFIGURATION
app.use(express.json({ limit: "16kb" }));
//to SUPPORT JSON
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
//for data coming through url like %$# in some url
//to SUPPORT IT
app.use(express.static("public"));
//to make "public" folder globally visible

//CORS CONFIGURATION
//where my FONTEND LIES
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    //what kind of HEADER is allowed
  }),
);

//import ROUTE
import healthCheckRouter from "./routes/healthcheck.routes.js";

app.use("/api/v1/healthcheck.js", healthCheckRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the BETA");
});

export default app;
