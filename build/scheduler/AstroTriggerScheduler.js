"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroTriggerScheduler = void 0;
const TriggerScheduler_1 = require("./TriggerScheduler");
const AstroTrigger_1 = require("../triggers/AstroTrigger");
const TimeTriggerBuilder_1 = require("../triggers/TimeTriggerBuilder");
const Weekday_1 = require("../triggers/Weekday");
class AstroTriggerScheduler extends TriggerScheduler_1.TriggerScheduler {
    constructor(timeTriggerScheduler, getTimes, coordinate, logger) {
        super();
        this.timeTriggerScheduler = timeTriggerScheduler;
        this.getTimes = getTimes;
        this.coordinate = coordinate;
        this.logger = logger;
        this.registered = [];
        this.scheduled = [];
        this.rescheduleTrigger = new TimeTriggerBuilder_1.TimeTriggerBuilder()
            .setId(`AstroTriggerScheduler-Rescheduler-${new Date().toTimeString()}`)
            .setWeekdays(Weekday_1.AllWeekdays)
            .setHour(0)
            .setMinute(0)
            .setAction({
            execute: () => {
                var _a;
                /* istanbul ignore next */
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logDebug(`Rescheduling astro triggers`);
                this.scheduled.forEach(s => this.timeTriggerScheduler.unregister(s[1]));
                this.registered.forEach(r => this.tryScheduleTriggerToday(r));
            },
        })
            .build();
        this.timeTriggerScheduler.register(this.rescheduleTrigger);
    }
    register(trigger) {
        if (this.isRegistered(trigger)) {
            throw new Error('Trigger is already registered.');
        }
        this.registered.push(trigger);
        this.tryScheduleTriggerToday(trigger);
    }
    unregister(trigger) {
        if (this.isRegistered(trigger)) {
            this.registered = this.registered.filter(t => t.getId() !== trigger.getId());
            if (this.isScheduledToday(trigger)) {
                this.scheduled = this.scheduled.filter(s => {
                    if (s[0] === trigger.getId()) {
                        this.timeTriggerScheduler.unregister(s[1]);
                        return false;
                    }
                    return true;
                });
            }
        }
        else {
            throw new Error('Trigger is not registered.');
        }
    }
    destroy() {
        this.timeTriggerScheduler.destroy();
        this.registered = [];
        this.scheduled = [];
    }
    forType() {
        return AstroTrigger_1.AstroTrigger.prototype.constructor.name;
    }
    tryScheduleTriggerToday(trigger) {
        const now = new Date();
        const next = this.nextDate(trigger);
        if (next >= now && trigger.getWeekdays().includes(now.getDay())) {
            const timeTrigger = new TimeTriggerBuilder_1.TimeTriggerBuilder()
                .setId(`TimeTriggerForAstroTrigger:${trigger.getId()}`)
                .setHour(next.getHours())
                .setMinute(next.getMinutes())
                .setWeekdays([next.getDay()])
                .setAction({
                execute: () => {
                    trigger.getAction().execute();
                },
            })
                .build();
            this.timeTriggerScheduler.register(timeTrigger);
            this.scheduled.push([trigger.getId(), timeTrigger]);
        }
    }
    isRegistered(trigger) {
        return this.registered.find(r => r.getId() === trigger.getId()) != undefined;
    }
    isScheduledToday(trigger) {
        return this.scheduled.find(s => s[0] === trigger.getId()) != undefined;
    }
    nextDate(trigger) {
        const next = this.getTimes(new Date(), this.coordinate.getLatitude(), this.coordinate.getLongitude())[trigger.getAstroTime()];
        next.setMinutes(next.getMinutes() + trigger.getShiftInMinutes());
        return next;
    }
}
exports.AstroTriggerScheduler = AstroTriggerScheduler;
