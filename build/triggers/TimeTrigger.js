"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeTrigger = void 0;
const BaseDailyTrigger_1 = require("./BaseDailyTrigger");
class TimeTrigger extends BaseDailyTrigger_1.BaseDailyTrigger {
    constructor(id, hour, minute, weekdays, action) {
        super(id, action, weekdays);
        if (hour == undefined || hour < 0 || hour > 23) {
            throw new Error('Hour must be in range 0-23.');
        }
        if (minute == undefined || minute < 0 || minute > 59) {
            throw new Error('Minute must be in range 0-59.');
        }
        this.hours = hour;
        this.minutes = minute;
    }
    getHour() {
        return this.hours;
    }
    getMinute() {
        return this.minutes;
    }
    toString() {
        return (`TimeTrigger {id=${this.getId()}, hour=${this.getHour()},` +
            ` minute=${this.getMinute()}, weekdays=[${this.getWeekdays()}]}`);
    }
}
exports.TimeTrigger = TimeTrigger;
