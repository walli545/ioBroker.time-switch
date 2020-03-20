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
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const SetStateValueActionSerializer_1 = require("./serialization/SetStateValueActionSerializer");
const IoBrokerStateService_1 = require("./services/IoBrokerStateService");
const TimeTriggerScheduler_1 = require("./scheduler/TimeTriggerScheduler");
const TimeTrigger_1 = require("./triggers/TimeTrigger");
class TimeSwitch extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { name: 'time-switch' }));
        this.scheduleToActions = new Map();
        this.scheduleToTimeTriggerScheduler = new Map();
        this.stateService = new IoBrokerStateService_1.IoBrokerStateService(this);
        this.setStateActionSerializer = new SetStateValueActionSerializer_1.SetStateValueActionSerializer(this.stateService);
        this.on('ready', this.onReady.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            let schedulesFromSettings = this.config.schedules;
            let record = yield this.getStatesAsync(`time-switch.${this.instance}.schedule*`);
            for (const fullId in record) {
                const id = this.convertToLocalId(fullId);
                if (schedulesFromSettings.includes(id)) {
                    schedulesFromSettings = schedulesFromSettings.filter(i => i !== id);
                    this.log.debug('Found state ' + id);
                }
                else {
                    this.log.debug('Deleting state ' + id);
                    yield this.deleteStateAsync(id);
                }
            }
            for (const s of schedulesFromSettings) {
                this.log.debug('State ' + s + 'not found, creating');
                yield this.createStateAsync('', '', s, { read: true, write: true, type: 'string', role: 'json' });
                const r = yield this.setStateAsync(s, '{"alias": "", "enabled": false, "actions":[]}');
                this.log.debug('result: ' + r);
            }
            record = yield this.getStatesAsync(`time-switch.${this.instance}.schedule*`);
            for (const fullId in record) {
                const id = this.convertToLocalId(fullId);
                this.log.debug('Creating scheduler for ' + id);
                this.scheduleToTimeTriggerScheduler.set(id, new TimeTriggerScheduler_1.TimeTriggerScheduler());
                this.scheduleToActions.set(id, []);
                const state = record[fullId];
                this.log.debug(`got state: ${state ? state.toString() : 'null'}`);
                if (state) {
                    this.onScheduleChange(id, state.val);
                }
                else {
                    this.log.error('Could not retrieve state');
                }
            }
            this.subscribeStates('*');
        });
    }
    convertToLocalId(fullId) {
        const prefix = `time-switch.${this.instance}.`;
        return fullId.substr(prefix.length);
    }
    registerAction(id, action) {
        var _a;
        if (action.getTrigger() instanceof TimeTrigger_1.TimeTrigger) {
            (_a = this.scheduleToTimeTriggerScheduler.get(id)) === null || _a === void 0 ? void 0 : _a.register(action.getTrigger(), () => {
                this.log.info(`Action ${action.getId()} from ${id} triggered`);
                action.execute();
            });
            this.log.debug(`Registered trigger time trigger ${action.getTrigger()}`);
        }
        else {
            this.log.error(`No scheduler for trigger ${action.getTrigger()} found`);
        }
    }
    unregisterAction(id, action) {
        var _a;
        if (action.getTrigger() instanceof TimeTrigger_1.TimeTrigger) {
            (_a = this.scheduleToTimeTriggerScheduler.get(id)) === null || _a === void 0 ? void 0 : _a.unregister(action.getTrigger());
            this.log.debug(`Unregistered trigger time trigger ${action.getTrigger()}`);
        }
        else {
            this.log.error(`No scheduler for trigger ${action.getTrigger()} found`);
        }
    }
    onScheduleChange(id, scheduleString) {
        var _a;
        this.log.debug('onScheduleChange: ' + scheduleString);
        if (this.scheduleToActions.has(id)) {
            (_a = this.scheduleToActions.get(id)) === null || _a === void 0 ? void 0 : _a.forEach(a => {
                this.unregisterAction(id, a);
            });
        }
        else {
        }
        this.scheduleToActions.set(id, []);
        const schedule = JSON.parse(scheduleString);
        if (schedule.enabled == true) {
            this.log.debug('is enabled');
            const actions = schedule.actions.map((a) => this.setStateActionSerializer.deserialize(JSON.stringify(a)));
            this.log.debug(`actions length: ${actions.length}`);
            actions.forEach((a) => {
                var _a;
                (_a = this.scheduleToActions.get(id)) === null || _a === void 0 ? void 0 : _a.push(a);
                this.registerAction(id, a);
            });
        }
        else {
            this.log.debug('schedule not enabled');
        }
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        var _a;
        try {
            for (const id in this.scheduleToActions.keys()) {
                (_a = this.scheduleToActions.get(id)) === null || _a === void 0 ? void 0 : _a.forEach(a => {
                    this.unregisterAction(id, a);
                });
            }
            this.scheduleToActions.clear();
            this.scheduleToTimeTriggerScheduler.clear();
            this.log.info('cleaned everything up...');
            callback();
        }
        catch (e) {
            callback();
        }
    }
    /**
     * Is called if a subscribed object changes
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        }
        else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            const pattern = `time-switch.${this.instance}.schedule`;
            if (id.startsWith(pattern)) {
                this.log.debug('is schedule id');
                this.onScheduleChange(this.convertToLocalId(id), state.val);
            }
        }
        else {
            // The state was deleted
            this.log.debug(`state ${id} deleted`);
        }
    }
}
if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options) => new TimeSwitch(options);
}
else {
    // otherwise start the instance directly
    (() => new TimeSwitch())();
}
