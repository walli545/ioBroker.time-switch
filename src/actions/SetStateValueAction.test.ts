import { SetStateValueAction } from './SetStateValueAction';
import { expect } from 'chai';
import * as TypeMoq from 'typemoq';
import { Trigger } from '../triggers/Trigger';
import { StateService } from '../services/StateService';

describe('SetStateValueAction', () => {
	describe('ctor', () => {
		const validTrigger = TypeMoq.Mock.ofType<Trigger>().object;
		const validId = 'action0';
		const validStateId = 'state.0.to.trigger';
		const validValue = 'testvalue';
		const validStateService = TypeMoq.Mock.ofType<StateService>().object;

		it('throws when id is null', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>(null, validTrigger, validStateId, validValue, validStateService),
			).to.throw();
		});

		it('throws when id is undefined', () => {
			expect(
				() =>
					new SetStateValueAction<string>(
						// @ts-ignore
						undefined,
						validTrigger,
						validStateId,
						validValue,
						validStateService,
					),
			).to.throw();
		});

		it('throws when id is empty', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>('', validTrigger, validStateId, validValue, validStateService),
			).to.throw();
		});

		it('throws when trigger is null', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>(validId, null, validStateId, validValue, validStateService),
			).to.throw();
		});

		it('throws when trigger is undefined', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>(validId, undefined, validStateId, validValue, validStateService),
			).to.throw();
		});

		it('throws when idOfStateToSet is null', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>(validId, validTrigger, null, validValue, validStateService),
			).to.throw();
		});

		it('throws when idOfStateToSet is undefined', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>(validId, validTrigger, undefined, validValue, validStateService),
			).to.throw();
		});

		it('throws when idOfStateToSet is empty', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>('', validTrigger, '', validValue, validStateService),
			).to.throw();
		});

		it('throws when valueToSet is undefined', () => {
			expect(
				() =>
					// @ts-ignore
					new SetStateValueAction<string>(validId, validTrigger, validStateId, undefined, validStateService),
			).to.throw();
		});

		it('throws when stateService is null', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>(validId, validTrigger, validStateId, validValue, null),
			).to.throw();
		});

		it('throws when stateService is undefined', () => {
			expect(
				// @ts-ignore
				() => new SetStateValueAction<string>(validId, validTrigger, validStateId, validValue, undefined),
			).to.throw();
		});

		it('should create with string value ', () => {
			const trigger = TypeMoq.Mock.ofType<Trigger>();
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new SetStateValueAction<string>(
				'id01',
				trigger.object,
				'id.of.state',
				'value01',
				stateService.object,
			);

			expect(sut.getId()).to.equal('id01');
			expect(sut.getIdOfStateToSet()).to.equal('id.of.state');
			expect(sut.getValueToSet()).to.equal('value01');
			expect(sut.getTrigger()).to.equal(trigger.object);
		});

		it('should create with number value ', () => {
			const trigger = TypeMoq.Mock.ofType<Trigger>();
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new SetStateValueAction<number>('id01', trigger.object, 'id.of.state', 12, stateService.object);

			expect(sut.getId()).to.equal('id01');
			expect(sut.getIdOfStateToSet()).to.equal('id.of.state');
			expect(sut.getValueToSet()).to.equal(12);
			expect(sut.getTrigger()).to.equal(trigger.object);
		});

		it('should create with boolean value ', () => {
			const trigger = TypeMoq.Mock.ofType<Trigger>();
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new SetStateValueAction<boolean>(
				'id01',
				trigger.object,
				'id.of.state',
				true,
				stateService.object,
			);

			expect(sut.getId()).to.equal('id01');
			expect(sut.getIdOfStateToSet()).to.equal('id.of.state');
			expect(sut.getValueToSet()).to.equal(true);
			expect(sut.getTrigger()).to.equal(trigger.object);
		});

		it('should set state value on execute', () => {
			const trigger = TypeMoq.Mock.ofType<Trigger>();
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new SetStateValueAction<number>('id01', trigger.object, 'id.of.state', 12, stateService.object);

			sut.execute();
			stateService.verify(x => x.setState('id.of.state', 12), TypeMoq.Times.once());
		});
	});
});
