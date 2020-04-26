import { expect } from 'chai';
import * as TypeMoq from 'typemoq';
import { StateService } from '../../../src/services/StateService';
import { OnOffStateActionBuilder } from '../../../src/actions/OnOffStateActionBuilder';
import { OnOffStateAction } from '../../../src/actions/OnOffStateAction';

describe('OnOffStateAction', () => {
	describe('ctor', () => {
		const validStateIds = ['state.0.to.trigger'];
		const validOnValue = 'ON';
		const validOffValue = 'OFF';
		const validBooleanValue = true;
		const validStateService = TypeMoq.Mock.ofType<StateService>().object;

		it('throws when idsOfStatesToSet is null', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdsOfStatesToSet(null as any)
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when idsOfStatesToSet is undefined', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdsOfStatesToSet(undefined as any)
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when idsOfStatesToSet is empty', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdsOfStatesToSet([])
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when idsOfStatesToSet contains empty id', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdsOfStatesToSet([''])
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when stateService is null', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdsOfStatesToSet(validStateIds)
					.setStateService(null as any)
					.build(),
			).to.throw();
		});

		it('throws when stateService is undefined', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdsOfStatesToSet(validStateIds)
					.setStateService(undefined as any)
					.build(),
			).to.throw();
		});

		it('throws when offValue is undefined', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(undefined as any)
					.setBooleanValue(validBooleanValue)
					.setIdsOfStatesToSet(validStateIds)
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when onValue is undefined', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(undefined as any)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdsOfStatesToSet(validStateIds)
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when booleanValue is undefined', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(undefined as any)
					.setIdsOfStatesToSet(validStateIds)
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when booleanValue is null', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(null as any)
					.setIdsOfStatesToSet(validStateIds)
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('should create with string values', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<string>()
				.setOnValue('ON')
				.setOffValue('OFF')
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(stateService.object)
				.build();

			expect(sut.getIdsOfStatesToSet()).to.deep.equal(['id.of.state']);
			expect(sut.getOnValue()).to.equal('ON');
			expect(sut.getOffValue()).to.equal('OFF');
			expect(sut.getBooleanValue()).to.be.true;
		});

		it('should create with number values', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<number>()
				.setOnValue(1)
				.setOffValue(0)
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(stateService.object)
				.build();

			expect(sut.getIdsOfStatesToSet()).to.deep.equal(['id.of.state']);
			expect(sut.getOnValue()).to.equal(1);
			expect(sut.getOffValue()).to.equal(0);
			expect(sut.getBooleanValue()).to.be.false;
		});

		it('should create with boolean value ', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<boolean>()
				.setOnValue(true)
				.setOffValue(false)
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(stateService.object)
				.build();

			expect(sut.getIdsOfStatesToSet()).to.deep.equal(['id.of.state']);
			expect(sut.getOnValue()).to.be.true;
			expect(sut.getOffValue()).to.be.false;
			expect(sut.getBooleanValue()).to.be.true;
		});

		it('should set onValue on execute', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<number>()
				.setOnValue(1)
				.setOffValue(0)
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(stateService.object)
				.build();

			sut.execute();
			stateService.verify(x => x.setForeignState('id.of.state', 1), TypeMoq.Times.once());
		});

		it('should set onValue on execute to multiple ids', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<number>()
				.setOnValue(1)
				.setOffValue(0)
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['id.of.state1', 'id.of.state2'])
				.setStateService(stateService.object)
				.build();

			sut.execute();
			stateService.verify(x => x.setForeignState('id.of.state1', 1), TypeMoq.Times.once());
			stateService.verify(x => x.setForeignState('id.of.state2', 1), TypeMoq.Times.once());
		});

		it('should set offValue on execute', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<number>()
				.setOnValue(1)
				.setOffValue(0)
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(stateService.object)
				.build();

			sut.execute();
			stateService.verify(x => x.setForeignState('id.of.state', 0), TypeMoq.Times.once());
		});

		it('should set offValue on execute to multiple ids', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<number>()
				.setOnValue(1)
				.setOffValue(0)
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['id.of.state1', 'id.of.state2'])
				.setStateService(stateService.object)
				.build();

			sut.execute();
			stateService.verify(x => x.setForeignState('id.of.state1', 0), TypeMoq.Times.once());
			stateService.verify(x => x.setForeignState('id.of.state2', 0), TypeMoq.Times.once());
		});
	});

	describe('setter/getter', () => {
		let sut: OnOffStateAction<string>;

		beforeEach(() => {
			sut = new OnOffStateActionBuilder<string>()
				.setOnValue('ON')
				.setOffValue('OFF')
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(TypeMoq.Mock.ofType<StateService>().object)
				.build();
		});

		it('should set new state ids', () => {
			expect(sut.getIdsOfStatesToSet()).to.deep.equal(['id.of.state']);
			sut.setIdsOfStatesToSet(['id.of.state1', 'id.of.state2']);
			expect(sut.getIdsOfStatesToSet()).to.deep.equal(['id.of.state1', 'id.of.state2']);
		});

		it('throws when setting undefined as idsOfStatesToSet', () => {
			expect(() => sut.setIdsOfStatesToSet(undefined as any)).to.throw();
		});

		it('throws when setting null as idsOfStatesToSet', () => {
			expect(() => sut.setIdsOfStatesToSet(null as any)).to.throw();
		});

		it('throws when setting [] as idsOfStatesToSet', () => {
			expect(() => sut.setIdsOfStatesToSet([])).to.throw();
		});

		it("throws when setting [''] as idsOfStatesToSet", () => {
			expect(() => sut.setIdsOfStatesToSet([''])).to.throw();
		});

		it("throws when setting ['id.of.state',''] as idsOfStatesToSet", () => {
			expect(() => sut.setIdsOfStatesToSet(['id.of.state', ''])).to.throw();
		});
	});

	describe('value type conversion', () => {
		const validStateService = TypeMoq.Mock.ofType<StateService>().object;

		it('should convert from boolean to string', () => {
			const sut = new OnOffStateActionBuilder<boolean>()
				.setOnValue(true)
				.setOffValue(false)
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(validStateService)
				.build();

			const have = sut.toStringValueType('ON', 'OFF');
			expect(have.getOnValue()).to.equal('ON');
			expect(have.getOffValue()).to.equal('OFF');
			expect(have.getBooleanValue()).to.equal(sut.getBooleanValue());
			expect(have.getIdsOfStatesToSet()).to.equal(sut.getIdsOfStatesToSet());
		});

		it('should convert from string to boolean', () => {
			const sut = new OnOffStateActionBuilder<string>()
				.setOnValue('ON')
				.setOffValue('OFF')
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(validStateService)
				.build();

			const have = sut.toBooleanValueType();
			expect(have.getOnValue()).to.be.true;
			expect(have.getOffValue()).to.be.false;
			expect(have.getBooleanValue()).to.equal(sut.getBooleanValue());
			expect(have.getIdsOfStatesToSet()).to.equal(sut.getIdsOfStatesToSet());
		});

		it('should convert from string to number', () => {
			const sut = new OnOffStateActionBuilder<string>()
				.setOnValue('ON')
				.setOffValue('OFF')
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['id.of.state'])
				.setStateService(validStateService)
				.build();

			const have = sut.toNumberValueType(1, 0);
			expect(have.getOnValue()).to.equal(1);
			expect(have.getOffValue()).to.equal(0);
			expect(have.getBooleanValue()).to.equal(sut.getBooleanValue());
			expect(have.getIdsOfStatesToSet()).to.equal(sut.getIdsOfStatesToSet());
		});
	});
});
