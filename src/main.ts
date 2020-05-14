// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { IoBrokerStateService } from './services/IoBrokerStateService';
import { TimeTriggerScheduler } from './scheduler/TimeTriggerScheduler';
import { TimeTriggerSerializer } from './serialization/TimeTriggerSerializer';
import { Trigger } from './triggers/Trigger';
import { UniversalTriggerScheduler } from './scheduler/UniversalTriggerScheduler';
import { Action } from './actions/Action';
import { UniversalSerializer } from './serialization/UniversalSerializer';
import { IoBrokerLoggingService } from './services/IoBrokerLoggingService';
import { MessageService } from './services/MessageService';
import { Schedule } from './schedules/Schedule';
import { OnOffStateActionSerializer } from './serialization/OnOffStateActionSerializer';
import { OnOffStateActionBuilder } from './actions/OnOffStateActionBuilder';
import { OnOffScheduleSerializer } from './serialization/OnOffScheduleSerializer';
import { cancelJob, scheduleJob } from 'node-schedule';

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

export class TimeSwitch extends utils.Adapter {
	private scheduleIdToSchedule: Map<string, Schedule> = new Map<string, Schedule>();
	private loggingService = new IoBrokerLoggingService(this);
	private stateService = new IoBrokerStateService(this, this.loggingService);

	private actionSerializer = new UniversalSerializer<Action>([new OnOffStateActionSerializer(this.stateService)]);
	private triggerSerializer = new UniversalSerializer<Trigger>([new TimeTriggerSerializer(this.actionSerializer)]);
	private messageService = new MessageService(
		this.stateService,
		this.loggingService,
		this.scheduleIdToSchedule,
		this.triggerSerializer,
		this.actionSerializer,
		this.createNewOnOffScheduleSerializer(),
	);

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

	public static getEnabledIdFromScheduleId(scheduleId: string): string {
		return scheduleId.replace('data', 'enabled');
	}

	public static getScheduleIdFromEnabledId(scheduleId: string): string {
		return scheduleId.replace('enabled', 'data');
	}

	//------------------------------------------------------------------------------------------------------------------
	// Adapter live cycle methods
	//------------------------------------------------------------------------------------------------------------------

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		await this.fixStateStructure(this.config.schedules);
		const record = await this.getStatesAsync(`time-switch.${this.instance}.*.data`);
		for (const id in record) {
			const state = record[id];
			this.log.debug(`got state: ${state ? state.toString() : 'null'}`);
			if (state) {
				const schedule = this.createNewOnOffScheduleSerializer().deserialize(state.val);
				const enabledState = await this.getStateAsync(TimeSwitch.getEnabledIdFromScheduleId(id));
				if (enabledState) {
					schedule.setEnabled(enabledState.val);
					this.scheduleIdToSchedule.set(id, schedule);
				} else {
					this.log.error(`Could not retrieve state enabled state for ${id}`);
				}
			} else {
				this.log.error(`Could not retrieve state for ${id}`);
			}
		}
		this.subscribeStates('*');
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			for (const id in this.scheduleIdToSchedule.keys()) {
				this.scheduleIdToSchedule.get(id)?.removeAllTriggers();
			}
			this.scheduleIdToSchedule.clear();
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
		if (!state) {
			this.log.debug(`state ${id} deleted`);
			return;
		}

		if (state.from === 'system.adapter.time-switch.0') {
			this.log.debug(`change from adapter itself for ${id}`);
			return;
		}

		this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		if (id.startsWith(`time-switch.${this.instance}`)) {
			if (id.endsWith('data')) {
				this.log.debug('is schedule id');
				await this.onScheduleChange(id, state.val);
			} else if (id.endsWith('enabled')) {
				this.log.debug('is enabled id');
				const dataId = TimeSwitch.getScheduleIdFromEnabledId(id);
				const scheduleData = (await this.getStateAsync(dataId))?.val;
				await this.onScheduleChange(dataId, scheduleData);
			}
		}
	}

	/**
	 * Is called when adapter receives a message.
	 */
	private async onMessage(obj: ioBroker.Message): Promise<void> {
		try {
			await this.messageService.handleMessage(obj);
		} catch (e) {
			this.log.error(e.stack);
			this.log.error(e.message);
			this.log.error(e.name);
			this.log.error(`Could not handle message:`);
		}
	}

	//------------------------------------------------------------------------------------------------------------------
	// Private helper methods
	//------------------------------------------------------------------------------------------------------------------

	private async fixStateStructure(statesInSettings: { onOff: number[] }): Promise<void> {
		if (!statesInSettings) {
			statesInSettings = { onOff: [] };
		}
		if (!statesInSettings.onOff) {
			statesInSettings.onOff = [];
		}
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

	private async deleteOnOffSchedule(id: number): Promise<void> {
		await this.deleteChannelAsync('onoff', id.toString());
	}

	private async createOnOffSchedule(id: number): Promise<void> {
		const builder = new OnOffStateActionBuilder()
			.setOnValue(true)
			.setOffValue(false)
			.setStateService(this.stateService)
			.setIdsOfStatesToSet(['default.state']);
		const defOnAction = builder.setBooleanValue(true).build();
		const defOffAction = builder.setBooleanValue(false).build();
		await this.createDeviceAsync('onoff');
		await this.createChannelAsync('onoff', id.toString());
		await this.createStateAsync('onoff', id.toString(), 'data', {
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
		this.log.debug('schedule found: ' + this.scheduleIdToSchedule.get(id));
		const schedule = this.createNewOnOffScheduleSerializer().deserialize(scheduleString);
		const enabledState = await this.getStateAsync(TimeSwitch.getEnabledIdFromScheduleId(id));
		if (enabledState) {
			this.scheduleIdToSchedule.get(id)?.removeAllTriggers();
			schedule.setEnabled(enabledState.val);
			this.scheduleIdToSchedule.set(id, schedule);
		} else {
			this.log.error(`Could not retrieve state enabled state for ${id}`);
		}
	}

	private createNewOnOffScheduleSerializer(): OnOffScheduleSerializer {
		return new OnOffScheduleSerializer(
			new UniversalTriggerScheduler([new TimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService)]),
			this.actionSerializer,
			this.triggerSerializer,
		);
	}
}

if (module.parent) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<ioBroker.AdapterOptions> | undefined) => new TimeSwitch(options);
} else {
	// otherwise start the instance directly
	(() => new TimeSwitch())();
}
