"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DailyTriggerBuilder {
    constructor() {
        this.action = null;
        this.id = '0';
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
    setWeekdays(weekdays) {
        this.weekdays = weekdays;
        return this;
    }
    getAction() {
        return this.action;
    }
    getWeekdays() {
        return this.weekdays;
    }
    getId() {
        return this.id;
    }
}
exports.DailyTriggerBuilder = DailyTriggerBuilder;
