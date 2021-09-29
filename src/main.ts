// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { cancelJob, scheduleJob } from 'node-schedule';
import { getTimes } from 'suncalc';
import { Action } from './actions/Action';
import { Condition } from './actions/conditions/Condition';
import { Coordinate } from './Coordinate';
import { AstroTriggerScheduler } from './scheduler/AstroTriggerScheduler';
import { OneTimeTriggerScheduler } from './scheduler/OneTimeTriggerScheduler';
import { TimeTriggerScheduler } from './scheduler/TimeTriggerScheduler';
import { UniversalTriggerScheduler } from './scheduler/UniversalTriggerScheduler';
import { Schedule } from './schedules/Schedule';
import { AstroTriggerSerializer } from './serialization/AstroTriggerSerializer';
import { ConditionActionSerializer } from './serialization/ConditionActionSerializer';
import { StringStateAndConstantConditionSerializer } from './serialization/conditions/StringStateAndConstantConditionSerializer';
import { StringStateAndStateConditionSerializer } from './serialization/conditions/StringStateAndStateConditionSerializer';
import { OneTimeTriggerSerializer } from './serialization/OneTimeTriggerSerializer';
import { OnOffScheduleSerializer } from './serialization/OnOffScheduleSerializer';
import { OnOffStateActionSerializer } from './serialization/OnOffStateActionSerializer';
import { TimeTriggerSerializer } from './serialization/TimeTriggerSerializer';
import { UniversalSerializer } from './serialization/UniversalSerializer';
import { IoBrokerLoggingService } from './services/IoBrokerLoggingService';
import { IoBrokerStateService } from './services/IoBrokerStateService';
import { MessageService } from './services/MessageService';
import { Trigger } from './triggers/Trigger';

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
			this.log.debug(`got state: ${state ? state.toString() : 'null'} with id: ${id}`);
			if (state) {
				this.onScheduleChange(id, state.val as string);
			} else {
				this.log.error(`Could not retrieve state for ${id}`);
			}
		}
		this.subscribeStates(`time-switch.${this.instance}.*`);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		this.log.info('cleaning everything up...');
		try {
			for (const id in this.scheduleIdToSchedule.keys()) {
				try {
					this.scheduleIdToSchedule.get(id)?.destroy();
				} catch (e) {
					this.logError(e);
				}
			}
			this.scheduleIdToSchedule.clear();
		} catch (e) {
			this.logError(e);
		} finally {
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
			this.logError(e);
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
			this.createNewOnOffScheduleSerializer.bind(this),
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
			this.log.debug('Onoff state ' + i + ' not found, creating');
			await this.createOnOffSchedule(i);
		}
	}

	private async deleteOnOffSchedule(id: number): Promise<void> {
		await this.deleteChannelAsync('onoff', id.toString());
	}

	private async createOnOffSchedule(id: number): Promise<void> {
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
				"onAction": {
					"type":"OnOffStateAction",
					"valueType":"boolean",
					"onValue":true,
					"offValue":false,
					"booleanValue":true,
					"idsOfStatesToSet":["default.state"]
					},
				"offAction": {
					"type":"OnOffStateAction",
					"valueType":"boolean",
					"onValue":true,
					"offValue":false,
					"booleanValue":false,
					"idsOfStatesToSet":["default.state"]
				},
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

		try {
			const schedule = (await this.createNewOnOffScheduleSerializer(id)).deserialize(scheduleString);
			const enabledState = await this.getStateAsync(TimeSwitch.getEnabledIdFromScheduleId(id));
			if (enabledState) {
				this.scheduleIdToSchedule.get(id)?.destroy();
				schedule.setEnabled(enabledState.val as boolean);
				this.scheduleIdToSchedule.set(id, schedule);
			} else {
				this.log.error(`Could not retrieve state enabled state for ${id}`);
			}
		} catch (e) {
			this.logError(e);
		}
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

	private logError(error: Error): void {
		this.log.error(error.stack || `${error.name}: ${error.message}`);
	}

	private async createNewOnOffScheduleSerializer(dataId: string): Promise<OnOffScheduleSerializer> {
		const actionSerializer = new UniversalSerializer<Action>([new OnOffStateActionSerializer(this.stateService)]);
		actionSerializer.useSerializer(
			new ConditionActionSerializer(
				new UniversalSerializer<Condition>([
					new StringStateAndConstantConditionSerializer(this.stateService),
					new StringStateAndStateConditionSerializer(this.stateService),
				]),
				actionSerializer,
				this.loggingService,
			),
		);
		const triggerSerializer = new UniversalSerializer<Trigger>([
			new TimeTriggerSerializer(actionSerializer),
			new AstroTriggerSerializer(actionSerializer),
			new OneTimeTriggerSerializer(actionSerializer, (triggerId: string) => {
				this.messageService?.handleMessage(({
					message: {
						dataId: dataId,
						triggerId: triggerId,
					},
					command: 'delete-trigger',
					from: 'time-switch.0',
				} as any) as ioBroker.Message);
			}),
		]);
		return new OnOffScheduleSerializer(
			new UniversalTriggerScheduler([
				new TimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService),
				new AstroTriggerScheduler(
					new TimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService),
					getTimes,
					await this.getCoordinate(),
					this.loggingService,
				),
				new OneTimeTriggerScheduler(scheduleJob, cancelJob, this.loggingService),
			]),
			actionSerializer,
			triggerSerializer,
		);
	}
}

if (module.parent) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new TimeSwitch(options);
} else {
	// otherwise start the instance directly
	(() => new TimeSwitch())();
}
