import * as TypeMoq from 'typemoq';
import { OnOffScheduleSerializer } from '../../../src/serialization/OnOffScheduleSerializer';
import { UniversalSerializer } from '../../../src/serialization/UniversalSerializer';
import { Trigger } from '../../../src/triggers/Trigger';
import { Action } from '../../../src/actions/Action';
import { TimeTriggerSerializer } from '../../../src/serialization/TimeTriggerSerializer';
import { OnOffStateActionSerializer } from '../../../src/serialization/OnOffStateActionSerializer';
import { StateService } from '../../../src/services/StateService';
import { UniversalTriggerScheduler } from '../../../src/scheduler/UniversalTriggerScheduler';
import { OnOffSchedule } from '../../../src/schedules/OnOffSchedule';
import { OnOffStateAction } from '../../../src/actions/OnOffStateAction';
import { expect } from 'chai';
import { OnOffStateActionBuilder } from '../../../src/actions/OnOffStateActionBuilder';
import { TimeTriggerBuilder } from '../../../src/triggers/TimeTriggerBuilder';
import { TimeTrigger } from '../../../src/triggers/TimeTrigger';
import { Serializer } from '../../../src/serialization/Serializer';

describe('OnOffScheduleSerializer', () => {
	let stateService: TypeMoq.IMock<StateService>;
	let triggerSerializer: UniversalSerializer<Trigger>;
	let actionSerializer: UniversalSerializer<Action>;
	let triggerScheduler: TypeMoq.IMock<UniversalTriggerScheduler>;
	let sut: OnOffScheduleSerializer;
	let onAction: OnOffStateAction<string | number | boolean>;
	let offAction: OnOffStateAction<string | number | boolean>;

	beforeEach(() => {
		const actionBuilder = new OnOffStateActionBuilder()
			.setOnValue('on')
			.setOffValue('off')
			.setIdsOfStatesToSet(['ids'])
			.setStateService(TypeMoq.Mock.ofType<StateService>().object);
		onAction = actionBuilder.setBooleanValue(true).build();
		offAction = actionBuilder.setBooleanValue(true).build();

		triggerScheduler = TypeMoq.Mock.ofType<UniversalTriggerScheduler>();
		stateService = TypeMoq.Mock.ofType<StateService>();
		actionSerializer = new UniversalSerializer<Action>([new OnOffStateActionSerializer(stateService.object)]);
		triggerSerializer = new UniversalSerializer<Trigger>([new TimeTriggerSerializer(actionSerializer)]);
		sut = new OnOffScheduleSerializer(triggerScheduler.object, actionSerializer, triggerSerializer);
	});

	describe('serialize', () => {
		it('should serialize with name="Test Schedule"', () => {
			const schedule = new OnOffSchedule(onAction, offAction, triggerScheduler.object);
			schedule.setName('Test Schedule');
			schedule.setEnabled(true);

			const wantOnActionSerialized = actionSerializer.serialize(onAction);
			const wantOffActionSerialized = actionSerializer.serialize(offAction);

			const result = sut.serialize(schedule);
			const json = JSON.parse(result);
			expect(json.type).to.equal('OnOffSchedule');
			expect(json.name).to.equal('Test Schedule');
			expect(json.enabled).to.be.undefined; // Is in another state
			expect(json.onAction).to.deep.equal(JSON.parse(wantOnActionSerialized));
			expect(json.offAction).to.deep.equal(JSON.parse(wantOffActionSerialized));
			expect(json.triggers.length).to.equal(0);
		});

		it('should serialize OnOffStateActions of TimeTriggers as references', () => {
			const schedule = new OnOffSchedule(onAction, offAction, triggerScheduler.object);
			schedule.setEnabled(false);
			const t1 = new TimeTriggerBuilder()
				.setId('1')
				.setHour(10)
				.setMinute(15)
				.setWeekdays([1, 2, 6])
				.setAction(onAction)
				.build();
			const t2 = new TimeTriggerBuilder()
				.setId('2')
				.setHour(20)
				.setMinute(59)
				.setWeekdays([4, 5])
				.setAction(offAction)
				.build();
			schedule.addTrigger(t1);
			schedule.addTrigger(t2);

			const wantOnActionSerialized = actionSerializer.serialize(onAction);
			const wantOffActionSerialized = actionSerializer.serialize(offAction);

			const result = sut.serialize(schedule);
			const json = JSON.parse(result);
			expect(json.type).to.equal('OnOffSchedule');
			expect(json.name).to.equal('New Schedule');
			expect(json.enabled).to.be.undefined; // Is in another state
			expect(json.onAction).to.deep.equal(JSON.parse(wantOnActionSerialized));
			expect(json.offAction).to.deep.equal(JSON.parse(wantOffActionSerialized));
			checkSerializedTimeTrigger(json.triggers[0], t1);
			checkSerializedTimeTrigger(json.triggers[1], t2);
			expect(json.triggers[0].action).to.deep.equal({ type: 'OnOffStateAction', name: 'On' });
			expect(json.triggers[1].action).to.deep.equal({ type: 'OnOffStateAction', name: 'Off' });
		});
	});

	describe('deserialize', () => {
		it('should deserialize with and name="A serialized schedule"', () => {
			const serialized = `{
				"type": "OnOffSchedule",
				"name": "A serialized schedule",
				"onAction": ${actionSerializer.serialize(onAction)},
				"offAction": ${actionSerializer.serialize(offAction)},
				"triggers": []
			}`;
			const result = sut.deserialize(serialized);
			expect(result.isEnabled()).to.be.false;
			expect(result.getName()).to.equal('A serialized schedule');
			expect(result.getTriggers().length).to.equal(0);
		});

		it('should deserialize with TimeTriggers and OnOffStateAction references"', () => {
			const t1 = {
				type: 'TimeTrigger',
				id: '0',
				hour: 13,
				minute: 33,
				weekdays: [1, 2, 3],
				action: { type: 'OnOffStateAction', name: 'Off' },
			};
			const t2 = {
				type: 'TimeTrigger',
				id: '1',
				hour: 17,
				minute: 0,
				weekdays: [4, 5, 6],
				action: { type: 'OnOffStateAction', name: 'On' },
			};
			const serialized = `{
				"type": "OnOffSchedule",
				"name": "Another serialized schedule",
				"onAction": ${actionSerializer.serialize(onAction)},
				"offAction": ${actionSerializer.serialize(offAction)},
				"triggers": [
					${JSON.stringify(t1)},
					${JSON.stringify(t2)}
				]
			}`;
			const result = sut.deserialize(serialized);
			expect(result.isEnabled()).to.be.false;
			expect(result.getName()).to.equal('Another serialized schedule');
			checkDeserializedTimeTrigger(result.getTriggers()[0] as TimeTrigger, t1);
			checkDeserializedTimeTrigger(result.getTriggers()[1] as TimeTrigger, t2);
			expect(result.getTriggers()[0].getAction()).to.equal(result.getOffAction());
			expect(result.getTriggers()[1].getAction()).to.equal(result.getOnAction());
		});

		it('throws when type is not "OnOffSchedule"', () => {
			const serialized = `{
				"type": "AnotherScheduleType",
				"name": "Another serialized schedule",
				"onAction": ${actionSerializer.serialize(onAction)},
				"offAction": ${actionSerializer.serialize(offAction)},
				"triggers": []
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when onAction is no OnOffStateAction', () => {
			setUpWithAnotherActionSerializer();
			const serialized = `{
				"type": "OnOffSchedule",
				"name": "Another serialized schedule",
				"onAction": {"type": "AnotherAction"},
				"offAction": ${actionSerializer.serialize(offAction)},
				"triggers": []
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when offAction is no OnOffStateAction', () => {
			setUpWithAnotherActionSerializer();
			const serialized = `{
				"type": "OnOffSchedule",
				"name": "Another serialized schedule",
				"onAction": ${actionSerializer.serialize(onAction)},
				"offAction": {"type": "AnotherAction"},
				"triggers": []
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when type is missing', () => {
			const serialized = `{
				"name": "Another serialized schedule",
				"onAction": ${actionSerializer.serialize(onAction)},
				"offAction": ${actionSerializer.serialize(offAction)},
				"triggers": []
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when name is missing', () => {
			const serialized = `{
				"type": "OnOffSchedule",
				"onAction": ${actionSerializer.serialize(onAction)},
				"offAction": ${actionSerializer.serialize(offAction)},
				"triggers": []
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when onAction is missing', () => {
			const serialized = `{
				"type": "OnOffSchedule",
				"name": "Another serialized schedule",
				"offAction": ${actionSerializer.serialize(offAction)},
				"triggers": []
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when offAction is missing', () => {
			const serialized = `{
				"type": "OnOffSchedule",
				"name": "Another serialized schedule",
				"onAction": ${actionSerializer.serialize(onAction)},
				"triggers": []
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when triggers is missing', () => {
			const serialized = `{
				"type": "OnOffSchedule",
				"name": "Another serialized schedule",
				"onAction": ${actionSerializer.serialize(onAction)},
				"offAction": ${actionSerializer.serialize(offAction)},
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});
	});

	describe('getTriggerSerializer', () => {
		it('should return a trigger serializer that replaces OnOffActions with references when serializing', () => {
			const schedule = new OnOffSchedule(onAction, offAction, triggerScheduler.object);
			schedule.setEnabled(false);
			const t1 = new TimeTriggerBuilder()
				.setId('1')
				.setHour(10)
				.setMinute(15)
				.setWeekdays([1, 2, 6])
				.setAction(onAction)
				.build();

			const result = sut.getTriggerSerializer(schedule).serialize(t1);
			const json = JSON.parse(result);
			checkSerializedTimeTrigger(json, t1);
			expect(json.action).to.deep.equal({ type: 'OnOffStateAction', name: 'On' });
		});

		it('should return a trigger serializer that replaces OnOffActions with references when deserializing', () => {
			const schedule = new OnOffSchedule(onAction, offAction, triggerScheduler.object);
			schedule.setEnabled(false);
			const t1 = {
				type: 'TimeTrigger',
				id: '0',
				hour: 13,
				minute: 33,
				weekdays: [1, 2, 3],
				action: { type: 'OnOffStateAction', name: 'Off' },
			};

			const result = sut.getTriggerSerializer(schedule).deserialize(JSON.stringify(t1));
			checkDeserializedTimeTrigger(result as TimeTrigger, t1);
			expect(result.getAction()).to.equal(schedule.getOffAction());
		});

		it('throws when schedule is undefined', () => {
			expect(() => sut.getTriggerSerializer(undefined as any)).to.throw();
		});

		it('throws when schedule is null', () => {
			expect(() => sut.getTriggerSerializer(null as any)).to.throw();
		});
	});

	function checkSerializedTimeTrigger(got: any, wanted: TimeTrigger): void {
		expect(got.type).to.equal(TimeTrigger.prototype.constructor.name);
		expect(got.id).to.equal(wanted.getId());
		expect(got.hour).to.equal(wanted.getHour());
		expect(got.minute).to.equal(wanted.getMinute());
		expect(got.weekdays).to.deep.equal(wanted.getWeekdays());
	}
	function checkDeserializedTimeTrigger(got: TimeTrigger, wanted: any): void {
		expect(got.getId()).to.equal(wanted.id);
		expect(got.getHour()).to.equal(wanted.hour);
		expect(got.getMinute()).to.equal(wanted.minute);
		expect(got.getWeekdays()).to.deep.equal(wanted.weekdays);
	}

	function setUpWithAnotherActionSerializer() {
		class AnotherActionSerializer implements Serializer<Action> {
			deserialize(_: string): Action {
				return TypeMoq.Mock.ofType<Action>().object;
			}

			getType(): string {
				return 'AnotherAction';
			}

			serialize(_: Action): string {
				return '{"type": "AnotherAction"}';
			}
		}
		actionSerializer = new UniversalSerializer<Action>([
			new OnOffStateActionSerializer(stateService.object),
			new AnotherActionSerializer(),
		]);
		triggerSerializer = new UniversalSerializer<Trigger>([new TimeTriggerSerializer(actionSerializer)]);
		sut = new OnOffScheduleSerializer(triggerScheduler.object, actionSerializer, triggerSerializer);
	}
});
