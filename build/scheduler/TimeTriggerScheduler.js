"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = require("node-schedule");
const TriggerScheduler_1 = require("./TriggerScheduler");
class TimeTriggerScheduler extends TriggerScheduler_1.TriggerScheduler {
    constructor() {
        super(...arguments);
        this.registered = [];
    }
    register(trigger, onTrigger) {
        if (this.isRegistered(trigger)) {
            throw new Error('Trigger is already registered.');
        }
        const newJob = node_schedule_1.scheduleJob(this.createRecurrenceRule(trigger), () => {
            onTrigger();
        });
        this.registered.push([trigger, newJob]);
    }
    unregister(trigger) {
        if (this.isRegistered(trigger)) {
            const job = this.getAssociatedJob(trigger);
            node_schedule_1.cancelJob(job);
            this.removeTrigger(trigger);
        }
        else {
            throw new Error('Trigger is not registered.');
        }
    }
    isRegistered(trigger) {
        return this.registered.find(r => r[0] === trigger) != undefined;
    }
    getAssociatedJob(trigger) {
        const entry = this.registered.find(r => r[0] === trigger);
        if (entry) {
            return entry[1];
        }
        else {
            throw new Error('Trigger not found.');
        }
    }
    removeTrigger(trigger) {
        this.registered = this.registered.filter(r => r[0] !== trigger);
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
