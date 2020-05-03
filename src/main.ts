// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { IoBrokerStateService } from './services/IoBrokerStateService';
import { TimeTriggerScheduler } from './scheduler/TimeTriggerScheduler';
import { TimeTriggerSerializer } from './serialization/TimeTriggerSerializer';
import { OnOffStateActionSerializer } from './serialization/OnOffStateActionSerializer';
import { Trigger } from './triggers/Trigger';
import { UniversalTriggerScheduler } from './scheduler/UniversalTriggerScheduler';
import { UniversalTriggerSerializer } from './serialization/UniversalTriggerSerializer';
import { TimeTriggerBuilder } from './triggers/TimeTriggerBuilder';
import { AllWeekdays } from './triggers/Weekday';
import { OnOffStateActionBuilder } from './actions/OnOffStateActionBuilder';
import { OnOffStateAction } from './actions/OnOffStateAction';
import { Action } from './actions/Action';

// Augment the adapter.config object with the actual types
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace ioBroker {
		interface AdapterConfig {
			// Define the shape of your options here (recommended)
			schedules: {
				onOff: [];
			};
		}
	}
}

class TimeSwitch extends utils.Adapter {
	private scheduleToScheduler: Map<string, UniversalTriggerScheduler> = new Map<string, UniversalTriggerScheduler>();
	private stateService = new IoBrokerStateService(this);
	private currentMessage: ioBroker.Message | null = null;

	private triggerSerializer = new UniversalTriggerSerializer([
		new TimeTriggerSerializer([new OnOffStateActionSerializer(this.stateService)]),
	]);

	public constructor(options: Partial<ioBroker.AdapterOptions> = {}) {
		super({
			...options,
			name: 'time-switch',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('objectChange', this.onObjectChange.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		this.log.info('new timeswitch');
		await this.fixStateStructure(this.config.schedules);
		const record = await this.getStatesAsync(`time-switch.${this.instance}.*.data`);
		for (const id in record) {
			this.log.debug('Creating scheduler for ' + id);
			this.scheduleToScheduler.set(id, this.createNewScheduler());
			const state = record[id];
			this.log.debug(`got state: ${state ? state.toString() : 'null'}`);
			if (state) {
				await this.onScheduleChange(id, state.val);
			} else {
				this.log.error('Could not retrieve state');
			}
		}
		this.subscribeStates('*');
	}

	private async fixStateStructure(statesInSettings: { onOff: number[] }): Promise<void> {
		const prefix = `time-switch.${this.instance}.`;
		const currentStates = await this.getStatesAsync(`${prefix}*.data`);
		for (const fullId in currentStates) {
			const split = fullId.split('.');
			const type = split[2];
			const id = Number.parseInt(split[3], 10);
			if (type == 'onoff') {
				if (statesInSettings.onOff.includes(id)) {
					statesInSettings.onOff = statesInSettings.onOff.filter(i => i !== id);
					this.log.debug('Found state ' + fullId);
				} else {
					this.log.debug('Deleting state ' + fullId);
					await this.deleteOnOffSchedule(id);
				}
			}
		}
		for (const i of statesInSettings.onOff) {
			this.log.debug('Onoff state ' + i + 'not found, creating');
			await this.createOnOffSchedule(i);
		}
	}

	private async deleteOnOffSchedule(id: number) {
		const prefix = `onoff.${id}.`;
		this.log.debug('deleting ' + prefix + 'enabled');
		// await this.deleteStateAsync(prefix + 'data');
		// await this.deleteStateAsync(prefix + 'enabled');
		await this.deleteChannelAsync('onoff', id.toString());
	}

	private async createOnOffSchedule(id: number) {
		await this.createDeviceAsync('onoff');
		await this.createChannelAsync('onoff', id.toString());
		await this.createStateAsync('onoff', id.toString(), 'data', {
			read: true,
			write: true,
			type: 'string',
			role: 'json',
			def: '{"name": "New Schedule", "triggers":[]}',
			desc: 'Contains the schedule data (triggers, etc.)',
		});
		await this.createStateAsync('onoff', id.toString(), 'enabled', {
			read: true,
			write: true,
			type: 'boolean',
			role: 'switch',
			def: false,
			desc: 'Enables/disables automatic switching for this schedule',
		});
	}

	private async onScheduleChange(id: string, scheduleString: string): Promise<void> {
		this.log.debug('onScheduleChange: ' + scheduleString + ' ' + id);
		this.log.debug('scheduler found: ' + this.scheduleToScheduler.get(id));
		this.scheduleToScheduler.get(id)?.unregisterAll();
		const schedule = JSON.parse(scheduleString);
		if ((await this.getStateAsync(id.replace('data', 'enabled')))?.val) {
			this.log.debug('is enabled');
			this.log.debug('triggers: ' + schedule.triggers);
			this.log.debug('triggers.map: ' + schedule.triggers?.map);
			const triggers = schedule.triggers.map((t: any) => this.triggerSerializer.deserialize(JSON.stringify(t)));
			this.log.debug(`triggers length: ${triggers.length}`);
			triggers.forEach((t: Trigger) => {
				this.scheduleToScheduler.get(id)?.register(t);
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
			for (const id in this.scheduleToScheduler.keys()) {
				this.scheduleToScheduler.get(id)?.unregisterAll();
			}
			this.scheduleToScheduler.clear();
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
	private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
		if (state) {
			// The state was changed
			this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
			if (id.startsWith(`time-switch.${this.instance}`)) {
				if (id.endsWith('data')) {
					this.log.debug('is schedule id');
					await this.onScheduleChange(id, state.val);
				} else if (id.endsWith('enabled')) {
					this.log.debug('is enabled id');
					const dataId = id.replace('enabled', 'data');
					const scheduleData = (await this.getStateAsync(dataId))?.val;
					await this.onScheduleChange(dataId, scheduleData);
				}
			}
		} else {
			// The state was deleted
			this.log.debug(`state ${id} deleted`);
		}
	}

	/**
	 * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	 * Using this method requires "common.message" property to be set to true in io-package.json
	 */
	private async onMessage(obj: ioBroker.Message): Promise<void> {
		if (this.currentMessage) {
			setTimeout(() => this.onMessage(obj), 500);
			return;
		}
		this.currentMessage = obj;
		const data: any = obj.message;
		this.log.info(`Received ${obj.command}`);
		switch (obj.command) {
			case 'add-trigger':
				await this.addTrigger(data);
				break;
			case 'update-trigger':
				await this.updateTrigger(data.dataId, JSON.stringify(data.trigger));
				break;
			case 'delete-trigger':
				await this.deleteTrigger(data.dataId, data.id);
				break;
			case 'change-name':
				await this.changeScheduleName(data.dataId, data.name);
				break;
			case 'enable-schedule':
				await this.changeScheduleEnabled(data, true);
				break;
			case 'disable-schedule':
				await this.changeScheduleEnabled(data, false);
				break;
			case 'change-switched-values':
				await this.changeSwitchedValues(data);
				break;
			case 'change-switched-ids':
				await this.changeSwitchedIds(data);
				break;
			default:
				this.log.error('Unknown command received');
				break;
		}
		this.log.info('Finished message ' + obj.command);
		this.currentMessage = null;
	}

	private async addTrigger(data: any): Promise<void> {
		const currentTriggers = await this.getTriggers(data.dataId);
		let newTrigger: Trigger;
		if (currentTriggers) {
			if (data.triggerType === 'TimeTrigger') {
				this.log.info('Wants TimeTrigger');
				const triggerBuilder = new TimeTriggerBuilder()
					.setWeekdays(AllWeekdays)
					.setHour(0)
					.setMinute(0)
					.setId(this.getNextTriggerId(currentTriggers));
				if (data.actionType === 'OnOffValueAction') {
					this.log.info('Wants OnOffValueAction');
					const actionBuilder = new OnOffStateActionBuilder()
						.setStateService(this.stateService)
						.setIdsOfStatesToSet(data.stateIds)
						.setBooleanValue(true);
					if (data.valueType === 'boolean') {
						actionBuilder.setOnValue(true).setOffValue(false);
					} else {
						actionBuilder.setOnValue(data.onValue).setOffValue(data.offValue);
					}
					triggerBuilder.setAction(actionBuilder.build());
				} else {
					this.log.error(`Cannot add trigger with action of type ${data.actionType}`);
					return;
				}
				newTrigger = triggerBuilder.build();
			} else {
				this.log.error(`Cannot add trigger of type ${data.triggerType}`);
				return;
			}
			currentTriggers.push(newTrigger);
			await this.updateTriggers(data.dataId, currentTriggers);
		} else {
			this.log.error('No schedule found for state ' + data.dataId);
		}
	}

	private async updateTrigger(scheduleId: string, triggerString: string): Promise<void> {
		const updated = this.triggerSerializer.deserialize(triggerString);
		if (updated) {
			const current = await this.getTriggers(scheduleId);
			const index = current.findIndex(t => t.getId() === updated.getId());
			if (index == -1) {
				this.log.error('Cannot update trigger, trigger was not found');
			} else {
				current[index] = updated;
				this.updateTriggers(scheduleId, current);
			}
		} else {
			this.log.error('Invalid trigger, cannot update');
		}
	}

	private async deleteTrigger(scheduleId: string, triggerId: string): Promise<void> {
		const current = await this.getTriggers(scheduleId);
		this.updateTriggers(
			scheduleId,
			current.filter(t => t.getId() !== triggerId),
		);
	}

	private async updateTriggers(scheduleId: string, newTriggers: Trigger[]): Promise<void> {
		const current = await this.getScheduleFromState(scheduleId);
		current.triggers = newTriggers.map(t => JSON.parse(this.triggerSerializer.serialize(t)));
		await this.setStateAsync(scheduleId, JSON.stringify(current));
	}

	private async getTriggers(scheduleId: string): Promise<Trigger[]> {
		return (await this.getScheduleFromState(scheduleId)).triggers.map((t: any) =>
			this.triggerSerializer.deserialize(JSON.stringify(t)),
		);
	}

	private getNextTriggerId(current: Trigger[]): string {
		const numbers = current
			.map(t => t.getId())
			.map(id => Number.parseInt(id, 10))
			.sort((a, b) => a - b);
		let newId = 0;
		for (let i = 0; i < numbers.length; i++) {
			if (numbers[i] > newId) {
				break;
			} else {
				newId++;
			}
		}
		return newId.toString();
	}

	private async changeScheduleName(scheduleId: string, newName: string) {
		const current = await this.getScheduleFromState(scheduleId);
		current.name = newName;
		await this.setStateAsync(scheduleId, JSON.stringify(current));
	}

	private async changeScheduleEnabled(scheduleId: string, enabled: boolean) {
		await this.setStateAsync(scheduleId.replace('data', 'enabled'), enabled);
	}

	private async getScheduleFromState(scheduleId: string): Promise<Schedule> {
		const state = await this.getStateAsync(scheduleId);
		if (state) {
			return JSON.parse(state.val);
		} else {
			throw new Error(`Cannot find schedule for id ${scheduleId}`);
		}
	}

	private async changeSwitchedValues(data: any): Promise<void> {
		const newTriggers = (await this.getTriggers(data.dataId)).map(t => {
			const action = t.getAction();
			if (action instanceof OnOffStateAction) {
				let newAction: Action | null = null;
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
	}

	private async changeSwitchedIds(data: any): Promise<void> {
		const newTriggers = (await this.getTriggers(data.dataId)).map(t => {
			const action = t.getAction();
			if (action instanceof OnOffStateAction) {
				action.setIdsOfStatesToSet(data.stateIds);
			}
			return t;
		});
		this.updateTriggers(data.dataId, newTriggers);
	}

	private createNewScheduler(): UniversalTriggerScheduler {
		return new UniversalTriggerScheduler([new TimeTriggerScheduler()]);
	}
}

if (module.parent) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<ioBroker.AdapterOptions> | undefined) => new TimeSwitch(options);
} else {
	// otherwise start the instance directly
	(() => new TimeSwitch())();
}

interface Schedule {
	name: string;
	triggers: Trigger[];
}
