"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroTrigger = void 0;
const BaseDailyTrigger_1 = require("./BaseDailyTrigger");
let AstroTrigger = /** @class */ (() => {
    class AstroTrigger extends BaseDailyTrigger_1.BaseDailyTrigger {
        constructor(id, astroTime, shiftInMinutes, weekdays, action) {
            super(id, action, weekdays);
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
    AstroTrigger.MAX_SHIFT = 600;
    return AstroTrigger;
})();
exports.AstroTrigger = AstroTrigger;
