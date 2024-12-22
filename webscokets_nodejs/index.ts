import { Socket, Server } from "socket.io";
import { setupPrograms } from "./programs";
import { emitAllCurrentPrograms, emitAllCurrentSongs } from "./handlers";
import { setupPlaylists } from "./songs";
import { rescheduleJobs } from "./repo";
import { createServer } from "http";

const healthcheck = require("./healthcheck/index");
const express = require("express");
const app = express();
const port = 8787;
const httpServer = createServer(app);
httpServer.listen(port, function () {
  console.log(`Connected to server ╰(*°▽°*)╯ port: ${port}`);
});

app.use(express.static("public"));
app.use("/", healthcheck);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  maxHttpBufferSize: 1e8,
});

setupPrograms(io);
setupPlaylists(io);

io.on("connection", async function (socket: Socket) {
  console.log(`client ${socket.id} connected`);

  socket.on("room", async (room: string) => {
    await socket.join(room);
    console.log(`client ${socket.id} joined ${room}`);
    await emitAllCurrentSongs(io);
    await emitAllCurrentPrograms(io);
  });

  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        console.log(`client ${socket.id} left ${room}`);
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`client ${socket.id} disconnected`);
  });
});

rescheduleJobs(() => {
  setupPlaylists(io);
  console.log("rescheduled");
});
rescheduleJobs(() => {
  setupPrograms(io);
  console.log("rescheduled");
});
