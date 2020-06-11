"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = void 0;
class Schedule {
    constructor(triggerScheduler) {
        this.enabled = false;
        this.name = 'New Schedule';
        this.triggers = [];
        if (triggerScheduler == null) {
            throw new Error(`triggerScheduler may not be null or undefined`);
        }
        this.triggerScheduler = triggerScheduler;
    }
    setEnabled(enabled) {
        if (enabled !== this.enabled) {
            if (enabled) {
                this.getTriggers().forEach(t => this.triggerScheduler.register(t));
            }
            else {
                this.triggerScheduler.destroy();
            }
            this.enabled = enabled;
        }
    }
    setName(name) {
        if (name == null) {
            throw new Error(`name may not be null or undefined`);
        }
        this.name = name;
    }
    isEnabled() {
        return this.enabled;
    }
    getName() {
        return this.name;
    }
    getTriggers() {
        return this.triggers;
    }
    addTrigger(trigger) {
        if (this.findTriggerById(trigger.getId())) {
            throw new Error(`Cannot add trigger, trigger id ${trigger.getId()} exists already`);
        }
        else {
            this.triggers.push(trigger);
            if (this.isEnabled()) {
                this.triggerScheduler.register(trigger);
            }
        }
    }
    updateTrigger(trigger) {
        const index = this.getTriggers().findIndex(t => t.getId() === trigger.getId());
        if (index == -1) {
            throw new Error(`Cannot update trigger, trigger id ${trigger.getId()} not found`);
        }
        else {
            if (this.isEnabled()) {
                this.triggerScheduler.unregister(this.getTriggers()[index]);
                this.triggerScheduler.register(trigger);
            }
            this.triggers[index] = trigger;
        }
    }
    removeTrigger(triggerId) {
        const trigger = this.triggers.find(t => t.getId() === triggerId);
        if (trigger) {
            this.removeTriggerAndUnregister(trigger);
        }
        else {
            throw new Error(`Cannot delete trigger, trigger id ${triggerId} not found`);
        }
    }
    destroy() {
        if (this.isEnabled()) {
            this.triggerScheduler.destroy();
        }
        this.triggers = [];
    }
    removeTriggerAndUnregister(trigger) {
        if (this.isEnabled()) {
            this.triggerScheduler.unregister(trigger);
        }
        this.triggers = this.triggers.filter(t => t.getId() !== trigger.getId());
    }
    findTriggerById(id) {
        return this.getTriggers().find(t => t.getId() === id);
    }
}
exports.Schedule = Schedule;
