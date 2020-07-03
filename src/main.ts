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
import { AstroTriggerSerializer } from './serialization/AstroTriggerSerializer';
import { AstroTriggerScheduler } from './scheduler/AstroTriggerScheduler';
import { getTimes } from 'suncalc';
import { Coordinate } from './Coordinate';

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

	private coordinate: Coordinate | undefined;

	private actionSerializer = new UniversalSerializer<Action>([new OnOffStateActionSerializer(this.stateService)]);
	private triggerSerializer = new UniversalSerializer<Trigger>([
		new TimeTriggerSerializer(this.actionSerializer),
		new AstroTriggerSerializer(this.actionSerializer),
	]);
	private messageService: MessageService | undefined;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'time-switch',
		});
		this.on('ready', this.onReady.bind(this));
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
		await this.initMessageService();
		await this.fixStateStructure(this.config.schedules);
		const record = await this.getStatesAsync(`time-switch.${this.instance}.*.data`);
		for (const id in record) {
			const state = record[id];
			this.log.debug(`got state: ${state ? state.toString() : 'null'}`);
			if (state) {
				const schedule = (await this.createNewOnOffScheduleSerializer()).deserialize(state.val as string);
				const enabledState = await this.getStateAsync(TimeSwitch.getEnabledIdFromScheduleId(id));
				if (enabledState) {
					schedule.setEnabled(enabledState.val as boolean);
					this.scheduleIdToSchedule.set(id, schedule);
				} else {
					this.log.error(`Could not retrieve state enabled state for ${id}`);
				}
			} else {
				this.log.error(`Could not retrieve state for ${id}`);
			}
		}
		this.subscribeStates('*');
		this.subscribeForeignObjects('system.config');
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			for (const id in this.scheduleIdToSchedule.keys()) {
				this.scheduleIdToSchedule.get(id)?.destroy();
			}
			this.scheduleIdToSchedule.clear();
			this.log.info('cleaned everything up...');
			callback();
		} catch (e) {
			callback();
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

		if (state.ack) {
			this.log.debug(`Ignoring state change for ${id} with ack=true`);
			return;
		}

		this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		if (id.startsWith(`time-switch.${this.instance}`)) {
			if (id.endsWith('data')) {
				this.log.debug('is schedule id');
				await this.onScheduleChange(id, state.val as string);
			} else if (id.endsWith('enabled')) {
				this.log.debug('is enabled id');
				const dataId = TimeSwitch.getScheduleIdFromEnabledId(id);
				const scheduleData = (await this.getStateAsync(dataId))?.val;
				await this.onScheduleChange(dataId, scheduleData as string);
			}
			// Confirm state change with ack=true
			this.stateService.setState(id, state.val as string, true);
		}
	}

	/**
	 * Is called when adapter receives a message.
	 */
	private async onMessage(obj: ioBroker.Message): Promise<void> {
		try {
			if (this.messageService) {
				await this.messageService.handleMessage(obj);
			} else {
				this.log.error('Message service not initialized');
			}
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

	private async initMessageService(): Promise<void> {
		this.messageService = new MessageService(
			this.stateService,
			this.loggingService,
			this.scheduleIdToSchedule,
			this.triggerSerializer,
			this.actionSerializer,
			await this.createNewOnOffScheduleSerializer(),
		);
	}

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
					statesInSettings.onOff = statesInSettings.onOff.filter((i) => i !== id);
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
		const schedule = (await this.createNewOnOffScheduleSerializer()).deserialize(scheduleString);
		const enabledState = await this.getStateAsync(TimeSwitch.getEnabledIdFromScheduleId(id));
		if (enabledState) {
			this.scheduleIdToSchedule.get(id)?.destroy();
			schedule.setEnabled(enabledState.val as boolean);
			this.scheduleIdToSchedule.set(id, schedule);
		} else {
			this.log.error(`Could not retrieve state enabled state for ${id}`);
		}
	}

	private async createNewOnOffScheduleSerializer(): Promise<OnOffScheduleSerializer> {
		return new OnOffScheduleSerializer(
			new UniversalTriggerScheduler([
				new TimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService),
				new AstroTriggerScheduler(
					new TimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService),
					getTimes,
					await this.getCoordinate(),
				),
			]),
			this.actionSerializer,
			this.triggerSerializer,
		);
	}

	private async getCoordinate(): Promise<Coordinate> {
		if (this.coordinate) {
			return Promise.resolve(this.coordinate);
		} else {
			return new Promise((resolve, _) => {
				this.getForeignObject('system.config', (error, obj) => {
					if (obj && obj.common) {
						const lat = (obj.common as any).latitude;
						const long = (obj.common as any).longitude;
						if (lat && long) {
							this.log.debug(`Got coordinates lat=${lat} long=${long}`);
							resolve(new Coordinate(lat, long));
							return;
						}
					}
					this.log.error(
						'Could not read coordinates from system.config, using Berlins coordinates as fallback',
					);
					resolve(new Coordinate(52, 13));
				});
			});
		}
	}
}

if (module.parent) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new TimeSwitch(options);
} else {
	// otherwise start the instance directly
	(() => new TimeSwitch())();
}
