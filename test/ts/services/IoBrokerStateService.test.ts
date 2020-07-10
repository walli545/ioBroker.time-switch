import { expect } from 'chai';
import { IoBrokerStateService } from '../../../src/services/IoBrokerStateService';
import * as TypeMoq from 'typemoq';
import { LoggingService } from '../../../src/services/LoggingService';
import { It, Times } from 'typemoq';

describe('IoBrokerStateService', () => {
	let adapterMock: TypeMoq.IMock<ioBroker.Adapter>;
	let sut: IoBrokerStateService;

	beforeEach(() => {
		adapterMock = TypeMoq.Mock.ofType<ioBroker.Adapter>();
		sut = new IoBrokerStateService(adapterMock.object);
	});

	describe('ctor', () => {
		it('throws when adapter is null', () => {
			expect(() => new IoBrokerStateService(null as any)).to.throw();
		});
	});

	describe('setState', () => {
		it('throws when id is null', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			expect(() => sut.setState(null as any, 'abc')).to.throw();
		});

		it('throws when id is empty', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			expect(() => sut.setState('', 'abc')).to.throw();
		});

		it('sets state in adapter', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			sut.setState('test.id.123', 'new value');
			adapterMock.verify((x) => x.setState('test.id.123', 'new value', true), TypeMoq.Times.once());
		});

		it('sets state in adapter with ack=true', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			sut.setState('test.id.123', 'new value', true);
			adapterMock.verify((x) => x.setState('test.id.123', 'new value', true), TypeMoq.Times.once());
		});

		it('sets state in adapter with ack=false', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			sut.setState('test.id.123', 'new value', false);
			adapterMock.verify((x) => x.setState('test.id.123', 'new value', false), TypeMoq.Times.once());
		});
	});

	describe('setForeignState', () => {
		it('throws when id is null', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			expect(() => sut.setForeignState(null as any, 'abc')).to.throw();
		});

		it('throws when id is empty', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			expect(() => sut.setForeignState('', 'abc')).to.throw();
		});

		it('sets state in adapter', () => {
			sut.setForeignState('test.id.123', 'new value');
			adapterMock.verify((x) => x.setForeignState('test.id.123', 'new value', false), TypeMoq.Times.once());
		});

		it('should log when logger is provided', () => {
			const logger = TypeMoq.Mock.ofType<LoggingService>();
			const sut = new IoBrokerStateService(adapterMock.object, logger.object);
			sut.setForeignState('test.id.123', 'new value');
			logger.verify((l) => l.logDebug(It.isAnyString()), Times.once());
		});

		it('should log when value is null', () => {
			const logger = TypeMoq.Mock.ofType<LoggingService>();
			const sut = new IoBrokerStateService(adapterMock.object, logger.object);
			sut.setForeignState('test.id.123', null as any);
			logger.verify((l) => l.logDebug(It.isAnyString()), Times.once());
		});
	});

	describe('getForeignState', () => {
		it('rejects when id is undefined', () => {
			expect(sut.getForeignState(undefined as any)).to.be.rejectedWith('id may not be null or empty.');
		});

		it('rejects when id is null', () => {
			expect(sut.getForeignState(null as any)).to.be.rejectedWith('id may not be null or empty.');
		});

		it('rejects when id is empty', () => {
			expect(sut.getForeignState('')).to.be.rejectedWith('id may not be null or empty.');
		});

		it('rejects when state from callback is null', () => {
			adapterMock
				.setup((a) => a.getForeignState('id.of.state', It.isAny()))
				.returns((_, cb) => {
					cb(null, null);
				});
			expect(sut.getForeignState('id.of.state')).to.be.rejectedWith(
				'Requested state id.of.state returned null/undefined!',
			);
		});

		it('rejects when state from callback is undefined', () => {
			adapterMock
				.setup((a) => a.getForeignState('id.of.state', It.isAny()))
				.returns((_, cb) => {
					cb(null, undefined);
				});
			expect(sut.getForeignState('id.of.state')).to.be.rejectedWith(
				'Requested state id.of.state returned null/undefined!',
			);
		});

		it('rejects when error from callback is set', () => {
			adapterMock
				.setup((a) => a.getForeignState('id.of.state', It.isAny()))
				.returns((_, cb) => {
					cb('An error occurred', null);
				});
			expect(sut.getForeignState('id.of.state')).to.be.rejectedWith('An error occurred');
		});

		it('rejects when error from callback is set and state is set', () => {
			adapterMock
				.setup((a) => a.getForeignState('id.of.state', It.isAny()))
				.returns((_, cb) => {
					cb('An error occurred', 'state');
				});
			expect(sut.getForeignState('id.of.state')).to.be.rejectedWith('An error occurred');
		});

		it('resolves with state val', async () => {
			adapterMock
				.setup((a) => a.getForeignState('id.of.state', It.isAny()))
				.returns((_, cb) => {
					cb(null, { val: 'val1' });
				});
			expect(await sut.getForeignState('id.of.state')).to.equal('val1');
		});
	});
});
