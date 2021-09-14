const express = require("express");
const socketio = require("socket.io");
const http = require("http");

// 1. SETTING UP EXPRESS SERVER
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  wsEngine: "ws",
});
const port = process.env.PORT || 9000;
const mongoose = require("mongoose");

// 2. INCLUDE ROUTES
const ordersRoute = require("./routes/orders-route");
const usersRoute = require("./routes/user-route");
const messageRoute = require("./routes/messages-route");
const storesRoute = require("./routes/stores-route");
const discordRoute = require("./routes/discord-route");

// CONTROLLERS
const messageController = require("./controllers/messages-controller");
const orderController = require("./controllers/orders-controller");
const discordbot = require("./controllers/discord/boot");
const HttpError = require("./models/http-error");
const user = require("./models/user");

//3. CONNECT TO MONGODB
const mongoDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.t6c6u.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to DB");
});

//mongoose.set('debug', true);

console.log(process.env);

// 4. SET MIDDLEWARES
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-Width, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// 5. SET ROUTES
app.use("/api/orders", ordersRoute);
app.use("/api/users", usersRoute);
app.use("/api/messages", messageRoute);
app.use("/api/stores", storesRoute);
app.use("/api/discord", discordRoute);

app.use((req, res, next) => {
  const error = new HttpError("Could not find route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown Error Occurred" });
});

// SOCKET IO

// 6. SOCKET IO CONNETION DATA
io.on("connection", (socket) => {
  socket.on("join", (data) => {
    let messages = messageController
      .getMessagesByOid(data.oid)
      .then((result) => {
        result.map((message) => {
          socket.emit("message", {
            oid: message.oid,
            user: message.author,
            text: message.message,
            timestamp: message.timestamp,
          });
        });
      });
  });

  // 6a. DISCONNECT SOCKET
  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });

  // 7. MESSAGE SOCKETS
  // 7a. MESSAGE SENDING SOCKET
  socket.on("sendMessage", (message, callback) => {
    messageController.addMessage(message);
    const refunderData = orderController
      .getRefunder(message.oid)
      .then((result) => {
        console.log(result.refunder);
        data = {
          refundertag: "Potayto#8327",
          ticketnum: message.oid,
          messagecontent: message.message,
        };
        discordbot.sendMessage(data);
      });
    io.emit("message", {
      oid: message.oid,
      user: message.user,
      text: message.message,
      timestamp: message.timestamp,
    });

    callback();
  });
});

// 8. DISCORD BOT

discordbot.login();

// 8. SERVER START
server.listen(port, () => {
  console.log("Server Online on Port: " + port);
});
