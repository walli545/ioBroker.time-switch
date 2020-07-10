"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroTrigger = void 0;
const BaseDailyTrigger_1 = require("./BaseDailyTrigger");
class AstroTrigger extends BaseDailyTrigger_1.BaseDailyTrigger {
    constructor(id, astroTime, shiftInMinutes, weekdays, action) {
        super(id, action, weekdays);
        if (astroTime == null) {
            throw new Error('Astro time may not be null.');
        }
        if (shiftInMinutes == null ||
            shiftInMinutes > AstroTrigger.MAX_SHIFT ||
            shiftInMinutes < -AstroTrigger.MAX_SHIFT) {
            throw new Error('Shift in minutes must be in range -120 to 120.');
        }
        this.astroTime = astroTime;
        this.shiftInMinutes = shiftInMinutes;
    }
    getAstroTime() {
        return this.astroTime;
    }
    getShiftInMinutes() {
        return this.shiftInMinutes;
    }
}
exports.AstroTrigger = AstroTrigger;
AstroTrigger.MAX_SHIFT = 120;
