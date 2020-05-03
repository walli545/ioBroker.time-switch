import { expect } from 'chai';
import { IoBrokerStateService } from '../../../src/services/IoBrokerStateService';
import * as TypeMoq from 'typemoq';

describe('IoBrokerStateService', () => {
	const adapterMock = TypeMoq.Mock.ofType<ioBroker.Adapter>();

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
			adapterMock.verify(x => x.setState('test.id.123', 'new value', false), TypeMoq.Times.once());
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
			const sut = new IoBrokerStateService(adapterMock.object);
			sut.setForeignState('test.id.123', 'new value');
			adapterMock.verify(x => x.setForeignState('test.id.123', 'new value', false), TypeMoq.Times.once());
		});
	});
});
