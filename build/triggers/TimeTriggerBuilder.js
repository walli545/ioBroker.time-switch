"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TimeTrigger_1 = require("./TimeTrigger");
const DailyTriggerBuilder_1 = require("./DailyTriggerBuilder");
class TimeTriggerBuilder extends DailyTriggerBuilder_1.DailyTriggerBuilder {
    constructor() {
        super(...arguments);
        this.hour = 0;
        this.minute = 0;
    }
    setHour(hour) {
        this.hour = hour;
        return this;
    }
    setMinute(minute) {
        this.minute = minute;
        return this;
    }
    setAction(action) {
        super.setAction(action);
        return this;
    }
    setId(id) {
        super.setId(id);
        return this;
    }
    setWeekdays(weekdays) {
        super.setWeekdays(weekdays);
        return this;
    }
    build() {
        return new TimeTrigger_1.TimeTrigger(this.getId(), this.hour, this.minute, this.getWeekdays(), this.getAction());
    }
}
exports.TimeTriggerBuilder = TimeTriggerBuilder;
