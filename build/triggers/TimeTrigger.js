"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseTrigger_1 = require("./BaseTrigger");
class TimeTrigger extends BaseTrigger_1.BaseTrigger {
    constructor(hour, minute, weekdays, action) {
        super(action, weekdays);
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
}
exports.TimeTrigger = TimeTrigger;
