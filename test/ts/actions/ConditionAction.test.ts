import * as TypeMoq from 'typemoq';
import { It, Times } from 'typemoq';
import { Condition } from '../../../src/actions/conditions/Condition';
import { Action } from '../../../src/actions/Action';
import { expect } from 'chai';
import { ConditionAction } from '../../../src/actions/ConditionAction';
import { LoggingService } from '../../../src/services/LoggingService';
import exp = require('constants');

describe('ConditionAction', () => {
	const specTimeout = 700;
	const checkTimeout = 500;
	const validCondition = TypeMoq.Mock.ofType<Condition>().object;
	const validAction = TypeMoq.Mock.ofType<Action>().object;

	describe('ctor and getter', () => {
		it('throws when condition is undefined', () => {
			expect(() => new ConditionAction(undefined as any, validAction)).to.throw();
		});

		it('throws when condition is null', () => {
			expect(() => new ConditionAction(null as any, validAction)).to.throw();
		});

		it('throws when action is undefined', () => {
			expect(() => new ConditionAction(validCondition, undefined as any)).to.throw();
		});

		it('throws when action is null', () => {
			expect(() => new ConditionAction(validCondition, null as any)).to.throw();
		});

		it('creates with valid values', () => {
			const sut = new ConditionAction(validCondition, validAction);
			expect(sut.getAction()).to.equal(validAction);
			expect(sut.getCondition()).to.equal(validCondition);
		});

		it('creates with valid values and logger', () => {
			const logger = TypeMoq.Mock.ofType<LoggingService>();
			const sut = new ConditionAction(validCondition, validAction, logger.object);
			expect(sut.getAction()).to.equal(validAction);
			expect(sut.getCondition()).to.equal(validCondition);
		});
	});

	describe('setter', () => {
		const sut = new ConditionAction(validCondition, validAction);

		it('throws when setting action to null', () => {
			expect(() => sut.setAction(null as any)).to.throw();
		});

		it('throws when setting action to undefined', () => {
			expect(() => sut.setAction(undefined as any)).to.throw();
		});

		it('sets new action', () => {
			const newAction = TypeMoq.Mock.ofType<Action>().object;
			expect(sut.getAction()).to.equal(validAction);
			expect(sut.getAction()).not.to.equal(newAction);
			sut.setAction(newAction);
			expect(sut.getAction()).to.equal(newAction);
		});
	});

	describe('execute', () => {
		let conditionMock: TypeMoq.IMock<Condition>;
		let actionMock: TypeMoq.IMock<Action>;
		let sut: ConditionAction;

		beforeEach(() => {
			conditionMock = TypeMoq.Mock.ofType<Condition>();
			actionMock = TypeMoq.Mock.ofType<Action>();
			sut = new ConditionAction(conditionMock.object, actionMock.object);
		});

		it('should execute action when condition evaluates to true', (done) => {
			conditionMock.setup((c) => c.evaluate()).returns((_) => Promise.resolve(true));

			sut.execute();

			setTimeout(() => {
				conditionMock.verify((c) => c.evaluate(), Times.once());
				actionMock.verify((a) => a.execute(), Times.once());
				done();
			}, checkTimeout);
		}).timeout(specTimeout);

		it('should not execute action when condition evaluates to false', (done) => {
			conditionMock.setup((c) => c.evaluate()).returns((_) => Promise.resolve(false));
			sut.execute();

			setTimeout(() => {
				conditionMock.verify((c) => c.evaluate(), Times.once());
				actionMock.verify((a) => a.execute(), Times.never());
				done();
			}, checkTimeout);
		}).timeout(specTimeout);

		it('should log execution when condition evaluates to true', (done) => {
			const logger = TypeMoq.Mock.ofType<LoggingService>();
			const sutWithLogger = new ConditionAction(conditionMock.object, actionMock.object, logger.object);
			conditionMock.setup((c) => c.evaluate()).returns((_) => Promise.resolve(true));

			sutWithLogger.execute();
			setTimeout(() => {
				logger.verify((l) => l.logDebug(It.isAnyString()), Times.once());
				done();
			}, checkTimeout);
		}).timeout(specTimeout);

		it('should log execution when condition evaluates to false', (done) => {
			const logger = TypeMoq.Mock.ofType<LoggingService>();
			const sutWithLogger = new ConditionAction(conditionMock.object, actionMock.object, logger.object);
			conditionMock.setup((c) => c.evaluate()).returns((_) => Promise.resolve(false));

			sutWithLogger.execute();
			setTimeout(() => {
				logger.verify((l) => l.logDebug(It.isAnyString()), Times.once());
				done();
			}, checkTimeout);
		}).timeout(specTimeout);

		it('should log error when condition evaluation rejects', (done) => {
			const logger = TypeMoq.Mock.ofType<LoggingService>();
			const sutWithLogger = new ConditionAction(conditionMock.object, actionMock.object, logger.object);
			conditionMock.setup((c) => c.evaluate()).returns((_) => Promise.reject('myerror'));

			sutWithLogger.execute();
			setTimeout(() => {
				conditionMock.verify((c) => c.evaluate(), Times.once());
				actionMock.verify((a) => a.execute(), Times.never());
				logger.verify((l) => l.logError(It.isAnyString()), Times.once());
				done();
			}, checkTimeout);
		}).timeout(specTimeout);

		it('should do nothing when condition evaluation rejects', (done) => {
			conditionMock.setup((c) => c.evaluate()).returns((_) => Promise.reject('myerror'));

			sut.execute();
			setTimeout(() => {
				conditionMock.verify((c) => c.evaluate(), Times.once());
				actionMock.verify((a) => a.execute(), Times.never());
				done();
			}, checkTimeout);
		}).timeout(specTimeout);
	});
});
