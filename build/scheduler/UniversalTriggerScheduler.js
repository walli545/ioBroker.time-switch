"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalTriggerScheduler = void 0;
const TriggerScheduler_1 = require("./TriggerScheduler");
class UniversalTriggerScheduler extends TriggerScheduler_1.TriggerScheduler {
    constructor(schedulers) {
        super();
        this.schedulers = schedulers;
    }
    register(trigger) {
        const scheduler = this.schedulers.find((s) => s.forType() === trigger.constructor.name);
        if (scheduler) {
            return scheduler.register(trigger);
        }
        else {
            throw new Error(`No scheduler for trigger of type ${trigger.constructor.name} found`);
        }
    }
    unregister(trigger) {
        const scheduler = this.schedulers.find((s) => s.forType() === trigger.constructor.name);
        if (scheduler) {
            return scheduler.unregister(trigger);
        }
        else {
            throw new Error(`No scheduler for trigger of type ${trigger.constructor.name} found`);
        }
    }
    destroy() {
        this.schedulers.forEach((s) => s.destroy());
    }
    forType() {
        return 'Universal';
    }
}
exports.UniversalTriggerScheduler = UniversalTriggerScheduler;
