import { EqualitySign } from '../../../../src/actions/conditions/EqualitySign';
import * as TypeMoq from 'typemoq';
import { StateService } from '../../../../src/services/StateService';
import { expect } from 'chai';
import { StringStateAndConstantCondition } from '../../../../src/actions/conditions/StringStateAndConstantCondition';
import { It, Times } from 'typemoq';

describe('StringStateAndConstantCondition', () => {
	describe('ctor', () => {
		const validConstant = 'val1';
		const validStateId = 'id.of.state';
		const validSign = EqualitySign.Equal;
		const validStateService = TypeMoq.Mock.ofType<StateService>().object;

		it('throws when constant is undefined', () => {
			expect(
				() => new StringStateAndConstantCondition(undefined as any, validStateId, validSign, validStateService),
			).to.throw();
		});

		it('throws when constant is null', () => {
			expect(
				() => new StringStateAndConstantCondition(null as any, validStateId, validSign, validStateService),
			).to.throw();
		});

		it('throws when state id is undefined', () => {
			expect(
				() =>
					new StringStateAndConstantCondition(validConstant, undefined as any, validSign, validStateService),
			).to.throw();
		});

		it('throws when state id is null', () => {
			expect(
				() => new StringStateAndConstantCondition(validConstant, null as any, validSign, validStateService),
			).to.throw();
		});

		it('throws when state id is empty', () => {
			expect(
				() => new StringStateAndConstantCondition(validConstant, '', validSign, validStateService),
			).to.throw();
		});

		it('throws when sign is undefined', () => {
			expect(
				() =>
					new StringStateAndConstantCondition(
						validConstant,
						validStateId,
						undefined as any,
						validStateService,
					),
			).to.throw();
		});

		it('throws when sign is null', () => {
			expect(
				() => new StringStateAndConstantCondition(validConstant, validStateId, null as any, validStateService),
			).to.throw();
		});

		it('throws when state service is undefined', () => {
			expect(
				() => new StringStateAndConstantCondition(validConstant, validStateId, validSign, undefined as any),
			).to.throw();
		});

		it('throws when state service is null', () => {
			expect(
				() => new StringStateAndConstantCondition(validConstant, validStateId, validSign, null as any),
			).to.throw();
		});

		it('creates with valid values', () => {
			const sut = new StringStateAndConstantCondition(validConstant, validStateId, validSign, validStateService);
			expect(sut).to.be.not.undefined;
		});
	});

	describe('evaluate', () => {
		let stateServiceMock: TypeMoq.IMock<StateService>;

		beforeEach(() => {
			stateServiceMock = TypeMoq.Mock.ofType<StateService>();
		});

		describe('with equal sign', () => {
			it('should evaluate to true if state and constant are equal', async () => {
				const value = 'val1';
				const sut = new StringStateAndConstantCondition(
					value,
					'id.of.state',
					EqualitySign.Equal,
					stateServiceMock.object,
				);
				stateServiceMock.setup((s) => s.getForeignState('id.of.state')).returns((_) => Promise.resolve(value));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(It.isAnyString()), Times.once());
			});

			it('should evaluate to false if state and constant are not equal', async () => {
				const sut = new StringStateAndConstantCondition(
					'val1',
					'id.of.state',
					EqualitySign.Equal,
					stateServiceMock.object,
				);
				stateServiceMock.setup((s) => s.getForeignState('id.of.state')).returns((_) => Promise.resolve('val2'));
				expect(await sut.evaluate()).to.be.false;
				stateServiceMock.verify((s) => s.getForeignState(It.isAnyString()), Times.once());
			});

			it('should convert boolean state value to string', async () => {
				const sut = new StringStateAndConstantCondition(
					'true',
					'id.of.state',
					EqualitySign.Equal,
					stateServiceMock.object,
				);
				stateServiceMock.setup((s) => s.getForeignState('id.of.state')).returns((_) => Promise.resolve(true));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(It.isAnyString()), Times.once());
			});

			it('should convert number state value to string', async () => {
				const sut = new StringStateAndConstantCondition(
					'42',
					'id.of.state',
					EqualitySign.Equal,
					stateServiceMock.object,
				);
				stateServiceMock.setup((s) => s.getForeignState('id.of.state')).returns((_) => Promise.resolve(42));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(It.isAnyString()), Times.once());
			});
		});

		describe('with not equal sign', () => {
			it('should evaluate to false if state and constant are equal', async () => {
				const value = 'val1';
				const sut = new StringStateAndConstantCondition(
					value,
					'id.of.state',
					EqualitySign.NotEqual,
					stateServiceMock.object,
				);
				stateServiceMock.setup((s) => s.getForeignState('id.of.state')).returns((_) => Promise.resolve(value));
				expect(await sut.evaluate()).to.be.false;
				stateServiceMock.verify((s) => s.getForeignState(It.isAnyString()), Times.once());
			});

			it('should evaluate to true if state and constant are not equal', async () => {
				const sut = new StringStateAndConstantCondition(
					'val1',
					'id.of.state',
					EqualitySign.NotEqual,
					stateServiceMock.object,
				);
				stateServiceMock.setup((s) => s.getForeignState('id.of.state')).returns((_) => Promise.resolve('val2'));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(It.isAnyString()), Times.once());
			});

			it('should convert boolean state value to string', async () => {
				const sut = new StringStateAndConstantCondition(
					'false',
					'id.of.state',
					EqualitySign.NotEqual,
					stateServiceMock.object,
				);
				stateServiceMock.setup((s) => s.getForeignState('id.of.state')).returns((_) => Promise.resolve(true));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(It.isAnyString()), Times.once());
			});

			it('should convert number state value to string', async () => {
				const sut = new StringStateAndConstantCondition(
					'43',
					'id.of.state',
					EqualitySign.NotEqual,
					stateServiceMock.object,
				);
				stateServiceMock.setup((s) => s.getForeignState('id.of.state')).returns((_) => Promise.resolve(42));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(It.isAnyString()), Times.once());
			});
		});
	});

	describe('toString', () => {
		it('with equal sign', () => {
			const sut = new StringStateAndConstantCondition(
				'43',
				'id.of.state',
				EqualitySign.Equal,
				TypeMoq.Mock.ofType<StateService>().object,
			);
			expect(sut.toString()).to.equal('43 == id.of.state');
		});

		it('with not equal sign', () => {
			const sut = new StringStateAndConstantCondition(
				'value1',
				'id.of.state',
				EqualitySign.NotEqual,
				TypeMoq.Mock.ofType<StateService>().object,
			);
			expect(sut.toString()).to.equal('value1 != id.of.state');
		});
	});
});
