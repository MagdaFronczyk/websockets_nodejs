import { IChannelSong } from "./interfaces/IChannelSong"
import { IProgram } from "./interfaces/IProgram";
import { IProgramMapped } from "./interfaces/IProgramMapped";
const fetch = require("node-fetch")
const CronJob = require("cron").CronJob;
import moment from "moment";


export const getSchedule = async (antenaId: number): Promise<Array<IProgramMapped>> => {
  const schedule = await getDailySchedule(antenaId);
  const validatedSchedule = await validateSchedule(schedule, antenaId)
  return validatedSchedule;
}
export const getPlaylist = async (channelId: number): Promise<Array<IChannelSong>> => {
  const playlist = await getDailyPlaylist(channelId);

  const validatedPlaylist = await validatePlaylist(playlist, channelId);
  return validatedPlaylist;

}

const getDailyPlaylist = async (gsid: number): Promise<Array<IChannelSong>> => {
  const response = await fetch(`https://mobileapigate.azurewebsites.net/mobile/api/schedules/playlists?channel&key=d590cafd-31c0-4eef-b102-d88ee2341b1a&mobilestationid=${gsid}`)
  const data: { Playlist: boolean, Songs: Array<IChannelSong> } = await response.json()
  return data.Songs;
}

const playlistHasRequiredProperies = (playlist: Array<IChannelSong>): boolean => {
  const songProperties: Array<string> = [
    "Id",
    "Title",
    "Artist",
    "ScheduleTime",
    "Image"
  ];
  return playlist.length > 0 && playlist.every((song) => {
    return songProperties.every((property) => {
      return song.hasOwnProperty(property);
    });
  })
}

const validatePlaylist = (
  playlist: Array<IChannelSong>,
  gsid: number
): Promise<Array<IChannelSong>> => {
  return new Promise((resolve, reject) => {
    if (
      !playlistHasRequiredProperies(playlist)
    ) {
      reject(
        new Error(`Playlist for channel with gsid ${gsid} hasn't got all necessary properties or is empty`)
      );
    } else {
      return resolve(playlist);
    }
  });
};

const getDailyScheduleChopin = async (): Promise<Array<IProgram>> => {
  const date = moment.tz(new Date(), 'Europe/Warsaw').format('YYYY-MM-DD')
  const res = await fetch(
    `https://miniramowka.polskieradio.pl/Schedule/GetByDate?Id=3&Date=${date}`
  );
  const data = await res.json();
  return data.Data.Schedule;
}

const getDailySchedule = async (antenaId: number): Promise<Array<IProgram>> => {
  const date = moment.tz(new Date(), 'Europe/Warsaw').format('YYYY-MM-DD')
  if (antenaId === 10) {
    return await getDailyScheduleChopin()
  }
  const response = await fetch(`http://apipr.polskieradio.pl/api/schedule?Program=${antenaId}&SelectedDate=${date}`)
  const data: {
    Schedule: Array<IProgram>, WeekDay: number,
    ScheduleDay: string
  } = await response.json()

  return data.Schedule;
};

const fixIds = (program: IProgram) => {
  if (program.AntenaId === 9) {
    program.AntenaId = 11
  } else if (program.AntenaId === 8) {
    program.AntenaId = 9
  } else if (program.AntenaId === 11) { program.AntenaId = 12 } else return program;
}

const scheduleHasRequiredProperies = (schedule: Array<IProgram>): boolean => {
  const programProperties: Array<string> = [
    "ArticleLink",
    "AntenaId",
    "Id",
    "Title",
    "Description",
    "Category",
    "Photo",
    "StartHour",
    "StopHour",
    "Sounds",
    "Leaders",
  ];
  return schedule.length > 0 && schedule.every((program) => {
    return programProperties.every((property) => {
      return program.hasOwnProperty(property);
    });
  });
}

const validateSchedule = (schedule: Array<IProgram>, antena: number): Promise<Array<IProgramMapped>> => {
  return new Promise((resolve, reject) => {
    if (!scheduleHasRequiredProperies(schedule)) {
      return reject(new Error(`Schedule for antena with id ${antena} hasn't got all necessary properties or is empty`));
    }
    /*
     * fixes incosistency of ids for "РАДИО ПОЛЬША" and "Polskie Radio Dzieciom"
    */
    schedule.map(fixIds)

    /*
    * changes StartHour and StopHour to unix
   */

    const scheduleMapped: Array<IProgramMapped> = schedule.map((program) => {
      return {
        ...program,
        StartHour: {
          _seconds: moment.tz(program.StartHour, 'Europe/Warsaw').unix()
        },
        StopHour: {
          _seconds: moment.tz(program.StopHour, 'Europe/Warsaw').unix()
        },
      }
    });

    /*
    * patches missing programs
   */

    let schedulePatched: Array<IProgramMapped> = [];

    for (let index = 1; index < scheduleMapped.length; index++) {
      const current = scheduleMapped[index];
      const previous = scheduleMapped[index - 1];
      if (previous.StopHour._seconds * 1000 < current.StartHour._seconds * 1000) {
        let patch = scheduleMapped.filter(program => program.StopHour._seconds * 1000 === current.StartHour._seconds * 10000)[0]
        if (patch === undefined) {
          patch = {
            ...previous,
            StartHour: previous.StopHour,
            StopHour: current.StartHour
          }
        }
        schedulePatched.push(previous, patch)

      } else {
        schedulePatched.push(previous)
      }
    }

    return resolve(schedulePatched);
  });
};


export const rescheduleJobs = (
  rescheduledJob: Function
) => {
  const job = new CronJob(
    `0 5 1 * * *`,
    rescheduledJob,
    null,
    true,
    "Europe/Warsaw"
  );
  job.start();
};
