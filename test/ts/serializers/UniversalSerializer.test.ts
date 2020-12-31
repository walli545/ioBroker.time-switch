import * as TypeMoq from 'typemoq';
import { Times } from 'typemoq';
import { UniversalSerializer } from '../../../src/serialization/UniversalSerializer';
import { Trigger } from '../../../src/triggers/Trigger';
import { Serializer } from '../../../src/serialization/Serializer';
import { expect } from 'chai';

describe('UniversalSerializer', () => {
	let sut: UniversalSerializer<Trigger>;
	let firstSerializer: TypeMoq.IMock<Serializer<Trigger>>;
	let secondSerializer: TypeMoq.IMock<Serializer<Trigger>>;

	beforeEach(() => {
		firstSerializer = TypeMoq.Mock.ofType<Serializer<Trigger>>();
		secondSerializer = TypeMoq.Mock.ofType<Serializer<Trigger>>();
		firstSerializer.setup((s) => s.getType()).returns((_) => 'First');
		secondSerializer.setup((s) => s.getType()).returns((_) => 'Second');
		sut = new UniversalSerializer<Trigger>([firstSerializer.object, secondSerializer.object]);
	});

	describe('serialize', () => {
		it('uses firstSerializer to serialize', () => {
			const trigger = createTestTrigger('First');
			firstSerializer.setup((s) => s.serialize(trigger.object)).returns((_) => 'WorksFirst');

			const result = sut.serialize(trigger.object);

			expect(result).to.equal('WorksFirst');
			firstSerializer.verify((s) => s.serialize(trigger.object), Times.once());
			secondSerializer.verify((s) => s.serialize(trigger.object), Times.never());
		});

		it('uses secondSerializer to serialize', () => {
			const trigger = createTestTrigger('Second');
			secondSerializer.setup((s) => s.serialize(trigger.object)).returns((_) => 'WorksSecond');

			const result = sut.serialize(trigger.object);

			expect(result).to.equal('WorksSecond');
			secondSerializer.verify((s) => s.serialize(trigger.object), Times.once());
			firstSerializer.verify((s) => s.serialize(trigger.object), Times.never());
		});

		it('throws when no serializer found', () => {
			const trigger = createTestTrigger('Another');

			expect(() => sut.serialize(trigger.object)).to.throw();

			secondSerializer.verify((s) => s.serialize(trigger.object), Times.never());
			firstSerializer.verify((s) => s.serialize(trigger.object), Times.never());
		});
	});

	describe('deserialize', () => {
		it('uses firstSerializer to deserialize', () => {
			const triggerString = '{"type":"First","data":"FirstTrigger"}';
			const mockResult = TypeMoq.Mock.ofType<Trigger>();
			firstSerializer.setup((s) => s.deserialize(triggerString)).returns((_) => mockResult.object);

			const result = sut.deserialize(triggerString);

			expect(result).to.equal(mockResult.object);
			firstSerializer.verify((s) => s.deserialize(triggerString), Times.once());
			secondSerializer.verify((s) => s.deserialize(triggerString), Times.never());
		});

		it('uses secondSerializer to deserialize', () => {
			const triggerString = '{"type":"Second","data":"FirstTrigger"}';
			const mockResult = TypeMoq.Mock.ofType<Trigger>();
			secondSerializer.setup((s) => s.deserialize(triggerString)).returns((_) => mockResult.object);

			const result = sut.deserialize(triggerString);

			expect(result).to.equal(mockResult.object);
			secondSerializer.verify((s) => s.deserialize(triggerString), Times.once());
			firstSerializer.verify((s) => s.deserialize(triggerString), Times.never());
		});

		it('throws when no serializer found', () => {
			const triggerString = '{"type":"Another","data":"FirstTrigger"}';

			expect(() => sut.deserialize(triggerString)).to.throw();

			firstSerializer.verify((s) => s.deserialize(triggerString), Times.never());
			secondSerializer.verify((s) => s.deserialize(triggerString), Times.never());
		});
	});

	describe('use serializer', () => {
		it('replaces an existing serializer', () => {
			const newFirstSerializer = TypeMoq.Mock.ofType<Serializer<Trigger>>();
			newFirstSerializer.setup((s) => s.getType()).returns((_) => 'First');

			sut.useSerializer(newFirstSerializer.object);

			const trigger = createTestTrigger('First');
			newFirstSerializer.setup((s) => s.serialize(trigger.object)).returns((_) => 'WorksNewFirst');
			const result = sut.serialize(trigger.object);

			expect(result).to.equal('WorksNewFirst');
			newFirstSerializer.verify((s) => s.serialize(trigger.object), Times.once());
			firstSerializer.verify((s) => s.serialize(trigger.object), Times.never());
			secondSerializer.verify((s) => s.serialize(trigger.object), Times.never());
		});

		it('uses a new provided serializer', () => {
			const newFirstSerializer = TypeMoq.Mock.ofType<Serializer<Trigger>>();
			newFirstSerializer.setup((s) => s.getType()).returns((_) => 'First');

			const sut = new UniversalSerializer<Trigger>([]);

			sut.useSerializer(newFirstSerializer.object);

			const trigger = createTestTrigger('First');
			newFirstSerializer.setup((s) => s.serialize(trigger.object)).returns((_) => 'WorksNewFirst');
			const result = sut.serialize(trigger.object);

			expect(result).to.equal('WorksNewFirst');
			newFirstSerializer.verify((s) => s.serialize(trigger.object), Times.once());
		});

		it('throws when serializer is null', () => {
			expect(() => sut.useSerializer(null as any)).to.throw();
		});

		it('throws when serializer is undefined', () => {
			expect(() => sut.useSerializer(undefined as any)).to.throw();
		});
	});

	it('type is Universal', () => {
		expect(sut.getType()).to.equal('Universal');
	});

	function createTestTrigger(ctorName: string) {
		const trigger = TypeMoq.Mock.ofType<Trigger>();
		const ctor = TypeMoq.Mock.ofType<Function>();
		ctor.setup((c) => c.name).returns((_) => ctorName);
		trigger.setup((t) => t.constructor).returns((_) => ctor.object);
		return trigger;
	}
});
