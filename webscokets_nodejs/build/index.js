"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var moment = require("moment");
const exphbs = require("express-handlebars");
let database = require("./db/config").db;
const fs = require("fs").promises;
// rest of the code remains same
const app = express_1.default();
const PORT = 8787;
console.warn(database);
/**
 * Views are just for testing
 */
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express_1.default.static("public"));
app.get("/", (req, res) => {
    return res.render("home");
});
const server = app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
var io = require("socket.io").listen(server);
io.on("connection", (socket) => {
    console.log("a user connected");
});
const writeScheduleToJson = (schedule, antena) => __awaiter(void 0, void 0, void 0, function* () {
    let date = moment(new Date()).format("YYYY-MM-DD");
    const file = fs.writeFile(`schedules/${antena}_schedule_${date}.json`, JSON.stringify(schedule));
    return file;
});
const getDailySchedule = (antena) => __awaiter(void 0, void 0, void 0, function* () {
    let date = moment(new Date()).format("YYYY-MM-DD");
    const collection = database.collection("schedule_antena_day");
    const doc = collection.doc(`${antena}_${date}`);
    const data = yield doc
        .collection("antena_day_programs")
        .orderBy("StartHour", "asc")
        .get();
    let schedule = [];
    data.forEach((program) => {
        schedule = [...schedule, program.data()];
    });
    return schedule;
});
const writeDailyScheduleToJson = (antena) => __awaiter(void 0, void 0, void 0, function* () {
    const dailySchedule = yield getDailySchedule(antena);
    return writeScheduleToJson(dailySchedule, antena);
});
const test = () => __awaiter(void 0, void 0, void 0, function* () {
    yield writeDailyScheduleToJson(3);
});
test()
    .then(() => console.log("vnice!💘"))
    .catch((err) => console.log("not nice at all...😱"));
