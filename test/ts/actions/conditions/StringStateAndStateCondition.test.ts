import { EqualitySign } from '../../../../src/actions/conditions/EqualitySign';
import * as TypeMoq from 'typemoq';
import { Times } from 'typemoq';
import { StateService } from '../../../../src/services/StateService';
import { expect } from 'chai';
import { StringStateAndStateCondition } from '../../../../src/actions/conditions/StringStateAndStateCondition';

describe('StringStateAndStateCondition', () => {
	describe('ctor and getter', () => {
		const validStateId1 = 'id.of.state.1';
		const validStateId2 = 'id.of.state.2';
		const validSign = EqualitySign.Equal;
		const validStateService = TypeMoq.Mock.ofType<StateService>().object;

		it('throws when first state id is undefined', () => {
			expect(
				() => new StringStateAndStateCondition(undefined as any, validStateId2, validSign, validStateService),
			).to.throw();
		});

		it('throws when first state id is null', () => {
			expect(
				() => new StringStateAndStateCondition(null as any, validStateId2, validSign, validStateService),
			).to.throw();
		});

		it('throws when second state id is undefined', () => {
			expect(
				() => new StringStateAndStateCondition(validStateId1, undefined as any, validSign, validStateService),
			).to.throw();
		});

		it('throws when second state id is null', () => {
			expect(
				() => new StringStateAndStateCondition(validStateId1, null as any, validSign, validStateService),
			).to.throw();
		});

		it('throws when second state id is empty', () => {
			expect(() => new StringStateAndStateCondition(validStateId1, '', validSign, validStateService)).to.throw();
		});

		it('throws when sign is undefined', () => {
			expect(
				() =>
					new StringStateAndStateCondition(validStateId1, validStateId2, undefined as any, validStateService),
			).to.throw();
		});

		it('throws when sign is null', () => {
			expect(
				() => new StringStateAndStateCondition(validStateId1, validStateId2, null as any, validStateService),
			).to.throw();
		});

		it('throws when state service is undefined', () => {
			expect(
				() => new StringStateAndStateCondition(validStateId1, validStateId2, validSign, undefined as any),
			).to.throw();
		});

		it('throws when state service is null', () => {
			expect(
				() => new StringStateAndStateCondition(validStateId1, validStateId2, validSign, null as any),
			).to.throw();
		});

		it('creates with valid values', () => {
			const sut = new StringStateAndStateCondition(validStateId1, validStateId2, validSign, validStateService);
			expect(sut.getStateId1()).to.equal(validStateId1);
			expect(sut.getStateId2()).to.equal(validStateId2);
			expect(sut.getSign()).to.equal(validSign);
		});
	});

	describe('evaluate', () => {
		let stateServiceMock: TypeMoq.IMock<StateService>;

		beforeEach(() => {
			stateServiceMock = TypeMoq.Mock.ofType<StateService>();
		});

		describe('with equal sign', () => {
			it('should evaluate to true if first and second state values are equal', async () => {
				const id1 = 'id.of.state.1';
				const id2 = 'id.of.state.2';
				const value = 'value1';
				const sut = new StringStateAndStateCondition(id1, id2, EqualitySign.Equal, stateServiceMock.object);
				stateServiceMock.setup((s) => s.getForeignState(id1)).returns((_) => Promise.resolve(value));
				stateServiceMock.setup((s) => s.getForeignState(id2)).returns((_) => Promise.resolve(value));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(id1), Times.once());
				stateServiceMock.verify((s) => s.getForeignState(id2), Times.once());
			});

			it('should evaluate to false if first and second state value  are not equal', async () => {
				const id1 = 'id.of.state.1';
				const id2 = 'id.of.state.2';
				const sut = new StringStateAndStateCondition(id1, id2, EqualitySign.Equal, stateServiceMock.object);
				stateServiceMock.setup((s) => s.getForeignState(id1)).returns((_) => Promise.resolve('value1'));
				stateServiceMock.setup((s) => s.getForeignState(id2)).returns((_) => Promise.resolve('value2'));
				expect(await sut.evaluate()).to.be.false;
				stateServiceMock.verify((s) => s.getForeignState(id1), Times.once());
				stateServiceMock.verify((s) => s.getForeignState(id2), Times.once());
			});

			it('should convert boolean state value to string', async () => {
				const id1 = 'id.of.state.1';
				const id2 = 'id.of.state.2';
				const sut = new StringStateAndStateCondition(id1, id2, EqualitySign.Equal, stateServiceMock.object);
				stateServiceMock.setup((s) => s.getForeignState(id1)).returns((_) => Promise.resolve(true));
				stateServiceMock.setup((s) => s.getForeignState(id2)).returns((_) => Promise.resolve('true'));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(id1), Times.once());
				stateServiceMock.verify((s) => s.getForeignState(id2), Times.once());
			});

			it('should convert number state value to string', async () => {
				const id1 = 'id.of.state.1';
				const id2 = 'id.of.state.2';
				const sut = new StringStateAndStateCondition(id1, id2, EqualitySign.Equal, stateServiceMock.object);
				stateServiceMock.setup((s) => s.getForeignState(id1)).returns((_) => Promise.resolve(5));
				stateServiceMock.setup((s) => s.getForeignState(id2)).returns((_) => Promise.resolve('5'));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(id1), Times.once());
				stateServiceMock.verify((s) => s.getForeignState(id2), Times.once());
			});
		});

		describe('with not equal sign', () => {
			it('should evaluate to false if first and second state values are equal', async () => {
				const id1 = 'id.of.state.1';
				const id2 = 'id.of.state.2';
				const value = 'value1';
				const sut = new StringStateAndStateCondition(id1, id2, EqualitySign.NotEqual, stateServiceMock.object);
				stateServiceMock.setup((s) => s.getForeignState(id1)).returns((_) => Promise.resolve(value));
				stateServiceMock.setup((s) => s.getForeignState(id2)).returns((_) => Promise.resolve(value));
				expect(await sut.evaluate()).to.be.false;
				stateServiceMock.verify((s) => s.getForeignState(id1), Times.once());
				stateServiceMock.verify((s) => s.getForeignState(id2), Times.once());
			});

			it('should evaluate to true if first and second state value  are not equal', async () => {
				const id1 = 'id.of.state.1';
				const id2 = 'id.of.state.2';
				const sut = new StringStateAndStateCondition(id1, id2, EqualitySign.NotEqual, stateServiceMock.object);
				stateServiceMock.setup((s) => s.getForeignState(id1)).returns((_) => Promise.resolve('value1'));
				stateServiceMock.setup((s) => s.getForeignState(id2)).returns((_) => Promise.resolve('value2'));
				expect(await sut.evaluate()).to.be.true;
				stateServiceMock.verify((s) => s.getForeignState(id1), Times.once());
				stateServiceMock.verify((s) => s.getForeignState(id2), Times.once());
			});

			it('should convert boolean state value to string', async () => {
				const id1 = 'id.of.state.1';
				const id2 = 'id.of.state.2';
				const sut = new StringStateAndStateCondition(id1, id2, EqualitySign.NotEqual, stateServiceMock.object);
				stateServiceMock.setup((s) => s.getForeignState(id1)).returns((_) => Promise.resolve(false));
				stateServiceMock.setup((s) => s.getForeignState(id2)).returns((_) => Promise.resolve('false'));
				expect(await sut.evaluate()).to.be.false;
				stateServiceMock.verify((s) => s.getForeignState(id1), Times.once());
				stateServiceMock.verify((s) => s.getForeignState(id2), Times.once());
			});

			it('should convert number state value to string', async () => {
				const id1 = 'id.of.state.1';
				const id2 = 'id.of.state.2';
				const sut = new StringStateAndStateCondition(id1, id2, EqualitySign.NotEqual, stateServiceMock.object);
				stateServiceMock.setup((s) => s.getForeignState(id1)).returns((_) => Promise.resolve(5));
				stateServiceMock.setup((s) => s.getForeignState(id2)).returns((_) => Promise.resolve('5'));
				expect(await sut.evaluate()).to.be.false;
				stateServiceMock.verify((s) => s.getForeignState(id1), Times.once());
				stateServiceMock.verify((s) => s.getForeignState(id2), Times.once());
			});
		});
	});

	describe('toString', () => {
		it('with equal sign', () => {
			const sut = new StringStateAndStateCondition(
				'id.of.state.1',
				'id.of.state.2',
				EqualitySign.Equal,
				TypeMoq.Mock.ofType<StateService>().object,
			);
			expect(sut.toString()).to.equal('id.of.state.1 == id.of.state.2');
		});

		it('with not equal sign', () => {
			const sut = new StringStateAndStateCondition(
				'id.of.state.1',
				'id.of.state.2',
				EqualitySign.NotEqual,
				TypeMoq.Mock.ofType<StateService>().object,
			);
			expect(sut.toString()).to.equal('id.of.state.1 != id.of.state.2');
		});
	});
});
