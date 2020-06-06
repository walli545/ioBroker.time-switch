import * as TypeMoq from 'typemoq';
import { Weekday } from '../../../src/triggers/Weekday';
import { expect } from 'chai';
import { StateService } from '../../../src/services/StateService';
import { OnOffStateActionSerializer } from '../../../src/serialization/OnOffStateActionSerializer';
import { OnOffStateActionBuilder } from '../../../src/actions/OnOffStateActionBuilder';
import { Trigger } from '../../../src/triggers/Trigger';
import { fail } from 'assert';
import { OnOffStateAction } from '../../../src/actions/OnOffStateAction';
import { UniversalSerializer } from '../../../src/serialization/UniversalSerializer';
import { Action } from '../../../src/actions/Action';
import { AstroTriggerSerializer } from '../../../src/serialization/AstroTriggerSerializer';
import { AstroTriggerBuilder } from '../../../src/triggers/AstroTriggerBuilder';
import { AstroTime } from '../../../src/triggers/AstroTime';
import { AstroTrigger } from '../../../src/triggers/AstroTrigger';

describe('AstroTriggerSerializer', () => {
	const stateService = TypeMoq.Mock.ofType<StateService>();
	const onOffStateActionSerializer = new OnOffStateActionSerializer(stateService.object);
	const actionSerializer = new UniversalSerializer<Action>([onOffStateActionSerializer]);

	const onOffStateAction = new OnOffStateActionBuilder()
		.setOnValue('ON')
		.setOffValue('OFF')
		.setBooleanValue(true)
		.setIdsOfStatesToSet(['id.of.state1', 'id.of.state2'])
		.setStateService(stateService.object)
		.build();

	describe('serialize', () => {
		it('should serialize with OnOffStateAction', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const trigger = new AstroTriggerBuilder()
				.setAstroTime(AstroTime.Sunrise)
				.setShift(30)
				.setWeekdays([Weekday.Monday, Weekday.Thursday])
				.setAction(onOffStateAction)
				.build();
			const serialized = sut.serialize(trigger);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(AstroTrigger.prototype.constructor.name);
			expect(json.astroTime).to.equal(AstroTime.Sunrise);
			expect(json.shiftInMinutes).to.equal(30);
			expect(json.weekdays).to.deep.equal([Weekday.Monday, Weekday.Thursday]);
			expect(json.action).to.deep.equal(JSON.parse(onOffStateActionSerializer.serialize(onOffStateAction)));
		});

		it('throws when objectToSerialize is null', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			expect(() => sut.serialize(undefined as any)).to.throw();
		});

		it('throws when objectToSerialize is no instance of AstroTrigger', () => {
			const anotherTrigger = {
				getId: () => '0',
				getAction: () => onOffStateAction,
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				setAction: () => {},
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				trigger: () => {},
				getWeekdays: () => [Weekday.Monday],
			} as Trigger;
			const sut = new AstroTriggerSerializer(actionSerializer);
			expect(() => sut.serialize(anotherTrigger)).to.throw();
		});

		it('throws when no serializer for action was found', () => {
			const sut = new AstroTriggerSerializer(new UniversalSerializer<Action>([]));
			const trigger = new AstroTriggerBuilder()
				.setAstroTime(AstroTime.Sunrise)
				.setShift(30)
				.setWeekdays([Weekday.Monday, Weekday.Thursday])
				.setAction(onOffStateAction)
				.build();
			expect(() => sut.serialize(trigger)).to.throw();
		});
	});

	describe('deserialize', () => {
		it('should deserialize with OnOffStateAction', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"astroTime": "sunrise",
				"shiftInMinutes": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof AstroTrigger) {
				expect(deserialized.getId()).to.equal('0');
				expect(deserialized.getAstroTime()).to.equal(AstroTime.Sunrise);
				expect(deserialized.getShiftInMinutes()).to.equal(57);
				expect(deserialized.getWeekdays()).to.deep.equal([Weekday.Wednesday, Weekday.Friday, Weekday.Thursday]);
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

		it('throws when type is not AstroTrigger', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "somewrongtype",
				"id": "0",
				"astroTime": "sunset",
				"shiftInMinutes": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is empty', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = ``;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is invalid json', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `abc`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property type is missing', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"id": "0",
				"astroTime": "sunset",
				"shiftInMinutes": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property astroTime is missing', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"shiftInMinutes": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property shiftInMinutes is missing', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"astroTime": "sunset",
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property weekdays is missing', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"astroTime": "sunset",
				"shiftInMinutes": 57,
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property id is missing', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"astroTime": "sunset",
				"shiftInMinutes": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property action is missing', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"astroTime": "sunset",
				"shiftInMinutes": 57,
				"weekdays": [3, 5, 4],
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when action could not be deserialized', () => {
			const sut = new AstroTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"astroTime": "sunset",
				"shiftInMinutes": 57,
				"weekdays": [3, 5, 4],
				"action": {"abc": 3}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when no serializer for action was found', () => {
			const sut = new AstroTriggerSerializer(new UniversalSerializer<Action>([]));
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"astroTime": "sunset",
				"shiftInMinutes": 57,
				"weekdays": [3, 5, 4],
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});
	});
});
