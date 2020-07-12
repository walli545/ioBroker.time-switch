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
exports.StringStateAndConstantCondition = void 0;
const EqualitySign_1 = require("./EqualitySign");
class StringStateAndConstantCondition {
    constructor(constant, stateId, sign, stateService) {
        if (constant == null) {
            throw new Error('Constant value may not be null or undefined.');
        }
        if (stateId == null || stateId.length === 0) {
            throw new Error('State id may not be null, undefined or empty.');
        }
        if (sign == null) {
            throw new Error('Sign may not be null or undefined.');
        }
        if (stateService == null) {
            throw new Error('State service may not be null or undefined.');
        }
        this.constant = constant;
        this.stateId = stateId;
        this.sign = sign;
        this.stateService = stateService;
    }
    evaluate() {
        return __awaiter(this, void 0, void 0, function* () {
            const stateValue = String(yield this.stateService.getForeignState(this.stateId));
            let result;
            if (this.sign == EqualitySign_1.EqualitySign.NotEqual) {
                result = stateValue !== this.constant;
            }
            else {
                result = stateValue === this.constant;
            }
            return Promise.resolve(result);
        });
    }
    toString() {
        return `${this.constant} ${this.sign} ${this.stateId}`;
    }
}
exports.StringStateAndConstantCondition = StringStateAndConstantCondition;
