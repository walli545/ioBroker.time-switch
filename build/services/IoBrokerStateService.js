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
exports.IoBrokerStateService = void 0;
class IoBrokerStateService {
    constructor(adapter, logger) {
        this.logger = logger;
        if (!adapter) {
            throw new Error('adapter may not be null.');
        }
        this.adapter = adapter;
    }
    setState(id, value, ack = true) {
        this.checkId(id);
        this.adapter.setState(id, value, ack);
    }
    setForeignState(id, value) {
        var _a;
        this.checkId(id);
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logDebug(`Setting state ${id} with value ${value === null || value === void 0 ? void 0 : value.toString()}`);
        this.adapter.setForeignState(id, value, false);
    }
    getForeignState(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, _) => {
                this.checkId(id);
                this.adapter.getForeignState(id, (err, state) => {
                    if (err || state == null) {
                        throw new Error(err || `Requested state ${id} returned null/undefined!`);
                    }
                    resolve(state.val);
                });
            });
        });
    }
    checkId(id) {
        if (id == null || id.length === 0) {
            throw new Error('id may not be null or empty.');
        }
    }
}
exports.IoBrokerStateService = IoBrokerStateService;
