"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeTriggerScheduler = void 0;
const node_schedule_1 = require("node-schedule");
const TimeTrigger_1 = require("../triggers/TimeTrigger");
const TriggerScheduler_1 = require("./TriggerScheduler");
class TimeTriggerScheduler extends TriggerScheduler_1.TriggerScheduler {
    constructor(scheduleJob, cancelJob, logger) {
        super();
        this.scheduleJob = scheduleJob;
        this.cancelJob = cancelJob;
        this.logger = logger;
        this.registered = [];
    }
    register(trigger) {
        this.logger.logDebug(`Register trigger ${trigger}`);
        if (this.getAssociatedJob(trigger)) {
            throw new Error(`Trigger ${trigger} is already registered.`);
        }
        const newJob = this.scheduleJob(this.createRecurrenceRule(trigger), () => {
            this.logger.logDebug(`Executing trigger ${trigger}`);
            trigger.getAction().execute();
        });
        this.registered.push([trigger, newJob]);
    }
    unregister(trigger) {
        this.logger.logDebug(`Unregister trigger ${trigger}`);
        const job = this.getAssociatedJob(trigger);
        if (job) {
            this.cancelJob(job);
            this.removeTrigger(trigger);
        }
        else {
            throw new Error(`Trigger ${trigger} is not registered.`);
        }
    }
    destroy() {
        this.registered.forEach((r) => this.unregister(r[0]));
    }
    forType() {
        return TimeTrigger_1.TimeTrigger.prototype.constructor.name;
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
    createRecurrenceRule(trigger) {
        const rule = new node_schedule_1.RecurrenceRule();
        rule.dayOfWeek = trigger.getWeekdays();
        rule.hour = trigger.getHour();
        rule.minute = trigger.getMinute();
        return rule;
    }
}
exports.TimeTriggerScheduler = TimeTriggerScheduler;
