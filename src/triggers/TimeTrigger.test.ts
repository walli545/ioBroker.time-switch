import { expect } from 'chai';
import { TimeTrigger } from './TimeTrigger';
import { Weekday } from './Weekday';

describe('TimeTrigger', () => {
	describe('ctor and getter', () => {
		it('should throw when hours is 24', () => {
			expect(() => new TimeTrigger(24, 0, [Weekday.Monday])).to.throw();
		});

		it('should throw when hours is 30', () => {
			expect(() => new TimeTrigger(30, 0, [Weekday.Monday])).to.throw();
		});

		it('should throw when hours is -1', () => {
			expect(() => new TimeTrigger(-1, 0, [Weekday.Monday])).to.throw();
		});

		it('should throw when minutes is 60', () => {
			expect(() => new TimeTrigger(0, 60, [Weekday.Monday])).to.throw();
		});

		it('should throw when minutes is 120', () => {
			expect(() => new TimeTrigger(0, 120, [Weekday.Monday])).to.throw();
		});

		it('should throw when minutes is -1', () => {
			expect(() => new TimeTrigger(0, -1, [Weekday.Monday])).to.throw();
		});

		it('throws when weekdays is null', () => {
			// @ts-ignore
			expect(() => new TimeTrigger(0, 0, null)).to.throw();
		});

		it('throws when weekdays is empty', () => {
			expect(() => new TimeTrigger(0, 0, [])).to.throw();
		});

		it('throws when weekdays contains a duplicate', () => {
			expect(() => new TimeTrigger(0, 0, [Weekday.Monday, Weekday.Monday])).to.throw();
		});

		it('creates with hours=0, minutes=0, weekdays=[Monday]', () => {
			const have = new TimeTrigger(0, 0, [Weekday.Monday]);
			expect(have.getHours()).to.equal(0);
			expect(have.getMinutes()).to.equal(0);
			expect(have.getWeekdays().length).to.equal(1);
			expect(have.getWeekdays().includes(Weekday.Monday)).to.equal(true);
		});

		it('creates with hours=23, minutes=59, weekdays=[all]', () => {
			const have = new TimeTrigger(23, 59, [
				Weekday.Monday,
				Weekday.Tuesday,
				Weekday.Wednesday,
				Weekday.Thursday,
				Weekday.Friday,
				Weekday.Saturday,
				Weekday.Sunday,
			]);
			expect(have.getHours()).to.equal(23);
			expect(have.getMinutes()).to.equal(59);
			expect(have.getWeekdays().length).to.equal(7);
		});

		it('creates with hours=12, minutes=30, weekdays=[Monday, Wednesday, Friday]', () => {
			const have = new TimeTrigger(12, 30, [Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
			expect(have.getHours()).to.equal(12);
			expect(have.getMinutes()).to.equal(30);
			expect(have.getWeekdays().length).to.equal(3);
		});
	});
});
