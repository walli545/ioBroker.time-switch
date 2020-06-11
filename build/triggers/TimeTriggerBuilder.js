"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeTriggerBuilder = void 0;
const TimeTrigger_1 = require("./TimeTrigger");
class TimeTriggerBuilder {
    constructor() {
        this.action = null;
        this.id = '0';
        this.hour = 0;
        this.minute = 0;
        this.weekdays = [];
    }
    setAction(action) {
        this.action = action;
        return this;
    }
    setId(id) {
        this.id = id;
        return this;
    }
    setHour(hour) {
        this.hour = hour;
        return this;
    }
    setMinute(minute) {
        this.minute = minute;
        return this;
    }
    setWeekdays(weekdays) {
        this.weekdays = weekdays;
        return this;
    }
    build() {
        return new TimeTrigger_1.TimeTrigger(this.id, this.hour, this.minute, this.weekdays, this.action);
    }
}
exports.TimeTriggerBuilder = TimeTriggerBuilder;
