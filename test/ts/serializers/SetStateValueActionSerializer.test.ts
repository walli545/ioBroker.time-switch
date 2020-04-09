import { SetStateValueActionSerializer } from '../../../src/serialization/SetStateValueActionSerializer';
import * as TypeMoq from 'typemoq';
import { StateService } from '../../../src/services/StateService';
import { SetStateValueAction } from '../../../src/actions/SetStateValueAction';
import { TimeTrigger } from '../../../src/triggers/TimeTrigger';
import { TimeTriggerSerializer } from '../../../src/serialization/TimeTriggerSerializer';
import { expect } from 'chai';
import { Trigger } from '../../../src/triggers/Trigger';
import { Weekday } from '../../../src/triggers/Weekday';

describe('SetStateValueActionSerializer', () => {
	const stateService = TypeMoq.Mock.ofType<StateService>();
	describe('serialize', () => {
		it('throws when objectToSerialize is null', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			expect(() => sut.serialize(undefined as any)).to.throw();
		});

		it('throws when trigger type can not be serialized', () => {
			const trigger = new (class NewTrigger implements Trigger {
				getWeekdays(): Weekday[] {
					return [];
				}
				newMethod(): void {
					this.getWeekdays();
				}
			})();
			const sut = new SetStateValueActionSerializer(stateService.object);
			const action = new SetStateValueAction<string>(
				'01',
				trigger,
				'state.0.to.set',
				'value01',
				stateService.object,
			);
			expect(() => sut.serialize(action)).to.throw();
		});

		it('should serialize string action with TimeTrigger', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const action = new SetStateValueAction<string>(
				'01',
				trigger,
				'state.0.to.set',
				'value01',
				stateService.object,
			);
			const serialized = sut.serialize(action);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(SetStateValueActionSerializer.TYPE);
			expect(json.id).to.equal('01');
			expect(json.idOfStateToSet).to.equal('state.0.to.set');
			expect(json.valueToSet).to.equal('value01');
			expect(json.valueType).to.equal('string');
			expect(json.trigger).to.equal(new TimeTriggerSerializer().serialize(trigger));
		});

		it('should serialize number action with TimeTrigger', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const action = new SetStateValueAction<number>('02', trigger, 'state.0.to.set', 2, stateService.object);
			const serialized = sut.serialize(action);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(SetStateValueActionSerializer.TYPE);
			expect(json.id).to.equal('02');
			expect(json.idOfStateToSet).to.equal('state.0.to.set');
			expect(json.valueToSet).to.equal(2);
			expect(json.valueType).to.equal('number');
			expect(json.trigger).to.equal(new TimeTriggerSerializer().serialize(trigger));
		});

		it('should serialize boolean action with TimeTrigger', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const action = new SetStateValueAction<boolean>('02', trigger, 'state.0.to.set', true, stateService.object);
			const serialized = sut.serialize(action);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(SetStateValueActionSerializer.TYPE);
			expect(json.id).to.equal('02');
			expect(json.idOfStateToSet).to.equal('state.0.to.set');
			expect(json.valueToSet).to.equal(true);
			expect(json.valueType).to.equal('boolean');
			expect(json.trigger).to.equal(new TimeTriggerSerializer().serialize(trigger));
		});
	});

	describe('deserialize', () => {
		it('throws when value type is unknown', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"trigger": ${new TimeTriggerSerializer().serialize(trigger)},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": "new value", "valueType": "object"}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when type is not setStateValueAction', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const serialized =
				`{"type": "wrongType",` +
				`"trigger": ${new TimeTriggerSerializer().serialize(trigger)},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": "new value", "valueType": "string"}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when valueType is missing', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"trigger": ${new TimeTriggerSerializer().serialize(trigger)},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": "new value"}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when trigger is missing', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": "new value", "valueType": "string"}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when trigger type is missing', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"trigger": {},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": "new value", "valueType": "string"}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when trigger type is unknown', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"trigger": {"type": "unknownTrigger"},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": "new value", "valueType": "string"}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('should deserialize string action with TimeTrigger', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"trigger": ${new TimeTriggerSerializer().serialize(trigger)},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": "new value", "valueType": "string"}`;
			const deserialized = sut.deserialize(serialized);
			expect(deserialized.getId()).to.equal('05');
			expect(deserialized.getIdOfStateToSet()).to.equal('id.of.state');
			expect(deserialized.getValueToSet()).to.equal('new value');
			expect(typeof deserialized.getValueToSet()).to.equal('string');
		});

		it('should deserialize number action with TimeTrigger', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"trigger": ${new TimeTriggerSerializer().serialize(trigger)},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": 1, "valueType": "number"}`;
			const deserialized = sut.deserialize(serialized);
			expect(deserialized.getId()).to.equal('05');
			expect(deserialized.getIdOfStateToSet()).to.equal('id.of.state');
			expect(deserialized.getValueToSet()).to.equal(1);
			expect(typeof deserialized.getValueToSet()).to.equal('number');
		});

		it('should deserialize boolean action with TimeTrigger', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"trigger": ${new TimeTriggerSerializer().serialize(trigger)},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": true, "valueType": "boolean"}`;
			const deserialized = sut.deserialize(serialized);
			expect(deserialized.getId()).to.equal('05');
			expect(deserialized.getIdOfStateToSet()).to.equal('id.of.state');
			expect(deserialized.getValueToSet()).to.equal(true);
			expect(typeof deserialized.getValueToSet()).to.equal('boolean');
		});

		it('should set value on execute', () => {
			const sut = new SetStateValueActionSerializer(stateService.object);
			const trigger = new TimeTrigger(12, 30, [0]);
			const serialized =
				`{"type": "${SetStateValueActionSerializer.TYPE}",` +
				`"trigger": ${new TimeTriggerSerializer().serialize(trigger)},` +
				`"id": "05", "idOfStateToSet": "id.of.state", "valueToSet": 1, "valueType": "number"}`;
			const deserialized = sut.deserialize(serialized);
			deserialized.execute();
			stateService.verify(x => x.setForeignState('id.of.state', 1), TypeMoq.Times.once());
		});
	});
});
