import { StateService } from './StateService';
import { Schedule } from '../schedules/Schedule';
import { LoggingService } from './LoggingService';
import { Trigger } from '../triggers/Trigger';
import { TimeTriggerBuilder } from '../triggers/TimeTriggerBuilder';
import { AllWeekdays } from '../triggers/Weekday';
import { UniversalSerializer } from '../serialization/UniversalSerializer';
import { OnOffStateAction } from '../actions/OnOffStateAction';
import { OnOffSchedule } from '../schedules/OnOffSchedule';
import { OnOffScheduleSerializer } from '../serialization/OnOffScheduleSerializer';
import { TimeSwitch } from '../main';
import { Serializer } from '../serialization/Serializer';
import { Action } from '../actions/Action';
import { ActionReferenceSerializer } from '../serialization/ActionReferenceSerializer';

export class MessageService {
	private currentMessage: ioBroker.Message | null = null;

	constructor(
		private stateService: StateService,
		private logger: LoggingService,
		private scheduleIdToSchedule: Map<string, Schedule>,
		private triggerSerializer: UniversalSerializer<Trigger>,
		private actionSerializer: UniversalSerializer<Action>,
		private onOffScheduleSerializer: OnOffScheduleSerializer,
	) {}

	public async handleMessage(message: ioBroker.Message): Promise<void> {
		if (this.currentMessage) {
			setTimeout(() => this.handleMessage(message), 50);
			return;
		}
		this.currentMessage = message;
		const data: any = message.message;
		this.logger.logDebug(`Received ${message.command}`);
		this.logger.logDebug(JSON.stringify(message.message));
		const schedule = this.scheduleIdToSchedule.get(data.dataId);
		if (!schedule) {
			throw new Error('No schedule found for state ' + data.dataId);
		}
		switch (message.command) {
			case 'add-trigger':
				await this.addTrigger(schedule, data);
				break;
			case 'update-trigger':
				await this.updateTrigger(schedule, JSON.stringify(data.trigger));
				break;
			case 'delete-trigger':
				schedule.removeTrigger(data.triggerId);
				break;
			case 'change-name':
				schedule.setName(data.name);
				break;
			case 'enable-schedule':
				schedule.setEnabled(true);
				await this.stateService.setState(TimeSwitch.getEnabledIdFromScheduleId(data.dataId), true);
				break;
			case 'disable-schedule':
				schedule.setEnabled(false);
				await this.stateService.setState(TimeSwitch.getEnabledIdFromScheduleId(data.dataId), false);
				break;
			case 'change-switched-values':
				this.changeOnOffSchedulesSwitchedValues(schedule, data);
				break;
			case 'change-switched-ids':
				this.changeOnOffSchedulesSwitchedIds(schedule, data.stateIds);
				break;
			default:
				throw new Error('Unknown command received');
		}
		if (schedule instanceof OnOffSchedule) {
			await this.stateService.setState(data.dataId, this.onOffScheduleSerializer.serialize(schedule));
		} else {
			throw new Error('Cannot update schedule state after message, not serializer found for schedule');
		}
		this.logger.logDebug('Finished message ' + message.command);
		this.currentMessage = null;
	}

	private addTrigger(schedule: Schedule, data: any): void {
		let newTrigger: Trigger;
		if (data.triggerType === 'TimeTrigger') {
			this.logger.logDebug('Wants TimeTrigger');
			const triggerBuilder = new TimeTriggerBuilder()
				.setWeekdays(AllWeekdays)
				.setHour(0)
				.setMinute(0)
				.setId(this.getNextTriggerId(schedule.getTriggers()));
			if (data.actionType === 'OnOffValueAction' && schedule instanceof OnOffSchedule) {
				this.logger.logDebug('Wants OnOffValueAction');
				triggerBuilder.setAction(schedule.getOnAction());
			} else {
				throw new Error(`Cannot add trigger with action of type ${data.actionType}`);
			}
			newTrigger = triggerBuilder.build();
		} else {
			throw new Error(`Cannot add trigger of type ${data.triggerType}`);
		}
		schedule.addTrigger(newTrigger);
	}

	private async updateTrigger(schedule: Schedule, triggerString: string): Promise<void> {
		let updated;
		if (schedule instanceof OnOffSchedule) {
			const oldActionSerializer = this.replaceActionSerializerWithReference(schedule);
			try {
				updated = this.triggerSerializer.deserialize(triggerString);
			} finally {
				this.actionSerializer.replaceSerializer(oldActionSerializer);
			}
		} else {
			updated = this.triggerSerializer.deserialize(triggerString);
		}
		schedule.updateTrigger(updated);
	}

	private changeOnOffSchedulesSwitchedValues(schedule: Schedule, data: any): void {
		if (!(schedule instanceof OnOffSchedule)) {
			throw new Error('Cannot change switched values when schedule type is not OnOffSchedule');
		}
		schedule.setOnAction(this.changeSwitchedValueOfOnOffScheduleAction(schedule.getOnAction(), data));
		schedule.setOffAction(this.changeSwitchedValueOfOnOffScheduleAction(schedule.getOffAction(), data));
	}

	private changeOnOffSchedulesSwitchedIds(schedule: Schedule, stateIds: string[]): void {
		if (!(schedule instanceof OnOffSchedule)) {
			throw new Error('Cannot change switched ids when schedule type is not OnOffSchedule');
		}
		schedule.getOnAction().setIdsOfStatesToSet(stateIds);
		schedule.getOffAction().setIdsOfStatesToSet(stateIds);
	}

	private changeSwitchedValueOfOnOffScheduleAction(
		action: OnOffStateAction<string | number | boolean>,
		data: any,
	): OnOffStateAction<string | number | boolean> {
		switch (data.valueType) {
			case 'boolean':
				return action.toBooleanValueType();
				break;
			case 'number':
				return action.toNumberValueType(data.onValue, data.offValue);
				break;
			case 'string':
				return action.toStringValueType(data.onValue, data.offValue);
				break;
			default:
				throw new Error(`Value Type ${data.valueType} not supported`);
		}
	}

	private getNextTriggerId(current: Trigger[]): string {
		const numbers = current
			.map(t => t.getId())
			.map(id => Number.parseInt(id, 10))
			.filter(id => !Number.isNaN(id))
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

	private replaceActionSerializerWithReference(schedule: OnOffSchedule): Serializer<Action> {
		return this.actionSerializer.replaceSerializer(
			new ActionReferenceSerializer(
				OnOffStateAction.prototype.constructor.name,
				new Map([
					['On', schedule.getOnAction()],
					['Off', schedule.getOffAction()],
				]),
			),
		);
	}
}
