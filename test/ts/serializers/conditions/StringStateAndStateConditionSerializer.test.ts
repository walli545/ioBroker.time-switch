import * as TypeMoq from 'typemoq';
import { expect } from 'chai';
import { StateService } from '../../../../src/services/StateService';
import { fail } from 'assert';
import { EqualitySign } from '../../../../src/actions/conditions/EqualitySign';
import { Condition } from '../../../../src/actions/conditions/Condition';
import { StringStateAndStateConditionSerializer } from '../../../../src/serialization/conditions/StringStateAndStateConditionSerializer';
import { StringStateAndStateCondition } from '../../../../src/actions/conditions/StringStateAndStateCondition';

describe('StringStateAndStateConditionSerializer', () => {
	const stateService = TypeMoq.Mock.ofType<StateService>().object;

	describe('serialize', () => {
		it('should serialize with equal sign', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const condition = new StringStateAndStateCondition(
				'id.of.state.1',
				'id.of.state.2',
				EqualitySign.Equal,
				stateService,
			);
			const serialized = sut.serialize(condition);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal('StringStateAndStateCondition');
			expect(json.stateId1).to.equal('id.of.state.1');
			expect(json.stateId2).to.equal('id.of.state.2');
			expect(json.sign).to.equal(EqualitySign.Equal);
		});

		it('should serialize with not equal sign', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const condition = new StringStateAndStateCondition(
				'id.of.state.1',
				'id.of.state.2',
				EqualitySign.NotEqual,
				stateService,
			);
			const serialized = sut.serialize(condition);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal('StringStateAndStateCondition');
			expect(json.stateId1).to.equal('id.of.state.1');
			expect(json.stateId2).to.equal('id.of.state.2');
			expect(json.sign).to.equal(EqualitySign.NotEqual);
		});

		it('throws when objectToSerialize is null', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			expect(() => sut.serialize(undefined as any)).to.throw();
		});

		it('throws when objectToSerialize is no instance of StringStateAndStateCondition', () => {
			const anotherCondition = {
				evaluate: () => Promise.resolve(true),
			} as Condition;
			const sut = new StringStateAndStateConditionSerializer(stateService);
			expect(() => sut.serialize(anotherCondition)).to.throw();
		});
	});

	describe('deserialize', () => {
		it('should deserialize with equal sign', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndStateCondition",
				"stateId1": "state.id.1",
				"stateId2": "state.id.2",
				"sign": "=="
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof StringStateAndStateCondition) {
				expect(deserialized.getStateId1()).to.equal('state.id.1');
				expect(deserialized.getStateId2()).to.equal('state.id.2');
				expect(deserialized.getSign()).to.equal(EqualitySign.Equal);
			} else {
				fail(`Deserialization produced wrong condition type`);
			}
		});

		it('should deserialize with not equal sign', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndStateCondition",
				"stateId1": "state.id.1",
				"stateId2": "state.id.2",
				"sign": "!="
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof StringStateAndStateCondition) {
				expect(deserialized.getStateId1()).to.equal('state.id.1');
				expect(deserialized.getStateId2()).to.equal('state.id.2');
				expect(deserialized.getSign()).to.equal(EqualitySign.NotEqual);
			} else {
				fail(`Deserialization produced wrong condition type`);
			}
		});

		it('throws when type is not StringStateAndStateCondition', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `{
				"type": "wrongType",
				"stateId1": "state.id.1",
				"stateId2": "state.id.2",
				"sign": "!="
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is empty', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = ``;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is invalid json', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `abc`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property type is missing', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `{
				"stateId1": "state.id.1",
				"stateId2": "state.id.2",
				"sign": "!="
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property stateId1 is missing', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndStateCondition",
				"stateId2": "state.id.2",
				"sign": "!="
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property stateId2 is missing', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndStateCondition",
				"stateId1": "state.id.1",
				"sign": "!="
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property sign is missing', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndStateCondition",
				"stateId1": "state.id.1",
				"stateId2": "state.id.2",
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when sign is unknown', () => {
			const sut = new StringStateAndStateConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndStateCondition",
				"stateId1": "state.id.1",
				"stateId2": "state.id.2",
				"sign": "&&"
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});
	});
});
