import * as TypeMoq from 'typemoq';
import { expect } from 'chai';
import { StateService } from '../../../../src/services/StateService';
import { fail } from 'assert';
import { StringStateAndConstantConditionSerializer } from '../../../../src/serialization/conditions/StringStateAndConstantConditionSerializer';
import { StringStateAndConstantCondition } from '../../../../src/actions/conditions/StringStateAndConstantCondition';
import { EqualitySign } from '../../../../src/actions/conditions/EqualitySign';
import { Condition } from '../../../../src/actions/conditions/Condition';

describe('StringStateAndConstantConditionSerializer', () => {
	const stateService = TypeMoq.Mock.ofType<StateService>().object;

	describe('serialize', () => {
		it('should serialize with equal sign', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const condition = new StringStateAndConstantCondition(
				'value1',
				'id.of.state',
				EqualitySign.Equal,
				stateService,
			);
			const serialized = sut.serialize(condition);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal('StringStateAndConstantCondition');
			expect(json.constant).to.equal('value1');
			expect(json.stateId).to.equal('id.of.state');
			expect(json.sign).to.equal(EqualitySign.Equal);
		});

		it('should serialize with not equal sign', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const condition = new StringStateAndConstantCondition(
				'value1',
				'id.of.state',
				EqualitySign.NotEqual,
				stateService,
			);
			const serialized = sut.serialize(condition);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal('StringStateAndConstantCondition');
			expect(json.constant).to.equal('value1');
			expect(json.stateId).to.equal('id.of.state');
			expect(json.sign).to.equal(EqualitySign.NotEqual);
		});

		it('throws when objectToSerialize is null', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			expect(() => sut.serialize(undefined as any)).to.throw();
		});

		it('throws when objectToSerialize is no instance of StringStateAndConstantCondition', () => {
			const anotherCondition = {
				evaluate: () => Promise.resolve(true),
			} as Condition;
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			expect(() => sut.serialize(anotherCondition)).to.throw();
		});
	});

	describe('deserialize', () => {
		it('should deserialize with equal sign', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndConstantCondition",
				"constant": "constantValue",
				"stateId": "state.id.1",
				"sign": "=="
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof StringStateAndConstantCondition) {
				expect(deserialized.getConstant()).to.equal('constantValue');
				expect(deserialized.getStateId()).to.equal('state.id.1');
				expect(deserialized.getSign()).to.equal(EqualitySign.Equal);
			} else {
				fail(`Deserialization produced wrong condition type`);
			}
		});

		it('should deserialize with not equal sign', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndConstantCondition",
				"constant": "constantValue",
				"stateId": "state.id.1",
				"sign": "!="
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof StringStateAndConstantCondition) {
				expect(deserialized.getConstant()).to.equal('constantValue');
				expect(deserialized.getStateId()).to.equal('state.id.1');
				expect(deserialized.getSign()).to.equal(EqualitySign.NotEqual);
			} else {
				fail(`Deserialization produced wrong condition type`);
			}
		});

		it('throws when type is not StringStateAndConstantCondition', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `{
				"type": "wrongType",
				"constant": "constantValue",
				"stateId": "state.id.1",
				"sign": "!="
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is empty', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = ``;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is invalid json', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `abc`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property type is missing', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `{
				"constant": "constantValue",
				"stateId": "state.id.1",
				"sign": "!="
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property constant is missing', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndConstantCondition",
				"stateId": "state.id.1",
				"sign": "!="
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property stateId is missing', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndConstantCondition",
				"constant": "constantValue",
				"sign": "!="
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property sign is missing', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndConstantCondition",
				"constant": "constantValue",
				"stateId": "state.id.1",
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when sign is unknown', () => {
			const sut = new StringStateAndConstantConditionSerializer(stateService);
			const serialized = `{
				"type": "StringStateAndConstantCondition",
				"constant": "constantValue",
				"stateId": "state.id.1",
				"sign": "&&"
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});
	});
});
