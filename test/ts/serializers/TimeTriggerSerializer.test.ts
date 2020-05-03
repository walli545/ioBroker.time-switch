import * as TypeMoq from 'typemoq';
import { TimeTriggerSerializer } from '../../../src/serialization/TimeTriggerSerializer';
import { TimeTrigger } from '../../../src/triggers/TimeTrigger';
import { Weekday } from '../../../src/triggers/Weekday';
import { expect } from 'chai';
import { StateService } from '../../../src/services/StateService';
import { OnOffStateActionSerializer } from '../../../src/serialization/OnOffStateActionSerializer';
import { TimeTriggerBuilder } from '../../../src/triggers/TimeTriggerBuilder';
import { OnOffStateActionBuilder } from '../../../src/actions/OnOffStateActionBuilder';
import { Trigger } from '../../../src/triggers/Trigger';
import { fail } from 'assert';
import { OnOffStateAction } from '../../../src/actions/OnOffStateAction';

describe('TimeTriggerSerializer', () => {
	const stateService = TypeMoq.Mock.ofType<StateService>();
	const onOffStateActionSerializer = new OnOffStateActionSerializer(stateService.object);
	const onOffStateAction = new OnOffStateActionBuilder()
		.setOnValue('ON')
		.setOffValue('OFF')
		.setBooleanValue(true)
		.setIdsOfStatesToSet(['id.of.state1', 'id.of.state2'])
		.setStateService(stateService.object)
		.build();

	describe('serialize', () => {
		it('should serialize with OnOffStateAction', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const trigger = new TimeTriggerBuilder()
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday, Weekday.Thursday])
				.setAction(onOffStateAction)
				.build();
			const serialized = sut.serialize(trigger);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(TimeTrigger.prototype.constructor.name);
			expect(json.hour).to.equal(12);
			expect(json.minute).to.equal(30);
			expect(json.weekdays.length).to.equal(2);
			expect(json.weekdays.includes(Weekday.Monday)).to.equal(true);
			expect(json.weekdays.includes(Weekday.Thursday)).to.equal(true);
			expect(json.action).to.deep.equal(JSON.parse(onOffStateActionSerializer.serialize(onOffStateAction)));
		});

		it('throws when objectToSerialize is null', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			expect(() => sut.serialize(undefined as any)).to.throw();
		});

		it('throws when objectToSerialize is no instance of TimeTrigger', () => {
			const anotherTrigger = {
				getId: () => '0',
				getAction: () => onOffStateAction,
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				setAction: () => {},
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				trigger: () => {},
				getWeekdays: () => [Weekday.Monday],
			} as Trigger;
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			expect(() => sut.serialize(anotherTrigger)).to.throw();
		});

		it('throws when no serializer for action was found', () => {
			const sut = new TimeTriggerSerializer([]);
			const trigger = new TimeTriggerBuilder()
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday, Weekday.Thursday])
				.setAction(onOffStateAction)
				.build();
			expect(() => sut.serialize(trigger)).to.throw();
		});
	});

	describe('deserialize', () => {
		it('should deserialize with OnOffStateAction', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"hour": 5,
				"minute": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof TimeTrigger) {
				expect(deserialized.getId()).to.equal('0');
				expect(deserialized.getHour()).to.equal(5);
				expect(deserialized.getMinute()).to.equal(57);
				expect(deserialized.getWeekdays().length).to.equal(3);
				expect(deserialized.getWeekdays().includes(Weekday.Thursday)).to.equal(true);
				expect(deserialized.getWeekdays().includes(Weekday.Wednesday)).to.equal(true);
				expect(deserialized.getWeekdays().includes(Weekday.Friday)).to.equal(true);
			} else {
				fail(`Deserialization produced wrong trigger type`);
			}
			const action = deserialized.getAction();
			if (action instanceof OnOffStateAction) {
				expect(action.getOffValue()).to.equal('OFF');
				expect(action.getOnValue()).to.equal('ON');
				expect(action.getBooleanValue()).to.be.true;
			} else {
				fail(`Deserialization produced wrong action type`);
			}
		});

		it('throws when type is not time', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"type": "somewrongtype",
				"id": "0",
				"hour": 5,
				"minute": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is empty', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = ``;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is invalid json', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `abc`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property type is missing', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"id": "0",
				"hour": 5,
				"minute": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property hour is missing', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"minute": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property minute is missing', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"hour": 5,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property weekdays is missing', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"hour": 5,
				"minute": 57,
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property id is missing', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"type": "${sut.getType()}",
				"hour": 5,
				"minute": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property action is missing', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"hour": 5,
				"minute": 57,
				"weekdays": [3, 5, 4],
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when action could not be deserialized', () => {
			const sut = new TimeTriggerSerializer([onOffStateActionSerializer]);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"hour": 5,
				"minute": 57,
				"weekdays": [3, 5, 4],
				"action": {"abc": 3}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when no serializer for action was found', () => {
			const sut = new TimeTriggerSerializer([]);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"hour": 5,
				"minute": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});
	});
});
