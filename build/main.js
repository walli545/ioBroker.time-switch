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
const IoBrokerStateService_1 = require("./services/IoBrokerStateService");
const TimeTriggerScheduler_1 = require("./scheduler/TimeTriggerScheduler");
const TimeTriggerSerializer_1 = require("./serialization/TimeTriggerSerializer");
const OnOffStateActionSerializer_1 = require("./serialization/OnOffStateActionSerializer");
const UniversalTriggerScheduler_1 = require("./scheduler/UniversalTriggerScheduler");
const UniversalTriggerSerializer_1 = require("./serialization/UniversalTriggerSerializer");
const TimeTriggerBuilder_1 = require("./triggers/TimeTriggerBuilder");
const Weekday_1 = require("./triggers/Weekday");
const OnOffStateActionBuilder_1 = require("./actions/OnOffStateActionBuilder");
const OnOffStateAction_1 = require("./actions/OnOffStateAction");
class TimeSwitch extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { name: 'time-switch' }));
        this.scheduleToScheduler = new Map();
        this.stateService = new IoBrokerStateService_1.IoBrokerStateService(this);
        this.currentMessage = null;
        this.triggerSerializer = new UniversalTriggerSerializer_1.UniversalTriggerSerializer([
            new TimeTriggerSerializer_1.TimeTriggerSerializer([new OnOffStateActionSerializer_1.OnOffStateActionSerializer(this.stateService)]),
        ]);
        this.on('ready', this.onReady.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info('new timeswitch');
            yield this.fixStateStructure(this.config.schedules);
            const record = yield this.getStatesAsync(`time-switch.${this.instance}.*.data`);
            for (const id in record) {
                this.log.debug('Creating scheduler for ' + id);
                this.scheduleToScheduler.set(id, this.createNewScheduler());
                const state = record[id];
                this.log.debug(`got state: ${state ? state.toString() : 'null'}`);
                if (state) {
                    yield this.onScheduleChange(id, state.val);
                }
                else {
                    this.log.error('Could not retrieve state');
                }
            }
            this.subscribeStates('*');
        });
    }
    fixStateStructure(statesInSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefix = `time-switch.${this.instance}.`;
            const currentStates = yield this.getStatesAsync(`${prefix}*.data`);
            for (const fullId in currentStates) {
                const split = fullId.split('.');
                const type = split[2];
                const id = Number.parseInt(split[3], 10);
                if (type == 'onoff') {
                    if (statesInSettings.onOff.includes(id)) {
                        statesInSettings.onOff = statesInSettings.onOff.filter(i => i !== id);
                        this.log.debug('Found state ' + fullId);
                    }
                    else {
                        this.log.debug('Deleting state ' + fullId);
                        yield this.deleteOnOffSchedule(id);
                    }
                }
            }
            for (const i of statesInSettings.onOff) {
                this.log.debug('Onoff state ' + i + 'not found, creating');
                yield this.createOnOffSchedule(i);
            }
        });
    }
    deleteOnOffSchedule(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const prefix = `onoff.${id}.`;
            this.log.debug('deleting ' + prefix + 'enabled');
            // await this.deleteStateAsync(prefix + 'data');
            // await this.deleteStateAsync(prefix + 'enabled');
            yield this.deleteChannelAsync('onoff', id.toString());
        });
    }
    createOnOffSchedule(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createDeviceAsync('onoff');
            yield this.createChannelAsync('onoff', id.toString());
            yield this.createStateAsync('onoff', id.toString(), 'data', {
                read: true,
                write: true,
                type: 'string',
                role: 'json',
                def: '{"name": "New Schedule", "triggers":[]}',
                desc: 'Contains the schedule data (triggers, etc.)',
            });
            yield this.createStateAsync('onoff', id.toString(), 'enabled', {
                read: true,
                write: true,
                type: 'boolean',
                role: 'switch',
                def: false,
                desc: 'Enables/disables automatic switching for this schedule',
            });
        });
    }
    onScheduleChange(id, scheduleString) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug('onScheduleChange: ' + scheduleString + ' ' + id);
            this.log.debug('scheduler found: ' + this.scheduleToScheduler.get(id));
            (_a = this.scheduleToScheduler.get(id)) === null || _a === void 0 ? void 0 : _a.unregisterAll();
            const schedule = JSON.parse(scheduleString);
            if ((_b = (yield this.getStateAsync(id.replace('data', 'enabled')))) === null || _b === void 0 ? void 0 : _b.val) {
                this.log.debug('is enabled');
                this.log.debug('triggers: ' + schedule.triggers);
                this.log.debug('triggers.map: ' + ((_c = schedule.triggers) === null || _c === void 0 ? void 0 : _c.map));
                const triggers = schedule.triggers.map((t) => this.triggerSerializer.deserialize(JSON.stringify(t)));
                this.log.debug(`triggers length: ${triggers.length}`);
                triggers.forEach((t) => {
                    var _a;
                    (_a = this.scheduleToScheduler.get(id)) === null || _a === void 0 ? void 0 : _a.register(t);
                });
            }
            else {
                this.log.debug('schedule not enabled');
            }
        });
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        var _a;
        try {
            for (const id in this.scheduleToScheduler.keys()) {
                (_a = this.scheduleToScheduler.get(id)) === null || _a === void 0 ? void 0 : _a.unregisterAll();
            }
            this.scheduleToScheduler.clear();
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (state) {
                // The state was changed
                this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
                if (id.startsWith(`time-switch.${this.instance}`)) {
                    if (id.endsWith('data')) {
                        this.log.debug('is schedule id');
                        yield this.onScheduleChange(id, state.val);
                    }
                    else if (id.endsWith('enabled')) {
                        this.log.debug('is enabled id');
                        const dataId = id.replace('enabled', 'data');
                        const scheduleData = (_a = (yield this.getStateAsync(dataId))) === null || _a === void 0 ? void 0 : _a.val;
                        yield this.onScheduleChange(dataId, scheduleData);
                    }
                }
            }
            else {
                // The state was deleted
                this.log.debug(`state ${id} deleted`);
            }
        });
    }
    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.message" property to be set to true in io-package.json
     */
    onMessage(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentMessage) {
                setTimeout(() => this.onMessage(obj), 500);
                return;
            }
            this.currentMessage = obj;
            const data = obj.message;
            this.log.info(`Received ${obj.command}`);
            switch (obj.command) {
                case 'add-trigger':
                    yield this.addTrigger(data);
                    break;
                case 'update-trigger':
                    yield this.updateTrigger(data.dataId, JSON.stringify(data.trigger));
                    break;
                case 'delete-trigger':
                    yield this.deleteTrigger(data.dataId, data.id);
                    break;
                case 'change-name':
                    yield this.changeScheduleName(data.dataId, data.name);
                    break;
                case 'enable-schedule':
                    yield this.changeScheduleEnabled(data, true);
                    break;
                case 'disable-schedule':
                    yield this.changeScheduleEnabled(data, false);
                    break;
                case 'change-switched-values':
                    yield this.changeSwitchedValues(data);
                    break;
                case 'change-switched-ids':
                    yield this.changeSwitchedIds(data);
                    break;
                default:
                    this.log.error('Unknown command received');
                    break;
            }
            this.log.info('Finished message ' + obj.command);
            this.currentMessage = null;
        });
    }
    addTrigger(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTriggers = yield this.getTriggers(data.dataId);
            let newTrigger;
            if (currentTriggers) {
                if (data.triggerType === 'TimeTrigger') {
                    this.log.info('Wants TimeTrigger');
                    const triggerBuilder = new TimeTriggerBuilder_1.TimeTriggerBuilder()
                        .setWeekdays(Weekday_1.AllWeekdays)
                        .setHour(0)
                        .setMinute(0)
                        .setId(this.getNextTriggerId(currentTriggers));
                    if (data.actionType === 'OnOffValueAction') {
                        this.log.info('Wants OnOffValueAction');
                        const actionBuilder = new OnOffStateActionBuilder_1.OnOffStateActionBuilder()
                            .setStateService(this.stateService)
                            .setIdsOfStatesToSet(data.stateIds)
                            .setBooleanValue(true);
                        if (data.valueType === 'boolean') {
                            actionBuilder.setOnValue(true).setOffValue(false);
                        }
                        else {
                            actionBuilder.setOnValue(data.onValue).setOffValue(data.offValue);
                        }
                        triggerBuilder.setAction(actionBuilder.build());
                    }
                    else {
                        this.log.error(`Cannot add trigger with action of type ${data.actionType}`);
                        return;
                    }
                    newTrigger = triggerBuilder.build();
                }
                else {
                    this.log.error(`Cannot add trigger of type ${data.triggerType}`);
                    return;
                }
                currentTriggers.push(newTrigger);
                yield this.updateTriggers(data.dataId, currentTriggers);
            }
            else {
                this.log.error('No schedule found for state ' + data.dataId);
            }
        });
    }
    updateTrigger(scheduleId, triggerString) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = this.triggerSerializer.deserialize(triggerString);
            if (updated) {
                const current = yield this.getTriggers(scheduleId);
                const index = current.findIndex(t => t.getId() === updated.getId());
                if (index == -1) {
                    this.log.error('Cannot update trigger, trigger was not found');
                }
                else {
                    current[index] = updated;
                    this.updateTriggers(scheduleId, current);
                }
            }
            else {
                this.log.error('Invalid trigger, cannot update');
            }
        });
    }
    deleteTrigger(scheduleId, triggerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield this.getTriggers(scheduleId);
            this.updateTriggers(scheduleId, current.filter(t => t.getId() !== triggerId));
        });
    }
    updateTriggers(scheduleId, newTriggers) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield this.getScheduleFromState(scheduleId);
            current.triggers = newTriggers.map(t => JSON.parse(this.triggerSerializer.serialize(t)));
            yield this.setStateAsync(scheduleId, JSON.stringify(current));
        });
    }
    getTriggers(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getScheduleFromState(scheduleId)).triggers.map((t) => this.triggerSerializer.deserialize(JSON.stringify(t)));
        });
    }
    getNextTriggerId(current) {
        const numbers = current
            .map(t => t.getId())
            .map(id => Number.parseInt(id, 10))
            .sort((a, b) => a - b);
        let newId = 0;
        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] > newId) {
                break;
            }
            else {
                newId++;
            }
        }
        return newId.toString();
    }
    changeScheduleName(scheduleId, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield this.getScheduleFromState(scheduleId);
            current.name = newName;
            yield this.setStateAsync(scheduleId, JSON.stringify(current));
        });
    }
    changeScheduleEnabled(scheduleId, enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setStateAsync(scheduleId.replace('data', 'enabled'), enabled);
        });
    }
    getScheduleFromState(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield this.getStateAsync(scheduleId);
            if (state) {
                return JSON.parse(state.val);
            }
            else {
                throw new Error(`Cannot find schedule for id ${scheduleId}`);
            }
        });
    }
    changeSwitchedValues(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTriggers = (yield this.getTriggers(data.dataId)).map(t => {
                const action = t.getAction();
                if (action instanceof OnOffStateAction_1.OnOffStateAction) {
                    let newAction = null;
                    switch (data.valueType) {
                        case 'boolean':
                            newAction = action.toBooleanValueType();
                            break;
                        case 'number':
                            newAction = action.toNumberValueType(data.onValue, data.offValue);
                            break;
                        case 'string':
                            newAction = action.toStringValueType(data.onValue, data.offValue);
                            break;
                        default:
                            throw new Error(`Value Type ${data.valueType} not supported`);
                    }
                    t.setAction(newAction);
                }
                return t;
            });
            this.updateTriggers(data.dataId, newTriggers);
        });
    }
    changeSwitchedIds(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTriggers = (yield this.getTriggers(data.dataId)).map(t => {
                const action = t.getAction();
                if (action instanceof OnOffStateAction_1.OnOffStateAction) {
                    action.setIdsOfStatesToSet(data.stateIds);
                }
                return t;
            });
            this.updateTriggers(data.dataId, newTriggers);
        });
    }
    createNewScheduler() {
        return new UniversalTriggerScheduler_1.UniversalTriggerScheduler([new TimeTriggerScheduler_1.TimeTriggerScheduler()]);
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
