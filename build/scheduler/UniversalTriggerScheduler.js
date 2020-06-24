"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UniversalTriggerScheduler {
    constructor(schedulers) {
        this.schedulers = schedulers;
    }
    register(trigger) {
        const scheduler = this.schedulers.find(s => s.forType() === trigger.constructor.name);
        if (scheduler) {
            return scheduler.register(trigger);
        }
        else {
            throw new Error(`No scheduler for trigger of type ${trigger.constructor.name} found`);
        }
    }
    unregister(trigger) {
        const scheduler = this.schedulers.find(s => s.forType() === trigger.constructor.name);
        if (scheduler) {
            return scheduler.unregister(trigger);
        }
        else {
            throw new Error(`No scheduler for trigger of type ${trigger.constructor.name} found`);
        }
    }
    getRegistered() {
        let registered = [];
        this.schedulers.forEach(s => {
            registered = registered.concat(s.getRegistered());
        });
        return registered;
    }
    unregisterAll() {
        this.getRegistered().forEach(t => {
            this.unregister(t);
        });
    }
}
exports.UniversalTriggerScheduler = UniversalTriggerScheduler;
