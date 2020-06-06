"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AstroTrigger_1 = require("./AstroTrigger");
class AstroTriggerBuilder {
    constructor() {
        this.action = null;
        this.id = '0';
        this.astroTime = null;
        this.shift = 0;
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
    setAstroTime(astroTime) {
        this.astroTime = astroTime;
        return this;
    }
    setShift(shift) {
        this.shift = shift;
        return this;
    }
    setWeekdays(weekdays) {
        this.weekdays = weekdays;
        return this;
    }
    build() {
        return new AstroTrigger_1.AstroTrigger(this.id, this.astroTime, this.shift, this.weekdays, this.action);
    }
}
exports.AstroTriggerBuilder = AstroTriggerBuilder;
