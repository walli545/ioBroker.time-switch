"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseTrigger {
    constructor(action, weekdays) {
        if (action == null) {
            throw new Error('Action may not be null or undefined.');
        }
        this.checkWeekdays(weekdays);
        this.weekdays = weekdays;
        this.action = action;
    }
    trigger() {
        this.getAction().execute();
    }
    getWeekdays() {
        return this.weekdays;
    }
    getAction() {
        return this.action;
    }
    checkWeekdays(weekdays) {
        if (weekdays == null) {
            throw new Error('Weekdays may not be null or undefined.');
        }
        if (weekdays.length <= 0 || weekdays.length > 7) {
            throw new Error('Weekdays length must be in range 1-7.');
        }
        if (this.hasDuplicates(weekdays)) {
            throw new Error('Weekdays may not contain duplicates.');
        }
    }
    hasDuplicates(weekdays) {
        return new Set(weekdays).size !== weekdays.length;
    }
}
exports.BaseTrigger = BaseTrigger;
