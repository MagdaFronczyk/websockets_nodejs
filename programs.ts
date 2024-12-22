import moment from "moment-timezone";
import { Server } from "socket.io";
import { setCurrentForProgram } from "./cache";
import { ANTENAS } from "./constants/antenas";
import { IProgramMapped } from "./interfaces/IProgramMapped";
import { getSchedule } from "./repo";

const CronJob = require("cron").CronJob;

const emitProgramChange = async (
  antenaId: number,
  io: Server
): Promise<any> => {
  const schedule = await getSchedule(antenaId);
  const currentProgram = await findCurrentProgram(antenaId);
  setCurrentForProgram(antenaId, currentProgram);
  let promises: Array<Promise<any>> = [];

  // if (antenaId === 1) {
  //   console.log(antenaId, schedule)
  // }

  schedule.forEach((program, index) => {
    const date = moment.tz(program.StartHour._seconds * 1000, "Europe/Warsaw");
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
        program,
        io
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
  program: IProgramMapped,
  io: any
) => {
  if (program) {
    const job = new CronJob(
      `${seconds} ${minute} ${hour} ${dayOfTheMonth} ${month} ${dayOfTheWeek}`,
      function () {
        setCurrentForProgram(program.AntenaId, program);
        if (program.AntenaId === 4 || program.AntenaId === 6) {
          io.to("schedule").to("video").emit("program", program);
        } else {
          io.to("schedule").emit("program", program);
        }
        job.stop();
        // console.log(`update program for id ${program.AntenaId}`, program, program.StartHour)
      },
      null,
      true,
      "Europe/Warsaw"
    );
    job.start();
  }
};

const findCurrentProgram = async (
  antenaId: number
): Promise<IProgramMapped> => {
  const now = moment.tz(new Date().getTime(), "Europe/Warsaw");
  const schedule = await getSchedule(antenaId);
  if (antenaId === 10) {
    // console.log('🎀', moment.tz(schedule[0].StartHour._seconds * 1000, 'Europe/Warsaw'), now)
  }
  const pastAndActivePrograms =
    schedule &&
    schedule.filter((program) => {
      return (
        moment.tz(program.StartHour._seconds * 1000, "Europe/Warsaw") <= now &&
        moment.tz(program.StopHour._seconds * 1000, "Europe/Warsaw") > now
      );
    });
  const currentProgram = pastAndActivePrograms[0];
  // console.log(currentProgram.Title)
  return currentProgram;
};
export const setupPrograms = async (io: Server) => {
  let promises: Array<Promise<any>> = [];
  ANTENAS.forEach((antena) => {
    promises.push(emitProgramChange(antena.id, io));
  });
  await Promise.all(promises).catch((err) =>
    console.error(`set up programs ${err}`)
  );
};
