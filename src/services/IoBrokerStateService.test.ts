import { expect } from 'chai';
import { IoBrokerStateService } from './IoBrokerStateService';
import * as TypeMoq from 'typemoq';

describe('IoBrokerStateService', () => {
	const adapterMock = TypeMoq.Mock.ofType<ioBroker.Adapter>();

	describe('ctor', () => {
		it('throws when adapter is null', () => {
			// @ts-ignore
			expect(() => new IoBrokerStateService(null)).to.throw();
		});
	});

	describe('setState', () => {
		it('throws when id is null', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			// @ts-ignore
			expect(() => sut.setState(null, 'abc')).to.throw();
		});

		it('throws when id is empty', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			// @ts-ignore
			expect(() => sut.setState('', 'abc')).to.throw();
		});

		it('sets state in adapter', () => {
			const sut = new IoBrokerStateService(adapterMock.object);
			sut.setState('test.id.123', 'new value');
			adapterMock.verify(x => x.setState('test.id.123', 'new value'), TypeMoq.Times.once());
		});
	});
});