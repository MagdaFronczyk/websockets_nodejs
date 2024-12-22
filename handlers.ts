import { Server } from "socket.io";
import { currentForPlaylist, currentForProgram, playlists } from "./cache";
import { ANTENAS } from "./constants/antenas";
import { getChannels } from "./songs";

//Current songs emition
export const emitAllCurrentSongs = async (io: Server): Promise<any> => {
  let promises: Array<Promise<any>> = [];
  const channels = await getChannels();
  channels.forEach((channel) => {
    promises.push(emitCurrentSong(channel.gsid, io));
  });
  await Promise.all(promises).catch((err) =>
    console.error(`emit all current songs ${err}`)
  );
};

const emitCurrentSong = async (gsid: number, io: Server): Promise<any> => {
  const current = currentForPlaylist(gsid);
  current &&
    io
      .to("channel")
      .emit("currentSong", Object.assign({ gsid: gsid }, current));
};

//Current programs emition
export const emitAllCurrentPrograms = async (io: Server): Promise<any> => {
  console.log("Emit All Current Programs");
  let promises: Array<Promise<any>> = [];
  ANTENAS.forEach((antena, i) => {
    console.log(i);
    promises.push(emitCurrentProgram(antena.id, io));
  });
  await Promise.all(promises).catch((err) =>
    console.error(`emit all current programs ${err}`)
  );
};

const emitCurrentProgram = async (
  antenaId: number,
  io: Server
): Promise<any> => {
  const current = currentForProgram(antenaId);
  if (current) {
    if (antenaId === 4 || antenaId === 6) {
      io.to("schedule").to("video").emit("currentProgram", current);
    } else {
      console.log("emit current program", current);
      io.to("schedule").emit("currentProgram", current);
    }
  }
};
