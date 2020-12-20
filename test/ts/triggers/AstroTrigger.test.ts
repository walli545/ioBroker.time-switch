import { expect } from 'chai';
import * as TypeMoq from 'typemoq';
import { Action } from '../../../src/actions/Action';
import { AstroTime } from '../../../src/triggers/AstroTime';
import { AstroTrigger } from '../../../src/triggers/AstroTrigger';
import { AstroTriggerBuilder } from '../../../src/triggers/AstroTriggerBuilder';
import { AllWeekdays, Weekday } from '../../../src/triggers/Weekday';

describe('AstroTrigger', () => {
	describe('ctor and getter', () => {
		const actionMock = TypeMoq.Mock.ofType<Action>().object;

		it('throws when id is null', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId(null as any)
					.setAction(actionMock)
					.setAstroTime(AstroTime.SolarNoon)
					.setShift(0)
					.setWeekdays([Weekday.Monday])
					.build(),
			).to.throw();
		});

		it('throws when astroTime is null', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(null as any)
					.setShift(0)
					.setWeekdays([Weekday.Monday])
					.build(),
			).to.throw();
		});

		it('throws when astroTime is undefined', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(undefined as any)
					.setShift(0)
					.setWeekdays([Weekday.Monday])
					.build(),
			).to.throw();
		});

		it('throws when shift is null', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(AstroTime.Sunset)
					.setShift(null as any)
					.setWeekdays([Weekday.Monday])
					.build(),
			).to.throw();
		});

		it('throws when shift is undefined', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(AstroTime.Sunset)
					.setShift(undefined as any)
					.setWeekdays([Weekday.Monday])
					.build(),
			).to.throw();
		});

		it('throws when shift is 121', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(AstroTime.Sunset)
					.setShift(121)
					.setWeekdays([Weekday.Monday])
					.build(),
			).to.throw();
		});

		it('throws when shift is -121', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(AstroTime.Sunset)
					.setShift(-121)
					.setWeekdays([Weekday.Monday])
					.build(),
			).to.throw();
		});

		it('throws when weekdays is null', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(AstroTime.Sunset)
					.setShift(0)
					.setWeekdays(null as any)
					.build(),
			).to.throw();
		});

		it('throws when weekdays is empty', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(AstroTime.Sunset)
					.setShift(0)
					.setWeekdays([])
					.build(),
			).to.throw();
		});

		it('throws when weekdays contains a duplicate', () => {
			expect(() =>
				new AstroTriggerBuilder()
					.setId('1')
					.setAction(actionMock)
					.setAstroTime(AstroTime.Sunset)
					.setShift(0)
					.setWeekdays([Weekday.Sunday, Weekday.Sunday])
					.build(),
			).to.throw();
		});

		it('creates with astroTime=Sunrise, shift=0, weekdays=[Monday]', () => {
			const have = new AstroTriggerBuilder()
				.setId('1')
				.setAction(actionMock)
				.setAstroTime(AstroTime.Sunrise)
				.setShift(0)
				.setWeekdays([Weekday.Monday])
				.build();
			expect(have.getId()).to.equal('1');
			expect(have.getAction()).to.equal(actionMock);
			expect(have.getAstroTime()).to.equal(AstroTime.Sunrise);
			expect(have.getShiftInMinutes()).to.equal(0);
			expect(have.getWeekdays()).to.deep.equal([Weekday.Monday]);
		});

		it('creates with astroTime=Sunset, shift=120, weekdays=[all]', () => {
			const have = new AstroTriggerBuilder()
				.setId('1')
				.setAction(actionMock)
				.setAstroTime(AstroTime.Sunset)
				.setShift(120)
				.setWeekdays(AllWeekdays)
				.build();
			expect(have.getId()).to.equal('1');
			expect(have.getAction()).to.equal(actionMock);
			expect(have.getAstroTime()).to.equal(AstroTime.Sunset);
			expect(have.getShiftInMinutes()).to.equal(120);
			expect(have.getWeekdays()).to.deep.equal(AllWeekdays);
		});

		it('creates with astroTime=SolarNoon, shift=-120, weekdays=[Monday, Wednesday, Friday]', () => {
			const have = new AstroTriggerBuilder()
				.setId('8')
				.setAction(actionMock)
				.setAstroTime(AstroTime.SolarNoon)
				.setShift(-120)
				.setWeekdays([Weekday.Monday, Weekday.Wednesday, Weekday.Friday])
				.build();
			expect(have.getId()).to.equal('8');
			expect(have.getAction()).to.equal(actionMock);
			expect(have.getAstroTime()).to.equal(AstroTime.SolarNoon);
			expect(have.getShiftInMinutes()).to.equal(-120);
			expect(have.getWeekdays()).to.deep.equal([Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
		});

		it('toString', () => {
			const have = new AstroTriggerBuilder()
				.setId('8')
				.setAction(actionMock)
				.setAstroTime(AstroTime.SolarNoon)
				.setShift(-120)
				.setWeekdays([Weekday.Monday, Weekday.Wednesday, Weekday.Friday])
				.build();
			expect(have.toString()).to.equal('AstroTrigger {id=8, astroTime=solarNoon, shift=-120, weekdays=[1,3,5]}');
		});
	});

	describe('constants', () => {
		it('MAX_SHIFT is 200', () => {
			expect(AstroTrigger.MAX_SHIFT).to.equal(120);
		});
	});
});
