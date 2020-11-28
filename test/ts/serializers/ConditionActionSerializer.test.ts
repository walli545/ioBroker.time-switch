import * as TypeMoq from 'typemoq';
import { It, Times } from 'typemoq';
import { UniversalSerializer } from '../../../src/serialization/UniversalSerializer';
import { Action } from '../../../src/actions/Action';
import { expect } from 'chai';
import { Condition } from '../../../src/actions/conditions/Condition';
import { LoggingService } from '../../../src/services/LoggingService';
import { ConditionAction } from '../../../src/actions/ConditionAction';
import { ConditionActionSerializer } from '../../../src/serialization/ConditionActionSerializer';
import { fail } from 'assert';

describe('ConditionActionSerializer', () => {
	let logger: TypeMoq.IMock<LoggingService>;
	let conditionSerializer: TypeMoq.IMock<UniversalSerializer<Condition>>;
	let actionSerializer: TypeMoq.IMock<UniversalSerializer<Action>>;

	let action: TypeMoq.IMock<Action>;
	let condition: TypeMoq.IMock<Condition>;

	let sut: ConditionActionSerializer;

	const serializedCondition = `{"type":"Condition"}`;
	const serializedAction = `{"type":"Action"}`;

	beforeEach(() => {
		conditionSerializer = TypeMoq.Mock.ofType<UniversalSerializer<Condition>>();
		actionSerializer = TypeMoq.Mock.ofType<UniversalSerializer<Action>>();
		logger = TypeMoq.Mock.ofType<LoggingService>();

		action = TypeMoq.Mock.ofType<Action>();
		condition = TypeMoq.Mock.ofType<Condition>();

		conditionSerializer.setup((s) => s.serialize(condition.object)).returns((_) => serializedCondition);
		actionSerializer.setup((s) => s.serialize(action.object)).returns((_) => serializedAction);
		conditionSerializer.setup((s) => s.deserialize(serializedCondition)).returns((_) => condition.object);
		actionSerializer.setup((s) => s.deserialize(serializedAction)).returns((_) => action.object);

		sut = new ConditionActionSerializer(conditionSerializer.object, actionSerializer.object, logger.object);
	});

	describe('serialize', () => {
		it('should serialize with ConditionAction', () => {
			const conditionAction = new ConditionAction(condition.object, action.object);

			const serialized = sut.serialize(conditionAction);

			const json = JSON.parse(serialized);
			expect(json.type).to.equal('ConditionAction');
			expect(json.condition).to.deep.equal(JSON.parse(serializedCondition));
			expect(json.action).to.deep.equal(JSON.parse(serializedAction));
			conditionSerializer.verify((s) => s.serialize(condition.object), Times.once());
			actionSerializer.verify((s) => s.serialize(action.object), Times.once());
			conditionSerializer.verify((s) => s.deserialize(It.isAny()), Times.never());
			actionSerializer.verify((s) => s.deserialize(It.isAny()), Times.never());
		});

		it('throws when objectToSerialize is null', () => {
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			expect(() => sut.serialize(undefined as any)).to.throw();
		});

		it('throws when objectToSerialize is no instance of ConditionAction', () => {
			const anotherAction = TypeMoq.Mock.ofType<Action>();
			expect(() => sut.serialize(anotherAction.object)).to.throw();
		});
	});

	describe('deserialize', () => {
		it('should deserialize with ConditionAction', () => {
			const serialized = `{
					"type": "ConditionAction",
					"condition": ${serializedCondition},
					"action": ${serializedAction}
				}`;
			const deserialized = sut.deserialize(serialized);
			if (deserialized instanceof ConditionAction) {
				expect(deserialized.getAction()).to.equal(action.object);
				expect(deserialized.getCondition()).to.equal(condition.object);
				conditionSerializer.verify((s) => s.deserialize(serializedCondition), Times.once());
				actionSerializer.verify((s) => s.deserialize(serializedAction), Times.once());
				conditionSerializer.verify((s) => s.serialize(It.isAny()), Times.never());
				actionSerializer.verify((s) => s.serialize(It.isAny()), Times.never());
			} else {
				fail(`Deserialization produced wrong action type`);
			}
		});

		it('throws when type is not ConditionAction', () => {
			const serialized = `{
				"type": "AnotherType",
				"condition": ${serializedCondition},
				"action": ${serializedAction}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is empty', () => {
			const serialized = ``;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is invalid json', () => {
			const serialized = `abc`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property type is missing', () => {
			const serialized = `{
				"condition": ${serializedCondition},
				"action": ${serializedAction}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property condition is missing', () => {
			const serialized = `{
				"type": "ConditionAction",
				"action": ${serializedAction}
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property action is missing', () => {
			const serialized = `{
				"type": "ConditionAction",
				"condition": ${serializedCondition},
			}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});
	});
});
