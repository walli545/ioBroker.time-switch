/*
 * Created with @iobroker/create-adapter v1.16.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { SetStateValueActionSerializer } from './serialization/SetStateValueActionSerializer';
import { IoBrokerStateService } from './services/IoBrokerStateService';
import { TimeTriggerScheduler } from './scheduler/TimeTriggerScheduler';
import { Action } from './actions/Action';
import { TimeTrigger } from './triggers/TimeTrigger';

// Load your modules here, e.g.:
// import * as fs from "fs";

// Augment the adapter.config object with the actual types
// TODO: delete this in the next version
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace ioBroker {
		interface AdapterConfig {
			// Define the shape of your options here (recommended)
			option1: boolean;
			option2: string;

			// Or use a catch-all approach
			[key: string]: any;
		}
	}
}

class TimeSwitch extends utils.Adapter {
	private scheduleToActions: Map<string, Action[]> = new Map<string, Action[]>();
	private scheduleToTimeTriggerScheduler: Map<string, TimeTriggerScheduler> = new Map<string, TimeTriggerScheduler>();
	private stateService = new IoBrokerStateService(this);
	private setStateActionSerialier = new SetStateValueActionSerializer(this.stateService);

	public constructor(options: Partial<ioBroker.AdapterOptions> = {}) {
		super({
			...options, name: 'time-switch',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('objectChange', this.onObjectChange.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		this.log.info('onReady');
		this.log.debug('onReady');
		// Initialize your adapter here
		//this.timeTriggerScheduler = new TimeTriggerScheduler();

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		// this.log.info('config option1: ' + this.config.option1);
		// this.log.info('config option2: ' + this.config.option2);
		this.getStates('time-switch.0.schedule*', (err: string | null, record: Record<string, ioBroker.State>) => {
			for (const id in record) {
				this.scheduleToTimeTriggerScheduler.set(id, new TimeTriggerScheduler());
				this.scheduleToActions.set(id, []);
				const state = record[id];
				this.log.info(`got state: ${state ? state.toString() : 'null'}`);
				if (state) {
					this.onScheduleChange(id, state.val);
				} else {
					this.log.error('Could not retrieve state: ' + err);
				}
			}
		});
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
	}

	private registerAction(id: string, action: Action) {
		if (action.getTrigger() instanceof TimeTrigger) {
			// @ts-ignore
			this.scheduleToTimeTriggerScheduler.get(id).register(action.getTrigger() as TimeTrigger, () => {
				this.log.info('trigger fired');
				action.execute();
			});
			this.log.info(`Registered trigger time trigger ${action.getTrigger()}`);
		} else {
			this.log.error(`No scheduler for trigger ${action.getTrigger()} found`);
		}
	}

	private unregisterAction(id: string, action: Action) {
		if (action.getTrigger() instanceof TimeTrigger) {
			// @ts-ignore
			this.scheduleToTimeTriggerScheduler.get(id).unregister(action.getTrigger() as TimeTrigger);
			this.log.debug(`Unregistered trigger time trigger ${action.getTrigger()}`);
		} else {
			this.log.error(`No scheduler for trigger ${action.getTrigger()} found`);
		}
	}

	private onScheduleChange(id: string, scheduleString: string) {
		this.log.info('onScheduleChange: ' + scheduleString);
		if (this.scheduleToActions.has(id)) {
			// @ts-ignore
			this.scheduleToActions.get(id).forEach(a => {
				this.unregisterAction(id, a);
			});
		} else {
		}
		this.scheduleToActions.set(id, []);
		const schedule = JSON.parse(scheduleString);
		if (schedule.enabled == true) {
			this.log.info('is enabled');
			const actions = schedule.actions.map((a: any) => this.setStateActionSerialier.deserialize(JSON.stringify(a)));
			this.log.info(`actions length: ${actions.length}`);
			actions.forEach((a: Action) => {
				// @ts-ignore
				this.scheduleToActions.get(id).push(a);
				this.registerAction(id, a);
			});
		} else {
			this.log.info('schedule not enabled');
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			this.log.info('cleaned everything up...');
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 */
	private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 */
	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
			if (id.startsWith('time-switch.0.schedule')) {
				this.log.info('is schedule id');
				this.onScheduleChange(id, state.val);
			}
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  */
	// private onMessage(obj: ioBroker.Message): void {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }
}

if (module.parent) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<ioBroker.AdapterOptions> | undefined) => new TimeSwitch(options);
} else {
	// otherwise start the instance directly
	(() => new TimeSwitch())();
}
