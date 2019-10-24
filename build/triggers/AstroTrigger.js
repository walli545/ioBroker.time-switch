"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseTrigger_1 = require("./BaseTrigger");
class AstroTrigger extends BaseTrigger_1.BaseTrigger {
    constructor(astroTime, shiftInMinutes, weekdays) {
        super(weekdays);
        if (astroTime == null) {
            throw new Error('Astro time may not be null.');
        }
        if (shiftInMinutes > AstroTrigger.MAX_SHIFT || shiftInMinutes < -AstroTrigger.MAX_SHIFT) {
            throw new Error('Shift in minutes must be in range -600 to 600.');
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
AstroTrigger.MAX_SHIFT = 600;
