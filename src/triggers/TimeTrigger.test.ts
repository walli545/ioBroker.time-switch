import { expect } from 'chai';
import { TimeTrigger } from './TimeTrigger';
import { Weekday } from './Weekday';

describe('TimeTrigger', () => {
	describe('ctor and getter', () => {
		it('throws when hour is undefined', () => {
			expect(() => new TimeTrigger(undefined as any, 0, [Weekday.Monday])).to.throw();
		});

		it('throws when hour is 24', () => {
			expect(() => new TimeTrigger(24, 0, [Weekday.Monday])).to.throw();
		});

		it('throws when hour is 30', () => {
			expect(() => new TimeTrigger(30, 0, [Weekday.Monday])).to.throw();
		});

		it('throws when hour is -1', () => {
			expect(() => new TimeTrigger(-1, 0, [Weekday.Monday])).to.throw();
		});

		it('throws when minute is undefined', () => {
			expect(() => new TimeTrigger(0, undefined as any, [Weekday.Monday])).to.throw();
		});

		it('throws when minute is 60', () => {
			expect(() => new TimeTrigger(0, 60, [Weekday.Monday])).to.throw();
		});

		it('throws when minute is 120', () => {
			expect(() => new TimeTrigger(0, 120, [Weekday.Monday])).to.throw();
		});

		it('throws when minute is -1', () => {
			expect(() => new TimeTrigger(0, -1, [Weekday.Monday])).to.throw();
		});

		it('throws when weekdays is null', () => {
			expect(() => new TimeTrigger(0, 0, null as any)).to.throw();
		});

		it('throws when weekdays is undefined', () => {
			expect(() => new TimeTrigger(0, 0, undefined as any)).to.throw();
		});

		it('throws when weekdays is empty', () => {
			expect(() => new TimeTrigger(0, 0, [])).to.throw();
		});

		it('throws when weekdays contains a duplicate', () => {
			expect(() => new TimeTrigger(0, 0, [Weekday.Monday, Weekday.Monday])).to.throw();
		});

		it('creates with hour=0, minute=0, weekdays=[Monday]', () => {
			const have = new TimeTrigger(0, 0, [Weekday.Monday]);
			expect(have.getHour()).to.equal(0);
			expect(have.getMinute()).to.equal(0);
			expect(have.getWeekdays().length).to.equal(1);
			expect(have.getWeekdays().includes(Weekday.Monday)).to.equal(true);
		});

		it('creates with hour=23, minute=59, weekdays=[all]', () => {
			const have = new TimeTrigger(23, 59, [
				Weekday.Monday,
				Weekday.Tuesday,
				Weekday.Wednesday,
				Weekday.Thursday,
				Weekday.Friday,
				Weekday.Saturday,
				Weekday.Sunday,
			]);
			expect(have.getHour()).to.equal(23);
			expect(have.getMinute()).to.equal(59);
			expect(have.getWeekdays().length).to.equal(7);
		});

		it('creates with hour=12, minute=30, weekdays=[Monday, Wednesday, Friday]', () => {
			const have = new TimeTrigger(12, 30, [Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
			expect(have.getHour()).to.equal(12);
			expect(have.getMinute()).to.equal(30);
			expect(have.getWeekdays().length).to.equal(3);
		});
	});
});
