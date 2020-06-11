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
        var _a;
        if (this.getAssociatedJob(trigger)) {
            throw new Error('Trigger is already registered.');
        }
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logDebug(`Scheduling trigger at ${trigger.getHour()}:${trigger.getMinute()} on ${trigger.getWeekdays()}`);
        const newJob = this.scheduleJob(this.createRecurrenceRule(trigger), () => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logDebug(`Executing trigger with id ${trigger.getId()}`);
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
    getRegistered() {
        return this.registered.map((r) => r[0]);
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
