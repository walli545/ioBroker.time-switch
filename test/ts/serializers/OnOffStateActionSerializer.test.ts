import * as TypeMoq from 'typemoq';
import { StateService } from '../../../src/services/StateService';
import { expect } from 'chai';
import { OnOffStateActionSerializer } from '../../../src/serialization/OnOffStateActionSerializer';
import { Action } from '../../../src/actions/Action';
import { OnOffStateAction } from '../../../src/actions/OnOffStateAction';
import { OnOffStateActionBuilder } from '../../../src/actions/OnOffStateActionBuilder';
import { fail } from 'assert';

describe('OnOffStateActionSerializer', () => {
	const stateService = TypeMoq.Mock.ofType<StateService>();
	describe('serialize', () => {
		it('throws when objectToSerialize is null', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			expect(() => sut.serialize(undefined as any)).to.throw();
		});

		it('throws when objectToSerialize is not instance of OnOffStateAction', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const anotherAction = {
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				execute: () => {},
			} as Action;
			expect(() => sut.serialize(anotherAction)).to.throw();
		});

		it('should serialize string action', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const action = new OnOffStateActionBuilder()
				.setStateService(stateService.object)
				.setOnValue('ON')
				.setOffValue('OFF')
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['id.of.state'])
				.build();
			const serialized = sut.serialize(action);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(OnOffStateAction.prototype.constructor.name);
			expect(json.valueType).to.equal('string');
			expect(json.idsOfStatesToSet).to.deep.equal(['id.of.state']);
			expect(json.onValue).to.equal('ON');
			expect(json.offValue).to.equal('OFF');
			expect(json.booleanValue).to.be.true;
		});

		it('should serialize number action', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const action = new OnOffStateActionBuilder()
				.setStateService(stateService.object)
				.setOnValue(1)
				.setOffValue(0)
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['id.of.state'])
				.build();
			const serialized = sut.serialize(action);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(OnOffStateAction.prototype.constructor.name);
			expect(json.valueType).to.equal('number');
			expect(json.idsOfStatesToSet).to.deep.equal(['id.of.state']);
			expect(json.onValue).to.equal(1);
			expect(json.offValue).to.equal(0);
			expect(json.booleanValue).to.be.false;
		});

		it('should serialize boolean action', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const action = new OnOffStateActionBuilder()
				.setStateService(stateService.object)
				.setOnValue(true)
				.setOffValue(false)
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['id.of.state'])
				.build();
			const serialized = sut.serialize(action);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(OnOffStateAction.prototype.constructor.name);
			expect(json.valueType).to.equal('boolean');
			expect(json.idsOfStatesToSet).to.deep.equal(['id.of.state']);
			expect(json.onValue).to.be.true;
			expect(json.offValue).to.be.false;
			expect(json.booleanValue).to.be.true;
		});
	});

	describe('deserialize', () => {
		it('throws when value type is unknown', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const serialized = `{
				"type": "${sut.getType()}",
				"valueType": "object",
				"idsOfStatesToSet": ["id.of.state"],
				"onValue": "ON",
				"offValue": "OFF",
				"booleanValue": true
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when type is not OnOffStateAction', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const serialized = `{
				"type": "SomeWrongType",
				"valueType": "string",
				"idsOfStatesToSet": ["id.of.state"],
				"onValue": "ON",
				"offValue": "OFF",
				"booleanValue": true
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when valueType is missing', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const serialized = `{
				"type": "${sut.getType()}",
				"idsOfStatesToSet": ["id.of.state"],
				"onValue": "ON",
				"offValue": "OFF",
				"booleanValue": true
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when type is missing', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const serialized = `{
				"valueType": "boolean",
				"idsOfStatesToSet": ["id.of.state"],
				"onValue": "ON",
				"offValue": "OFF",
				"booleanValue": true
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('should deserialize string action', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const serialized = `{
				"type": "${sut.getType()}",
				"valueType": "string",
				"idsOfStatesToSet": ["id.of.state"],
				"onValue": "ON",
				"offValue": "OFF",
				"booleanValue": true
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof OnOffStateAction) {
				expect(deserialized.getIdsOfStatesToSet()).to.deep.equal(['id.of.state']);
				expect(deserialized.getOnValue()).to.equal('ON');
				expect(deserialized.getOffValue()).to.equal('OFF');
				expect(deserialized.getBooleanValue()).to.be.true;
			} else {
				fail(`Deserialization produced wrong type`);
			}
		});

		it('should deserialize number action', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const serialized = `{
				"type": "${sut.getType()}",
				"valueType": "number",
				"idsOfStatesToSet": ["id.of.state"],
				"onValue": 1,
				"offValue": 0,
				"booleanValue": false
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof OnOffStateAction) {
				expect(deserialized.getIdsOfStatesToSet()).to.deep.equal(['id.of.state']);
				expect(deserialized.getOnValue()).to.equal(1);
				expect(deserialized.getOffValue()).to.equal(0);
				expect(deserialized.getBooleanValue()).to.be.false;
			} else {
				fail(`Deserialization produced wrong type`);
			}
		});

		it('should deserialize boolean action', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const serialized = `{
				"type": "${sut.getType()}",
				"valueType": "boolean",
				"idsOfStatesToSet": ["id.of.state"],
				"onValue": true,
				"offValue": false,
				"booleanValue": true
			}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof OnOffStateAction) {
				expect(deserialized.getIdsOfStatesToSet()).to.deep.equal(['id.of.state']);
				expect(deserialized.getOnValue()).to.be.true;
				expect(deserialized.getOffValue()).to.be.false;
				expect(deserialized.getBooleanValue()).to.be.true;
			} else {
				fail(`Deserialization produced wrong type`);
			}
		});

		it('should set value on execute', () => {
			const sut = new OnOffStateActionSerializer(stateService.object);
			const serialized = `{
				"type": "${sut.getType()}",
				"valueType": "boolean",
				"idsOfStatesToSet": ["id.of.state"],
				"onValue": true,
				"offValue": false,
				"booleanValue": true
			}`;
			const deserialized = sut.deserialize(serialized);
			deserialized.execute();
			stateService.verify(x => x.setForeignState('id.of.state', true), TypeMoq.Times.once());
		});
	});
});
