// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { SetStateValueActionSerializer } from './serialization/SetStateValueActionSerializer';
import { IoBrokerStateService } from './services/IoBrokerStateService';
import { TimeTriggerScheduler } from './scheduler/TimeTriggerScheduler';
import { Action } from './actions/Action';
import { TimeTrigger } from './triggers/TimeTrigger';

// Augment the adapter.config object with the actual types
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace ioBroker {
		interface AdapterConfig {
			// Define the shape of your options here (recommended)
			schedules: string[];
		}
	}
}

class TimeSwitch extends utils.Adapter {
	private scheduleToActions: Map<string, Action[]> = new Map<string, Action[]>();
	private scheduleToTimeTriggerScheduler: Map<string, TimeTriggerScheduler> = new Map<string, TimeTriggerScheduler>();
	private stateService = new IoBrokerStateService(this);
	private setStateActionSerializer = new SetStateValueActionSerializer(this.stateService);

	public constructor(options: Partial<ioBroker.AdapterOptions> = {}) {
		super({
			...options,
			name: 'time-switch',
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
		let schedulesFromSettings = this.config.schedules;

		let record = await this.getStatesAsync(`time-switch.${this.instance}.schedule*`);
		for (const fullId in record) {
			const id = this.convertToLocalId(fullId);
			if (schedulesFromSettings.includes(id)) {
				schedulesFromSettings = schedulesFromSettings.filter(i => i !== id);
				this.log.debug('Found state ' + id);
			} else {
				this.log.debug('Deleting state ' + id);
				await this.deleteStateAsync(id);
			}
		}
		for (const s of schedulesFromSettings) {
			this.log.debug('State ' + s + 'not found, creating');
			await this.createStateAsync('', '', s, { read: true, write: true, type: 'string', role: 'json' });
			const r = await this.setStateAsync(s, '{"alias": "", "enabled": false, "actions":[]}');
			this.log.debug('result: ' + r);
		}

		record = await this.getStatesAsync(`time-switch.${this.instance}.schedule*`);
		for (const fullId in record) {
			const id = this.convertToLocalId(fullId);
			this.log.debug('Creating scheduler for ' + id);
			this.scheduleToTimeTriggerScheduler.set(id, new TimeTriggerScheduler());
			this.scheduleToActions.set(id, []);
			const state = record[fullId];
			this.log.debug(`got state: ${state ? state.toString() : 'null'}`);
			if (state) {
				this.onScheduleChange(id, state.val);
			} else {
				this.log.error('Could not retrieve state');
			}
		}
		this.subscribeStates('*');
	}

	private convertToLocalId(fullId: string): string {
		const prefix = `time-switch.${this.instance}.`;
		return fullId.substr(prefix.length);
	}

	private registerAction(id: string, action: Action): void {
		if (action.getTrigger() instanceof TimeTrigger) {
			this.scheduleToTimeTriggerScheduler.get(id)?.register(action.getTrigger() as TimeTrigger, () => {
				this.log.info(`Action ${action.getId()} from ${id} triggered`);
				action.execute();
			});
			this.log.debug(`Registered trigger time trigger ${action.getTrigger()}`);
		} else {
			this.log.error(`No scheduler for trigger ${action.getTrigger()} found`);
		}
	}

	private unregisterAction(id: string, action: Action): void {
		if (action.getTrigger() instanceof TimeTrigger) {
			this.scheduleToTimeTriggerScheduler.get(id)?.unregister(action.getTrigger() as TimeTrigger);
			this.log.debug(`Unregistered trigger time trigger ${action.getTrigger()}`);
		} else {
			this.log.error(`No scheduler for trigger ${action.getTrigger()} found`);
		}
	}

	private onScheduleChange(id: string, scheduleString: string): void {
		this.log.debug('onScheduleChange: ' + scheduleString);
		if (this.scheduleToActions.has(id)) {
			this.scheduleToActions.get(id)?.forEach(a => {
				this.unregisterAction(id, a);
			});
		} else {
		}
		this.scheduleToActions.set(id, []);
		const schedule = JSON.parse(scheduleString);
		if (schedule.enabled == true) {
			this.log.debug('is enabled');
			const actions = schedule.actions.map((a: any) =>
				this.setStateActionSerializer.deserialize(JSON.stringify(a)),
			);
			this.log.debug(`actions length: ${actions.length}`);
			actions.forEach((a: Action) => {
				this.scheduleToActions.get(id)?.push(a);
				this.registerAction(id, a);
			});
		} else {
			this.log.debug('schedule not enabled');
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			for (const id in this.scheduleToActions.keys()) {
				this.scheduleToActions.get(id)?.forEach(a => {
					this.unregisterAction(id, a);
				});
			}
			this.scheduleToActions.clear();
			this.scheduleToTimeTriggerScheduler.clear();
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
			this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
			const pattern = `time-switch.${this.instance}.schedule`;
			if (id.startsWith(pattern)) {
				this.log.debug('is schedule id');
				this.onScheduleChange(this.convertToLocalId(id), state.val);
			}
		} else {
			// The state was deleted
			this.log.debug(`state ${id} deleted`);
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
