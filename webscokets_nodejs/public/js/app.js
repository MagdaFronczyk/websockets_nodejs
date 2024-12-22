const socket = io({
  reconnectionAttempts: 4,
});

document.addEventListener("DOMContentLoaded", function () {
  socket.connect();

  socket.on("connect", () => {
    console.log("Connected to client (❁´◡`❁)");
    socket.emit("room", "channel");
    socket.emit("room", "schedule");
    socket.emit("room", "video");
  });

  // socket.on("song", (data) => {
  //     console.log("Song change (☞ﾟヮﾟ)☞", data);
  // });

  // socket.on("currentSong", (data) => {
  //     console.log("Current song (☞ﾟヮﾟ)☞", data);
  // });

  socket.on("program", (data) => {
    console.log("Program change (☞ﾟヮﾟ)☞", data);
  });

  socket.on("currentProgram", (data) => {
    console.log("Current program (☞ﾟヮﾟ)☞", data);
  });

  socket.io.on("error", () => {
    console.log("ಥ_ಥ error");
  });

  socket.on("connect_error", () => {
    console.log("ಥ_ಥ connect error");
  });

  socket.io.on("reconnect_failed", () => {
    console.log("ಥ_ಥ reconnect failed");
  });
});
