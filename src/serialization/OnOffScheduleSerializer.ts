import { Serializer } from './Serializer';
import { OnOffSchedule } from '../schedules/OnOffSchedule';
import { UniversalTriggerScheduler } from '../scheduler/UniversalTriggerScheduler';
import { UniversalSerializer } from './UniversalSerializer';
import { Action } from '../actions/Action';
import { Trigger } from '../triggers/Trigger';
import { OnOffStateAction } from '../actions/OnOffStateAction';
import { ActionReferenceSerializer } from './ActionReferenceSerializer';

export class OnOffScheduleSerializer implements Serializer<OnOffSchedule> {
	constructor(
		private triggerScheduler: UniversalTriggerScheduler,
		private actionSerializer: UniversalSerializer<Action>,
		private triggerSerializer: UniversalSerializer<Trigger>,
	) {}

	deserialize(stringToDeserialize: string): OnOffSchedule {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== this.getType()) {
			throw new Error(`Can not deserialize object of type ${json.type}`);
		}
		const onAction = this.actionSerializer.deserialize(JSON.stringify(json.onAction));
		const offAction = this.actionSerializer.deserialize(JSON.stringify(json.offAction));

		if (onAction instanceof OnOffStateAction && offAction instanceof OnOffStateAction) {
			const schedule = new OnOffSchedule(onAction, offAction, this.triggerScheduler);
			schedule.setName(json.name);

			this.useActionReferenceSerializer(schedule);
			json.triggers.forEach((t: any) => {
				schedule.addTrigger(this.triggerSerializer.deserialize(JSON.stringify(t)));
			});

			return schedule;
		} else {
			throw new Error('Actions are not OnOffStateActions');
		}
	}

	serialize(schedule: OnOffSchedule): string {
		const json: any = {
			type: this.getType(),
			name: schedule.getName(),
			onAction: JSON.parse(this.actionSerializer.serialize(schedule.getOnAction())),
			offAction: JSON.parse(this.actionSerializer.serialize(schedule.getOffAction())),
		};
		this.useActionReferenceSerializer(schedule);
		json.triggers = schedule.getTriggers().map((t) => JSON.parse(this.triggerSerializer.serialize(t)));
		return JSON.stringify(json);
	}

	getType(): string {
		return 'OnOffSchedule';
	}

	public getTriggerSerializer(schedule: OnOffSchedule): UniversalSerializer<Trigger> {
		if (schedule == null) {
			throw new Error('Schedule may not be null/undefined');
		}
		this.useActionReferenceSerializer(schedule);
		return this.triggerSerializer;
	}

	private useActionReferenceSerializer(schedule: OnOffSchedule): void {
		this.actionSerializer.useSerializer(
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
