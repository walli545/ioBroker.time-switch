"use strict";
/*
 * Created with @iobroker/create-adapter v1.16.0
 */
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
        this.setStateActionSerialier = new SetStateValueActionSerializer_1.SetStateValueActionSerializer(this.stateService);
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
            this.log.debug('onReady');
            this.log.info('config: ' + this.config.schedules.length);
            let schedulesFromSettings = this.config.schedules;
            this.log.info(schedulesFromSettings.join(', '));
            let record = yield this.getStatesAsync(`time-switch.${this.instance}.schedule*`);
            for (const fullId in record) {
                const id = this.convertToLocalId(fullId);
                if (schedulesFromSettings.includes(id)) {
                    schedulesFromSettings = schedulesFromSettings.filter(i => i !== id);
                    this.log.info('Found state ' + id);
                }
                else {
                    this.log.info('Deleting state ' + id);
                    yield this.deleteStateAsync(id);
                }
            }
            for (const s of schedulesFromSettings) {
                this.log.info('State ' + s + 'not found, creating');
                yield this.createStateAsync('', '', s, { read: true, write: true, type: 'string', role: 'json' });
                const r = yield this.setStateAsync(s, '{"alias": "", "enabled": false, "actions":[]}');
                this.log.info('result: ' + r);
            }
            record = yield this.getStatesAsync(`time-switch.${this.instance}.schedule*`);
            for (const fullId in record) {
                const id = this.convertToLocalId(fullId);
                this.log.info('Creating scheduler for ' + id);
                this.scheduleToTimeTriggerScheduler.set(id, new TimeTriggerScheduler_1.TimeTriggerScheduler());
                this.scheduleToActions.set(id, []);
                const state = record[fullId];
                this.log.info(`got state: ${state ? state.toString() : 'null'}`);
                if (state) {
                    this.onScheduleChange(id, state.val);
                }
                else {
                    this.log.error('Could not retrieve state');
                }
            }
            /*
            For every state in the system there has to be also an object of type state
            Here a simple template for a boolean variable named "testVariable"
            Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
            */
            // await this.setObjectAsync('testVariable', {
            // 	type: 'state',
            // 	common: {
            // 		name: 'testVariable',
            // 		type: 'boolean',
            // 		role: 'indicator',
            // 		read: true,
            // 		write: true,
            // 	},
            // 	native: {},
            // });
            // in this template all states changes inside the adapters namespace are subscribed
            this.subscribeStates('*');
            /*
            setState examples
            you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
            */
            // the variable testVariable is set to true as command (ack=false)
            // await this.setStateAsync('testVariable', true);
            // same thing, but the value is flagged "ack"
            // ack should be always set to true if the value is received from or acknowledged from the target system
            // await this.setStateAsync('testVariable', { val: true, ack: true });
            // same thing, but the state is deleted after 30s (getState will return null afterwards)
            // await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });
            // examples for the checkPassword/checkGroup functions
            // let result = await this.checkPasswordAsync('admin', 'iobroker');
            // this.log.info('check user admin pw ioboker: ' + result);
            // result = await this.checkGroupAsync('admin', 'admin');
            // this.log.info('check group user admin group admin: ' + result);
        });
    }
    convertToLocalId(fullId) {
        const prefix = `time-switch.${this.instance}.`;
        return fullId.substr(prefix.length);
    }
    registerAction(id, action) {
        if (action.getTrigger() instanceof TimeTrigger_1.TimeTrigger) {
            // @ts-ignore
            this.scheduleToTimeTriggerScheduler.get(id).register(action.getTrigger(), () => {
                this.log.info('trigger fired');
                action.execute();
            });
            this.log.info(`Registered trigger time trigger ${action.getTrigger()}`);
        }
        else {
            this.log.error(`No scheduler for trigger ${action.getTrigger()} found`);
        }
    }
    unregisterAction(id, action) {
        if (action.getTrigger() instanceof TimeTrigger_1.TimeTrigger) {
            // @ts-ignore
            this.scheduleToTimeTriggerScheduler.get(id).unregister(action.getTrigger());
            this.log.debug(`Unregistered trigger time trigger ${action.getTrigger()}`);
        }
        else {
            this.log.error(`No scheduler for trigger ${action.getTrigger()} found`);
        }
    }
    onScheduleChange(id, scheduleString) {
        this.log.info('onScheduleChange: ' + scheduleString);
        if (this.scheduleToActions.has(id)) {
            // @ts-ignore
            this.scheduleToActions.get(id).forEach(a => {
                this.unregisterAction(id, a);
            });
        }
        else {
        }
        this.scheduleToActions.set(id, []);
        const schedule = JSON.parse(scheduleString);
        if (schedule.enabled == true) {
            this.log.info('is enabled');
            const actions = schedule.actions.map((a) => this.setStateActionSerialier.deserialize(JSON.stringify(a)));
            this.log.info(`actions length: ${actions.length}`);
            actions.forEach((a) => {
                // @ts-ignore
                this.scheduleToActions.get(id).push(a);
                this.registerAction(id, a);
            });
        }
        else {
            this.log.info('schedule not enabled');
        }
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
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
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            const pattern = `time-switch.${this.instance}.schedule`;
            if (id.startsWith(pattern)) {
                this.log.info('is schedule id');
                this.onScheduleChange(this.convertToLocalId(id), state.val);
            }
        }
        else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
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
