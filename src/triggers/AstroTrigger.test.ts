import { expect } from 'chai';
import { AstroTime } from './AstroTime';
import { AstroTrigger } from './AstroTrigger';
import { Weekday } from './Weekday';

describe('AstroTrigger', () => {
	describe('ctor and getter', () => {
		it('throws when astroTime is null', () => {
			// @ts-ignore
			expect(() => new AstroTrigger(null, 0, [Weekday.Monday])).to.throw();
		});

		it('throws when shift is 601', () => {
			expect(() => new AstroTrigger(AstroTime.Dawn, 601, [Weekday.Monday])).to.throw();
		});

		it('throws when shift is -601', () => {
			expect(() => new AstroTrigger(AstroTime.Dawn, -601, [Weekday.Monday])).to.throw();
		});

		it('throws when shift is Number.POSITIVE_INFINITY', () => {
			expect(() => new AstroTrigger(AstroTime.Dawn, Number.POSITIVE_INFINITY, [Weekday.Monday])).to.throw();
		});

		it('throws when shift is Number.NEGATIVE_INFINITY', () => {
			expect(() => new AstroTrigger(AstroTime.Dawn, Number.NEGATIVE_INFINITY, [Weekday.Monday])).to.throw();
		});

		it('throws when weekdays is null', () => {
			// @ts-ignore
			expect(() => new AstroTrigger(AstroTime.Dawn, 0, null)).to.throw();
		});

		it('throws when weekdays is empty', () => {
			expect(() => new AstroTrigger(AstroTime.Dawn, 0, [])).to.throw();
		});

		it('throws when weekdays contains a duplicate', () => {
			expect(() => new AstroTrigger(AstroTime.Dawn, 0, [Weekday.Monday, Weekday.Monday])).to.throw();
		});

		it('creates with astroTime=Sunrise, shift=0, weekdays=[Monday]', () => {
			const have = new AstroTrigger(AstroTime.Sunrise, 0, [Weekday.Monday]);
			expect(have.getAstroTime()).to.equal(AstroTime.Sunrise);
			expect(have.getShiftInMinutes()).to.equal(0);
			expect(have.getWeekdays().length).to.equal(1);
			expect(have.getWeekdays().includes(Weekday.Monday)).to.equal(true);
		});

		it('creates with astroTime=Dawn, shift=600, weekdays=[all]', () => {
			const have = new AstroTrigger(AstroTime.Dawn, 600, [
				Weekday.Monday,
				Weekday.Tuesday,
				Weekday.Wednesday,
				Weekday.Thursday,
				Weekday.Friday,
				Weekday.Saturday,
				Weekday.Sunday,
			]);
			expect(have.getAstroTime()).to.equal(AstroTime.Dawn);
			expect(have.getShiftInMinutes()).to.equal(600);
			expect(have.getWeekdays().length).to.equal(7);
		});

		it('creates with astroTime=Dawn, shift=600, weekdays=[Monday, Wednesday, Friday]', () => {
			const have = new AstroTrigger(AstroTime.Night, -600, [Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
			expect(have.getAstroTime()).to.equal(AstroTime.Night);
			expect(have.getShiftInMinutes()).to.equal(-600);
			expect(have.getWeekdays().length).to.equal(3);
		});
	});

	describe('constants', () => {
		it('MAX_SHIFT is 600', () => {
			expect(AstroTrigger.MAX_SHIFT).to.equal(600);
		});
	});

	describe('schedule', () => {
		it('contains astro and shift', () => {
			const sut = new AstroTrigger(AstroTime.Sunrise, 42, [Weekday.Monday]);
			const have = sut.getSchedule();
			expect(have.astro).to.equal(AstroTime.Sunrise);
			expect(have.shift).to.equal(42);
		});
	});
});
