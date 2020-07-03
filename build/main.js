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
exports.TimeSwitch = void 0;
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const IoBrokerStateService_1 = require("./services/IoBrokerStateService");
const TimeTriggerScheduler_1 = require("./scheduler/TimeTriggerScheduler");
const TimeTriggerSerializer_1 = require("./serialization/TimeTriggerSerializer");
const UniversalTriggerScheduler_1 = require("./scheduler/UniversalTriggerScheduler");
const UniversalSerializer_1 = require("./serialization/UniversalSerializer");
const IoBrokerLoggingService_1 = require("./services/IoBrokerLoggingService");
const MessageService_1 = require("./services/MessageService");
const OnOffStateActionSerializer_1 = require("./serialization/OnOffStateActionSerializer");
const OnOffStateActionBuilder_1 = require("./actions/OnOffStateActionBuilder");
const OnOffScheduleSerializer_1 = require("./serialization/OnOffScheduleSerializer");
const node_schedule_1 = require("node-schedule");
const AstroTriggerSerializer_1 = require("./serialization/AstroTriggerSerializer");
const AstroTriggerScheduler_1 = require("./scheduler/AstroTriggerScheduler");
const suncalc_1 = require("suncalc");
const Coordinate_1 = require("./Coordinate");
class TimeSwitch extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { name: 'time-switch' }));
        this.scheduleIdToSchedule = new Map();
        this.loggingService = new IoBrokerLoggingService_1.IoBrokerLoggingService(this);
        this.stateService = new IoBrokerStateService_1.IoBrokerStateService(this, this.loggingService);
        this.actionSerializer = new UniversalSerializer_1.UniversalSerializer([new OnOffStateActionSerializer_1.OnOffStateActionSerializer(this.stateService)]);
        this.triggerSerializer = new UniversalSerializer_1.UniversalSerializer([
            new TimeTriggerSerializer_1.TimeTriggerSerializer(this.actionSerializer),
            new AstroTriggerSerializer_1.AstroTriggerSerializer(this.actionSerializer),
        ]);
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
    static getEnabledIdFromScheduleId(scheduleId) {
        return scheduleId.replace('data', 'enabled');
    }
    static getScheduleIdFromEnabledId(scheduleId) {
        return scheduleId.replace('enabled', 'data');
    }
    //------------------------------------------------------------------------------------------------------------------
    // Adapter live cycle methods
    //------------------------------------------------------------------------------------------------------------------
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initMessageService();
            yield this.fixStateStructure(this.config.schedules);
            const record = yield this.getStatesAsync(`time-switch.${this.instance}.*.data`);
            for (const id in record) {
                const state = record[id];
                this.log.debug(`got state: ${state ? state.toString() : 'null'}`);
                if (state) {
                    const schedule = (yield this.createNewOnOffScheduleSerializer()).deserialize(state.val);
                    const enabledState = yield this.getStateAsync(TimeSwitch.getEnabledIdFromScheduleId(id));
                    if (enabledState) {
                        schedule.setEnabled(enabledState.val);
                        this.scheduleIdToSchedule.set(id, schedule);
                    }
                    else {
                        this.log.error(`Could not retrieve state enabled state for ${id}`);
                    }
                }
                else {
                    this.log.error(`Could not retrieve state for ${id}`);
                }
            }
            this.subscribeStates('*');
            this.subscribeForeignObjects('system.config');
        });
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        var _a;
        try {
            for (const id in this.scheduleIdToSchedule.keys()) {
                (_a = this.scheduleIdToSchedule.get(id)) === null || _a === void 0 ? void 0 : _a.destroy();
            }
            this.scheduleIdToSchedule.clear();
            this.log.info('cleaned everything up...');
            callback();
        }
        catch (e) {
            callback();
        }
    }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!state) {
                this.log.debug(`state ${id} deleted`);
                return;
            }
            if (state.ack) {
                this.log.debug(`Ignoring state change for ${id} with ack=true`);
                return;
            }
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            if (id.startsWith(`time-switch.${this.instance}`)) {
                if (id.endsWith('data')) {
                    this.log.debug('is schedule id');
                    yield this.onScheduleChange(id, state.val);
                }
                else if (id.endsWith('enabled')) {
                    this.log.debug('is enabled id');
                    const dataId = TimeSwitch.getScheduleIdFromEnabledId(id);
                    const scheduleData = (_a = (yield this.getStateAsync(dataId))) === null || _a === void 0 ? void 0 : _a.val;
                    yield this.onScheduleChange(dataId, scheduleData);
                }
                // Confirm state change with ack=true
                this.stateService.setState(id, state.val, true);
            }
        });
    }
    /**
     * Is called when adapter receives a message.
     */
    onMessage(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.messageService) {
                    yield this.messageService.handleMessage(obj);
                }
                else {
                    this.log.error('Message service not initialized');
                }
            }
            catch (e) {
                this.log.error(e.stack);
                this.log.error(e.message);
                this.log.error(e.name);
                this.log.error(`Could not handle message:`);
            }
        });
    }
    //------------------------------------------------------------------------------------------------------------------
    // Private helper methods
    //------------------------------------------------------------------------------------------------------------------
    initMessageService() {
        return __awaiter(this, void 0, void 0, function* () {
            this.messageService = new MessageService_1.MessageService(this.stateService, this.loggingService, this.scheduleIdToSchedule, this.triggerSerializer, this.actionSerializer, yield this.createNewOnOffScheduleSerializer());
        });
    }
    fixStateStructure(statesInSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!statesInSettings) {
                statesInSettings = { onOff: [] };
            }
            if (!statesInSettings.onOff) {
                statesInSettings.onOff = [];
            }
            const prefix = `time-switch.${this.instance}.`;
            const currentStates = yield this.getStatesAsync(`${prefix}*.data`);
            for (const fullId in currentStates) {
                const split = fullId.split('.');
                const type = split[2];
                const id = Number.parseInt(split[3], 10);
                if (type == 'onoff') {
                    if (statesInSettings.onOff.includes(id)) {
                        statesInSettings.onOff = statesInSettings.onOff.filter((i) => i !== id);
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
            yield this.deleteChannelAsync('onoff', id.toString());
        });
    }
    createOnOffSchedule(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const builder = new OnOffStateActionBuilder_1.OnOffStateActionBuilder()
                .setOnValue(true)
                .setOffValue(false)
                .setStateService(this.stateService)
                .setIdsOfStatesToSet(['default.state']);
            const defOnAction = builder.setBooleanValue(true).build();
            const defOffAction = builder.setBooleanValue(false).build();
            yield this.createDeviceAsync('onoff');
            yield this.createChannelAsync('onoff', id.toString());
            yield this.createStateAsync('onoff', id.toString(), 'data', {
                read: true,
                write: true,
                type: 'string',
                role: 'json',
                def: `{
				"type": "OnOffSchedule",
				"name": "New Schedule",
				"onAction": ${this.actionSerializer.serialize(defOnAction)},
				"offAction": ${this.actionSerializer.serialize(defOffAction)},
				"triggers":[]
			}`.replace(/\s/g, ''),
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug('onScheduleChange: ' + scheduleString + ' ' + id);
            this.log.debug('schedule found: ' + this.scheduleIdToSchedule.get(id));
            const schedule = (yield this.createNewOnOffScheduleSerializer()).deserialize(scheduleString);
            const enabledState = yield this.getStateAsync(TimeSwitch.getEnabledIdFromScheduleId(id));
            if (enabledState) {
                (_a = this.scheduleIdToSchedule.get(id)) === null || _a === void 0 ? void 0 : _a.destroy();
                schedule.setEnabled(enabledState.val);
                this.scheduleIdToSchedule.set(id, schedule);
            }
            else {
                this.log.error(`Could not retrieve state enabled state for ${id}`);
            }
        });
    }
    createNewOnOffScheduleSerializer() {
        return __awaiter(this, void 0, void 0, function* () {
            return new OnOffScheduleSerializer_1.OnOffScheduleSerializer(new UniversalTriggerScheduler_1.UniversalTriggerScheduler([
                new TimeTriggerScheduler_1.TimeTriggerScheduler(node_schedule_1.scheduleJob, node_schedule_1.cancelJob, this.loggingService),
                new AstroTriggerScheduler_1.AstroTriggerScheduler(new TimeTriggerScheduler_1.TimeTriggerScheduler(node_schedule_1.scheduleJob, node_schedule_1.cancelJob, this.loggingService), suncalc_1.getTimes, yield this.getCoordinate()),
            ]), this.actionSerializer, this.triggerSerializer);
        });
    }
    getCoordinate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.coordinate) {
                return Promise.resolve(this.coordinate);
            }
            else {
                return new Promise((resolve, _) => {
                    this.getForeignObject('system.config', (error, obj) => {
                        if (obj && obj.common) {
                            const lat = obj.common.latitude;
                            const long = obj.common.longitude;
                            if (lat && long) {
                                this.log.debug(`Got coordinates lat=${lat} long=${long}`);
                                resolve(new Coordinate_1.Coordinate(lat, long));
                                return;
                            }
                        }
                        this.log.error('Could not read coordinates from system.config, using Berlins coordinates as fallback');
                        resolve(new Coordinate_1.Coordinate(52, 13));
                    });
                });
            }
        });
    }
}
exports.TimeSwitch = TimeSwitch;
if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options) => new TimeSwitch(options);
}
else {
    // otherwise start the instance directly
    (() => new TimeSwitch())();
}
