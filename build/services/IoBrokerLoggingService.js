"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoBrokerLoggingService = void 0;
class IoBrokerLoggingService {
    constructor(adapter) {
        this.adapter = adapter;
    }
    logDebug(message) {
        this.adapter.log.debug(message);
    }
    logError(message) {
        this.adapter.log.error(message);
    }
    logInfo(message) {
        this.adapter.log.info(message);
    }
    logSilly(message) {
        this.adapter.log.silly(message);
    }
    logWarn(message) {
        this.adapter.log.warn(message);
    }
}
exports.IoBrokerLoggingService = IoBrokerLoggingService;
