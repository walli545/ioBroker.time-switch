"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneTimeTriggerBuilder = void 0;
const OneTimeTrigger_1 = require("./OneTimeTrigger");
class OneTimeTriggerBuilder {
    constructor() {
        this.action = null;
        this.id = '0';
        this.date = null;
    }
    setAction(action) {
        this.action = action;
        return this;
    }
    setId(id) {
        this.id = id;
        return this;
    }
    setDate(date) {
        this.date = date;
        return this;
    }
    build() {
        return new OneTimeTrigger_1.OneTimeTrigger(this.id, this.action, this.date);
    }
}
exports.OneTimeTriggerBuilder = OneTimeTriggerBuilder;
