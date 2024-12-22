import moment, { min } from "moment-timezone";
import { Server, Socket } from "socket.io";
import { setCurrentForPlaylist } from "./cache";
import { IChannel } from "./interfaces/IChannel";
import { IChannelSong } from "./interfaces/IChannelSong";
import { getPlaylist } from "./repo";

const fetch = require("node-fetch");
const CronJob = require("cron").CronJob;

const emitSongChange = async (gsid: number, io: Server): Promise<any> => {
  const playlist = await getPlaylist(gsid);
  const currentSong = await findCurrentSong(gsid);
  setCurrentForPlaylist(gsid, currentSong);

  let promises: Array<Promise<any>> = [];
  playlist &&
    playlist.forEach((song, index) => {
      const date = moment.tz(song.ScheduleTime, "Europe/Warsaw");
      const seconds = date.seconds();
      const minute = date.minutes();
      const hour = date.hour();
      const dayOfTheMonth = date.date();
      const month = date.month();
      const dayOfTheWeek = date.day();

      promises.push(
        scheduleEmition(
          seconds,
          minute,
          hour,
          dayOfTheMonth,
          month,
          dayOfTheWeek,
          song,
          io,
          gsid
        )
      );
    });
  await Promise.all(promises);
};

const scheduleEmition = async (
  seconds: number,
  minute: number,
  hour: number,
  dayOfTheMonth: number,
  month: number,
  dayOfTheWeek: number,
  song: IChannelSong,
  io: Server,
  gsid: number
) => {
  if (song) {
    const job = new CronJob(
      `${seconds} ${minute} ${hour} ${dayOfTheMonth} ${month} ${dayOfTheWeek}`,
      function () {
        setCurrentForPlaylist(gsid, song);
        io.to("channel").emit("song", Object.assign({ gsid: gsid }, song));
        job.stop();
        // console.log(`update of song for gsid ${gsid}`, hour, minute, seconds, song)
      },
      null,
      true,
      "Europe/Warsaw"
    );
    job.start();
  }
};

export const getChannels = async (): Promise<Array<IChannel>> => {
  const response = await fetch(
    `https://mobileapigate.azurewebsites.net/mobile/api/schedules/channels`
  );
  const data = await response.json();
  return data;
};

export const findCurrentSong = async (gsid: number): Promise<IChannelSong> => {
  const now = moment.tz(new Date(), "Europe/Warsaw");
  const playlist = await getPlaylist(gsid);
  const currentSong =
    playlist &&
    playlist.filter(
      (song, indx, songs) =>
        moment.tz(song.ScheduleTime, "Europe/Warsaw") < now &&
        moment.tz(songs[indx + 1].ScheduleTime, "Europe/Warsaw") > now
    )[0];

  // console.log(`current song for ${gsid}`, currentSong.ScheduleTime)

  return currentSong;
};

export const setupPlaylists = async (io: Server) => {
  let promises: Array<Promise<any>> = [];
  const channels = await getChannels();

  channels.forEach((channel) => {
    promises.push(emitSongChange(channel.gsid, io));
  });

  await Promise.all(promises).catch((err) =>
    console.error(`Set Up Playlists ${err}`)
  );
};
