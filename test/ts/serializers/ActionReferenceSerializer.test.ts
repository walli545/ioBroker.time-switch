import { ActionReferenceSerializer } from '../../../src/serialization/ActionReferenceSerializer';
import * as TypeMoq from 'typemoq';
import { Action } from '../../../src/actions/Action';
import { expect } from 'chai';

describe('ActionReferenceSerializer', () => {
	const onAction = TypeMoq.Mock.ofType<Action>();
	const offAction = TypeMoq.Mock.ofType<Action>();
	const sut = new ActionReferenceSerializer(
		'OnOffStateAction',
		new Map<string, Action>([
			['On', onAction.object],
			['Off', offAction.object],
		]),
	);

	describe('ctor', () => {
		it('throws when typeToReference is null', () => {
			expect(
				() =>
					new ActionReferenceSerializer(
						null as any,
						new Map<string, Action>([['On', onAction.object]]),
					),
			).to.throw();
		});

		it('throws when typeToReference is undefined', () => {
			expect(
				() =>
					new ActionReferenceSerializer(
						undefined as any,
						new Map<string, Action>([['On', onAction.object]]),
					),
			).to.throw();
		});

		it('throws when referencableActions is null', () => {
			expect(() => new ActionReferenceSerializer('Type', null as any)).to.throw();
		});

		it('throws when referencableActions is undefined', () => {
			expect(() => new ActionReferenceSerializer('Type', undefined as any)).to.throw();
		});

		it('throws when referencableActions is empty', () => {
			expect(() => new ActionReferenceSerializer('Type', new Map<string, Action>())).to.throw();
		});

		it('sets type', () => {
			const sut = new ActionReferenceSerializer(
				'Type',
				new Map<string, Action>([['On', onAction.object]]),
			);
			expect(sut.getType()).to.equal('Type');
		});
	});

	describe('serialize', () => {
		it('should serialize onAction with reference', () => {
			const result = sut.serialize(onAction.object);
			expect(result).to.equal(`{"type":"OnOffStateAction","name":"On"}`);
		});

		it('should serialize offAction with reference', () => {
			const result = sut.serialize(offAction.object);
			expect(result).to.equal(`{"type":"OnOffStateAction","name":"Off"}`);
		});

		it('throws when no reference found', () => {
			expect(() => sut.serialize(TypeMoq.Mock.ofType<Action>().object)).to.throw();
		});

		it('throws when objectToSerialize is null', () => {
			expect(() => sut.serialize(null as any)).to.throw();
		});

		it('throws when objectToSerialize is undefined', () => {
			expect(() => sut.serialize(undefined as any)).to.throw();
		});
	});

	describe('deserialize', () => {
		it('should deserialize offAction with reference', () => {
			const result = sut.deserialize(`{"type":"OnOffStateAction","name":"Off"}`);
			expect(result).to.equal(offAction.object);
		});

		it('should deserialize onAction with reference', () => {
			const result = sut.deserialize(`{"type":"OnOffStateAction","name":"On"}`);
			expect(result).to.equal(onAction.object);
		});

		it('throws when type is different', () => {
			expect(() => sut.deserialize(`{"type":"AnotherAction","name":"On"}`)).to.throw();
		});

		it('throws when no reference found', () => {
			expect(() => sut.deserialize(`{"type":"OnOffStateAction","name":"Other"}`)).to.throw();
		});

		it('throws when stringToDeserialize is null', () => {
			expect(() => sut.deserialize(null as any)).to.throw();
		});

		it('throws when stringToDeserialize is undefined', () => {
			expect(() => sut.deserialize(undefined as any)).to.throw();
		});
	});
});
