"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionAction = void 0;
class ConditionAction {
    constructor(condition, action, logger) {
        this.logger = logger;
        if (condition == null) {
            throw new Error('condition may not be null or undefined');
        }
        if (action == null) {
            throw new Error('action may not be null or undefined');
        }
        this.condition = condition;
        this.action = action;
    }
    execute() {
        this.condition
            .evaluate()
            .then((result) => {
            var _a, _b;
            if (result) {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logDebug(`Executing action because condition ${this.condition} evaluated to true`);
                this.action.execute();
            }
            else {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.logDebug(`Not executing action because condition ${this.condition} evaluated to false`);
            }
        })
            .catch((e) => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logError(`Error while evaluating condition: ${this.condition}, ${e}`);
        });
    }
}
exports.ConditionAction = ConditionAction;
