import { fail } from 'assert';
import { expect } from 'chai';
import * as TypeMoq from 'typemoq';
import { It, Times } from 'typemoq';
import { Action } from '../../../src/actions/Action';
import { OnOffStateAction } from '../../../src/actions/OnOffStateAction';
import { OnOffStateActionBuilder } from '../../../src/actions/OnOffStateActionBuilder';
import { OneTimeTriggerSerializer } from '../../../src/serialization/OneTimeTriggerSerializer';
import { OnOffStateActionSerializer } from '../../../src/serialization/OnOffStateActionSerializer';
import { UniversalSerializer } from '../../../src/serialization/UniversalSerializer';
import { StateService } from '../../../src/services/StateService';
import { OneTimeTrigger } from '../../../src/triggers/OneTimeTrigger';
import { OneTimeTriggerBuilder } from '../../../src/triggers/OneTimeTriggerBuilder';
import { Trigger } from '../../../src/triggers/Trigger';
import { Weekday } from '../../../src/triggers/Weekday';

describe('OneTimeTriggerSerializer', () => {
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
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const trigger = new OneTimeTriggerBuilder()
				.setDate(new Date(100))
				.setId('0')
				.setAction(onOffStateAction)
				.build();
			const serialized = sut.serialize(trigger);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(OneTimeTrigger.prototype.constructor.name);
			expect(json.date).to.equal('1970-01-01T00:00:00.100Z');
			expect(json.id).to.equal('0');
			expect(json.action).to.deep.equal(JSON.parse(onOffStateActionSerializer.serialize(onOffStateAction)));
		});

		it('throws when objectToSerialize is null', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			expect(() => sut.serialize(undefined as any)).to.throw();
		});

		it('throws when objectToSerialize is no instance of OneTimeTrigger', () => {
			const anotherTrigger = {
				getId: () => '0',
				getAction: () => onOffStateAction,
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				setAction: () => {},
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				trigger: () => {},
				getWeekdays: () => [Weekday.Monday],
			} as Trigger;
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			expect(() => sut.serialize(anotherTrigger)).to.throw();
		});

		it('throws when no serializer for action was found', () => {
			const sut = new OneTimeTriggerSerializer(new UniversalSerializer<Action>([]));
			const trigger = new OneTimeTriggerBuilder()
				.setDate(new Date(100))
				.setId('0')
				.setAction(onOffStateAction)
				.build();
			expect(() => sut.serialize(trigger)).to.throw();
		});
	});

	describe('deserialize', () => {
		it('should deserialize with OnOffStateAction', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"date": "1970-01-01T00:00:00.100Z",
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof OneTimeTrigger) {
				expect(deserialized.getId()).to.equal('0');
				expect(deserialized.getDate().getTime()).to.equal(100);
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

		it('should deserialize and set onDestroy to call removeTrigger(id)', () => {
			const removeTriggerMock = TypeMoq.Mock.ofType<(id: string) => void>();
			const sut = new OneTimeTriggerSerializer(actionSerializer, removeTriggerMock.object);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"date": "1970-01-01T00:00:00.100Z",
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			const deserialized = sut.deserialize(serialized) as OneTimeTrigger;
			removeTriggerMock.verify((r) => r(It.isValue('0')), Times.never());
			deserialized.destroy();
			removeTriggerMock.verify((r) => r(It.isValue('0')), Times.once());
		});

		it('throws when type is not OneTimeTrigger', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "somewrongtype",
				"id": "0",
				"date": "1970-01-01T00:00:00.100Z",
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is empty', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = ``;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is invalid json', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = `abc`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property type is missing', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = `{
				"id": "0",
				"date": "1970-01-01T00:00:00.100Z",
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property date is missing', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property id is missing', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"date": "1970-01-01T00:00:00.100Z",
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property action is missing', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"date": "1970-01-01T00:00:00.100Z"
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when action could not be deserialized', () => {
			const sut = new OneTimeTriggerSerializer(actionSerializer);
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"date": "1970-01-01T00:00:00.100Z",
				"action": {"abc": 3}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when no serializer for action was found', () => {
			const sut = new OneTimeTriggerSerializer(new UniversalSerializer<Action>([]));
			const serialized = `{
				"type": "${sut.getType()}",
				"id": "0",
				"date": "1970-01-01T00:00:00.100Z",
				"action": ${onOffStateActionSerializer.serialize(onOffStateAction)}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});
	});
});
