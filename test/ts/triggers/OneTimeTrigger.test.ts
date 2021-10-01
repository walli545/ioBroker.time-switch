import { expect } from 'chai';
import * as TypeMoq from 'typemoq';
import { Action } from '../../../src/actions/Action';
import { OneTimeTriggerBuilder } from '../../../src/triggers/OneTimeTriggerBuilder';

describe('OneTimeTrigger', () => {
	describe('ctor, getter and setter', () => {
		const dummyAction = {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			execute: () => {},
		} as Action;

		it('throws when id is undefined', () => {
			expect(() =>
				new OneTimeTriggerBuilder()
					.setId(undefined as any)
					.setAction(dummyAction)
					.setDate(new Date())
					.build(),
			).to.throw();
		});

		it('throws when id is null', () => {
			expect(() =>
				new OneTimeTriggerBuilder()
					.setId(null as any)
					.setAction(dummyAction)
					.setDate(new Date())
					.build(),
			).to.throw();
		});

		it('throws when action is undefined', () => {
			expect(() =>
				new OneTimeTriggerBuilder()
					.setId('0')
					.setAction(undefined as any)
					.setDate(new Date())
					.build(),
			).to.throw();
		});

		it('throws when action is null', () => {
			expect(() =>
				new OneTimeTriggerBuilder()
					.setId('0')
					.setAction(null as any)
					.setDate(new Date())
					.build(),
			).to.throw();
		});

		it('throws when date is undefined', () => {
			expect(() =>
				new OneTimeTriggerBuilder()
					.setId('0')
					.setAction(dummyAction)
					.setDate(undefined as any)
					.build(),
			).to.throw();
		});

		it('throws when date is null', () => {
			expect(() =>
				new OneTimeTriggerBuilder()
					.setId('0')
					.setAction(dummyAction)
					.setDate(null as any)
					.build(),
			).to.throw();
		});

		it('creates with id=0, action=dummyAction, date=new Date()', () => {
			const date = new Date();
			const have = new OneTimeTriggerBuilder().setId('0').setAction(dummyAction).setDate(date).build();
			expect(have.getId()).to.equal('0');
			expect(have.getDate().getTime()).to.equal(date.getTime());
			expect(have.getInternalAction()).to.equal(dummyAction);
		});

		it('returns copy of date on getDate() and stores copy on construct', () => {
			const date = new Date();
			const have = new OneTimeTriggerBuilder().setId('0').setAction(dummyAction).setDate(date).build();
			date.setTime(0);
			expect(have.getDate().getTime()).to.not.equal(0);
		});

		it('sets another action', () => {
			const sut = new OneTimeTriggerBuilder().setId('0').setAction(dummyAction).setDate(new Date()).build();
			const newAction = TypeMoq.Mock.ofType<Action>().object;
			sut.setAction(newAction);
			expect(sut.getInternalAction()).not.to.equal(dummyAction);
			expect(sut.getInternalAction()).to.equal(newAction);
		});

		it('setAction throws on undefined', () => {
			const sut = new OneTimeTriggerBuilder().setId('0').setAction(dummyAction).setDate(new Date()).build();
			expect(() => sut.setAction(undefined as any)).to.throw();
		});

		it('setAction throws on null', () => {
			const sut = new OneTimeTriggerBuilder().setId('0').setAction(dummyAction).setDate(new Date()).build();
			expect(() => sut.setAction(null as any)).to.throw();
		});

		it('toString', () => {
			const sut = new OneTimeTriggerBuilder().setId('0').setAction(dummyAction).setDate(new Date(1)).build();
			expect(sut.toString()).to.equal('OneTimeTrigger {id=0, date=1970-01-01T00:00:00.001Z}');
		});
	});

	describe('trigger', () => {
		it('triggers action', () => {
			let executed = false;
			const testAction = {
				execute: () => {
					executed = true;
				},
			} as Action;

			const trigger = new OneTimeTriggerBuilder().setId('0').setAction(testAction).setDate(new Date()).build();

			trigger.getAction().execute();

			expect(executed).to.be.true;
		});

		it('calls onDestroy', () => {
			let executed = false;
			const testAction = {
				execute: () => {
					executed = true;
				},
			} as Action;

			const onDestroyMock = TypeMoq.Mock.ofType<() => void>();
			const trigger = new OneTimeTriggerBuilder()
				.setId('0')
				.setAction(testAction)
				.setDate(new Date())
				.setOnDestroy(onDestroyMock.object)
				.build();

			trigger.getAction().execute();

			expect(executed).to.be.true;
			onDestroyMock.verify((m) => m(), TypeMoq.Times.once());
		});
	});

	describe('destroy', () => {
		it('calls onDestroy', () => {
			const testAction = TypeMoq.Mock.ofType<Action>();

			const onDestroyMock = TypeMoq.Mock.ofType<() => void>();
			const trigger = new OneTimeTriggerBuilder()
				.setId('0')
				.setAction(testAction.object)
				.setDate(new Date())
				.setOnDestroy(onDestroyMock.object)
				.build();

			trigger.getAction().execute();
			onDestroyMock.verify((m) => m(), TypeMoq.Times.once());
		});
	});
});
