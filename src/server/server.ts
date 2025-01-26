import express, { Request, Response, NextFunction } from "express";
import http from "http";
import bodyParser from "body-parser";
import session from "express-session";
import mongoose from "mongoose";
import path from "path";
import * as socketManager from "./socket";
const api = require("./api");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const mongoConnectionURL = process.env.mongoURL || "mongodb://localhost:27017";
const databaseName = process.env.dbName || "Cluster0";

// connect to mongodb
mongoose
  .connect(mongoConnectionURL, {
    dbName: databaseName,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: Error) => console.log(`Error connecting to MongoDB: ${err}`));

nextApp.prepare().then(() => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(
    session({
      secret: "your_secret_key",
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use("/api", api);

  // Let Next.js handle all other routes
  app.all("*", (req: Request, res: Response) => {
    return handle(req, res);
  });

  const server = http.createServer(app);
  socketManager.init(server);

  server.listen(3000, () => {
    console.log(`Server running on port: 3000`);
  });
});

export default nextApp;
