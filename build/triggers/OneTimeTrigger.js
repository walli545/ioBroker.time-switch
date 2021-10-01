"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneTimeTrigger = void 0;
class OneTimeTrigger {
    constructor(id, action, date, onDestroy) {
        if (id == null) {
            throw new Error('Id may not be null or undefined.');
        }
        if (action == null) {
            throw new Error('Action may not be null or undefined.');
        }
        if (date == null) {
            throw new Error('Date may not be null or undefined.');
        }
        this.id = id;
        this.action = action;
        this.date = new Date(date);
        this.onDestroy = onDestroy;
    }
    getAction() {
        return {
            execute: () => {
                this.action.execute();
                this.destroy();
            },
        };
    }
    setAction(action) {
        if (action == null) {
            throw new Error('Action may not be null or undefined.');
        }
        this.action = action;
    }
    getId() {
        return this.id;
    }
    getDate() {
        return new Date(this.date);
    }
    toString() {
        return `OneTimeTrigger {id=${this.getId()}, date=${this.getDate().toISOString()}}`;
    }
    getInternalAction() {
        return this.action;
    }
    destroy() {
        if (this.onDestroy) {
            this.onDestroy();
        }
    }
}
exports.OneTimeTrigger = OneTimeTrigger;
