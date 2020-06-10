"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AstroTrigger_1 = require("./AstroTrigger");
const DailyTriggerBuilder_1 = require("./DailyTriggerBuilder");
class AstroTriggerBuilder extends DailyTriggerBuilder_1.DailyTriggerBuilder {
    constructor() {
        super(...arguments);
        this.astroTime = null;
        this.shift = 0;
    }
    setAstroTime(astroTime) {
        this.astroTime = astroTime;
        return this;
    }
    setShift(shift) {
        this.shift = shift;
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
        return new AstroTrigger_1.AstroTrigger(this.getId(), this.astroTime, this.shift, this.getWeekdays(), this.getAction());
    }
}
exports.AstroTriggerBuilder = AstroTriggerBuilder;
