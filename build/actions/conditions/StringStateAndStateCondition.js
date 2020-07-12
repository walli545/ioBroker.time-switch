"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringStateAndStateCondition = void 0;
const EqualitySign_1 = require("./EqualitySign");
class StringStateAndStateCondition {
    constructor(stateId1, stateId2, sign, stateService) {
        if (stateId1 == null || stateId1.length === 0) {
            throw new Error('First state id may not be null, undefined or empty.');
        }
        if (stateId2 == null || stateId2.length === 0) {
            throw new Error('Second state id may not be null, undefined or empty.');
        }
        if (sign == null) {
            throw new Error('Sign may not be null or undefined.');
        }
        if (stateService == null) {
            throw new Error('State service may not be null or undefined.');
        }
        this.stateId1 = stateId1;
        this.stateId2 = stateId2;
        this.sign = sign;
        this.stateService = stateService;
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            const firstStateValue = String(yield this.stateService.getForeignState(this.stateId1));
            const secondStateValue = String(yield this.stateService.getForeignState(this.stateId2));
            let result;
            if (this.sign == EqualitySign_1.EqualitySign.NotEqual) {
                result = firstStateValue !== secondStateValue;
            }
            else {
                result = firstStateValue === secondStateValue;
            }
            return Promise.resolve(result);
        });
    }
    toString() {
        return `${this.stateId1} ${this.sign} ${this.stateId2}`;
    }
}
exports.StringStateAndStateCondition = StringStateAndStateCondition;
