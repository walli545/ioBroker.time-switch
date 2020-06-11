"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnOffSchedule = void 0;
const OnOffStateAction_1 = require("../actions/OnOffStateAction");
const Schedule_1 = require("./Schedule");
class OnOffSchedule extends Schedule_1.Schedule {
    constructor(onAction, offAction, triggerScheduler) {
        super(triggerScheduler);
        if (onAction == null) {
            throw new Error(`onAction may not be null or undefined`);
        }
        if (offAction == null) {
            throw new Error(`offAction may not be null or undefined`);
        }
        this.onAction = onAction;
        this.offAction = offAction;
    }
    setOnAction(onAction) {
        if (onAction == null) {
            throw new Error(`onAction may not be null or undefined`);
        }
        this.onAction = onAction;
        this.getTriggers().forEach((t) => {
            const action = t.getAction();
            if (action instanceof OnOffStateAction_1.OnOffStateAction) {
                if (action.getBooleanValue()) {
                    t.setAction(onAction);
                }
            }
        });
    }
    setOffAction(offAction) {
        if (offAction == null) {
            throw new Error(`offAction may not be null or undefined`);
        }
        this.offAction = offAction;
        this.getTriggers().forEach((t) => {
            const action = t.getAction();
            if (action instanceof OnOffStateAction_1.OnOffStateAction) {
                if (!action.getBooleanValue()) {
                    t.setAction(offAction);
                }
            }
        });
    }
    getOnAction() {
        return this.onAction;
    }
    getOffAction() {
        return this.offAction;
    }
}
exports.OnOffSchedule = OnOffSchedule;
