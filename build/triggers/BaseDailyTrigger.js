"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDailyTrigger = void 0;
class BaseDailyTrigger {
    constructor(id, action, weekdays) {
        if (id == null) {
            throw new Error('Id may not be null or undefined.');
        }
        if (action == null) {
            throw new Error('Action may not be null or undefined.');
        }
        this.checkWeekdays(weekdays);
        this.weekdays = weekdays;
        this.action = action;
        this.id = id;
    }
    getWeekdays() {
        return this.weekdays;
    }
    getAction() {
        return this.action;
    }
    setAction(action) {
        if (action == null) {
            throw new Error('Action may not be null or undefined.');
        }
        this.action = action;
    }
    getId() {
        return this.id;
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
exports.BaseDailyTrigger = BaseDailyTrigger;
