import { expect } from 'chai';
import * as TypeMoq from 'typemoq';
import { StateService } from '../../../src/services/StateService';
import { OnOffStateActionBuilder } from '../../../src/actions/OnOffStateActionBuilder';

describe('OnOffStateAction', () => {
	describe('ctor', () => {
		const validStateId = 'state.0.to.trigger';
		const validOnValue = 'ON';
		const validOffValue = 'OFF';
		const validBooleanValue = true;
		const validStateService = TypeMoq.Mock.ofType<StateService>().object;

		it('throws when idOfStateToSet is null', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdOfStateToSet(null as any)
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when idOfStateToSet is undefined', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdOfStateToSet(undefined as any)
					.setStateService(validStateService)
					.build(),
			).to.throw();
		});

		it('throws when idOfStateToSet is empty', () => {
			expect(() =>
				new OnOffStateActionBuilder()
					.setOnValue(validOnValue)
					.setOffValue(validOffValue)
					.setBooleanValue(validBooleanValue)
					.setIdOfStateToSet('')
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
					.setIdOfStateToSet(validStateId)
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
					.setIdOfStateToSet(validStateId)
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
					.setIdOfStateToSet(validStateId)
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
					.setIdOfStateToSet(validStateId)
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
					.setIdOfStateToSet(validStateId)
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
					.setIdOfStateToSet(validStateId)
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
				.setIdOfStateToSet('id.of.state')
				.setStateService(stateService.object)
				.build();

			expect(sut.getIdOfStateToSet()).to.equal('id.of.state');
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
				.setIdOfStateToSet('id.of.state')
				.setStateService(stateService.object)
				.build();

			expect(sut.getIdOfStateToSet()).to.equal('id.of.state');
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
				.setIdOfStateToSet('id.of.state')
				.setStateService(stateService.object)
				.build();

			expect(sut.getIdOfStateToSet()).to.equal('id.of.state');
			expect(sut.getOnValue()).to.be.true
			expect(sut.getOffValue()).to.be.false;
			expect(sut.getBooleanValue()).to.be.true;
		});

		it('should set onValue on execute', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<number>()
				.setOnValue(1)
				.setOffValue(0)
				.setBooleanValue(true)
				.setIdOfStateToSet('id.of.state')
				.setStateService(stateService.object)
				.build();

			sut.execute();
			stateService.verify(x => x.setForeignState('id.of.state', 1), TypeMoq.Times.once());
		});

		it('should set offValue on execute', () => {
			const stateService = TypeMoq.Mock.ofType<StateService>();
			const sut = new OnOffStateActionBuilder<number>()
				.setOnValue(1)
				.setOffValue(0)
				.setBooleanValue(false)
				.setIdOfStateToSet('id.of.state')
				.setStateService(stateService.object)
				.build();

			sut.execute();
			stateService.verify(x => x.setForeignState('id.of.state', 0), TypeMoq.Times.once());
		});
	});
});
