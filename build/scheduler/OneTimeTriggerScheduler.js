"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneTimeTriggerScheduler = void 0;
const OneTimeTrigger_1 = require("../triggers/OneTimeTrigger");
const TriggerScheduler_1 = require("./TriggerScheduler");
class OneTimeTriggerScheduler extends TriggerScheduler_1.TriggerScheduler {
    constructor(scheduleJob, cancelJob, logger) {
        super();
        this.scheduleJob = scheduleJob;
        this.cancelJob = cancelJob;
        this.logger = logger;
        this.registered = [];
    }
    forType() {
        return OneTimeTrigger_1.OneTimeTrigger.prototype.constructor.name;
    }
    register(trigger) {
        if (this.getAssociatedJob(trigger)) {
            throw new Error('Trigger is already registered.');
        }
        this.logger.logDebug(`Scheduling trigger ${trigger}`);
        const newJob = this.scheduleJob(trigger.getDate(), () => {
            this.logger.logDebug(`Executing trigger ${trigger}`);
            trigger.getAction().execute();
        });
        this.registered.push([trigger, newJob]);
    }
    unregister(trigger) {
        const job = this.getAssociatedJob(trigger);
        if (job) {
            this.cancelJob(job);
            this.removeTrigger(trigger);
        }
        else {
            throw new Error('Trigger is not registered.');
        }
    }
    destroy() {
        this.registered.forEach((r) => this.unregister(r[0]));
    }
    getAssociatedJob(trigger) {
        const entry = this.registered.find((r) => r[0] === trigger);
        if (entry) {
            return entry[1];
        }
        else {
            return null;
        }
    }
    removeTrigger(trigger) {
        this.registered = this.registered.filter((r) => r[0] !== trigger);
    }
}
exports.OneTimeTriggerScheduler = OneTimeTriggerScheduler;
