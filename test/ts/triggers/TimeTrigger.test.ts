import { expect } from 'chai';
import { Weekday } from '../../../src/triggers/Weekday';
import { TimeTriggerBuilder } from '../../../src/triggers/TimeTriggerBuilder';
import { Action } from '../../../src/actions/Action';

describe('TimeTrigger', () => {
	describe('ctor and getter', () => {
		const dummyAction = {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			execute: () => {},
		} as Action;

		it('throws when hour is undefined', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(undefined as any)
					.setMinute(0)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when hour is 24', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(24)
					.setMinute(0)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when hour is 30', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(30)
					.setMinute(0)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when hour is -1', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(-1)
					.setMinute(0)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when minute is undefined', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(undefined as any)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when minute is 60', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(60)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when minute is 120', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(120)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when minute is -1', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(-1)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when weekdays is null', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(24)
					.setMinute(0)
					.setWeekdays(null as any)
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when weekdays is undefined', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(0)
					.setWeekdays(undefined as any)
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when weekdays is empty', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(0)
					.setWeekdays([])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when weekdays contains a duplicate', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(0)
					.setWeekdays([Weekday.Monday, Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when action is undefined', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(0)
					.setWeekdays([Weekday.Monday])
					.setAction(undefined as any)
					.build(),
			).to.throw();
		});

		it('throws when action is null', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId('0')
					.setHour(0)
					.setMinute(0)
					.setWeekdays([Weekday.Monday])
					.setAction(null as any)
					.build(),
			).to.throw();
		});

		it('throws when id is undefined', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId(undefined as any)
					.setHour(0)
					.setMinute(0)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('throws when id is null', () => {
			expect(() =>
				new TimeTriggerBuilder()
					.setId(null as any)
					.setHour(0)
					.setMinute(0)
					.setWeekdays([Weekday.Monday])
					.setAction(dummyAction)
					.build(),
			).to.throw();
		});

		it('creates with hour=0, minute=0, weekdays=[Monday], action=dummyAction', () => {
			const have = new TimeTriggerBuilder()
				.setId('0')
				.setHour(0)
				.setMinute(0)
				.setWeekdays([Weekday.Monday])
				.setAction(dummyAction)
				.build();
			expect(have.getId()).to.equal('0');
			expect(have.getHour()).to.equal(0);
			expect(have.getMinute()).to.equal(0);
			expect(have.getWeekdays().length).to.equal(1);
			expect(have.getWeekdays().includes(Weekday.Monday)).to.equal(true);
			expect(have.getAction()).to.equal(dummyAction);
		});

		it('creates with hour=23, minute=59, weekdays=[all]', () => {
			const have = new TimeTriggerBuilder()
				.setId('1')
				.setHour(23)
				.setMinute(59)
				.setWeekdays([
					Weekday.Monday,
					Weekday.Tuesday,
					Weekday.Wednesday,
					Weekday.Thursday,
					Weekday.Friday,
					Weekday.Saturday,
					Weekday.Sunday,
				])
				.setAction(dummyAction)
				.build();
			expect(have.getId()).to.equal('1');
			expect(have.getHour()).to.equal(23);
			expect(have.getMinute()).to.equal(59);
			expect(have.getWeekdays().length).to.equal(7);
			expect(have.getAction()).to.equal(dummyAction);
		});

		it('creates with hour=12, minute=30, weekdays=[Monday, Wednesday, Friday]', () => {
			const have = new TimeTriggerBuilder()
				.setId('0')
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday, Weekday.Wednesday, Weekday.Friday])
				.setAction(dummyAction)
				.build();
			expect(have.getId()).to.equal('0');
			expect(have.getHour()).to.equal(12);
			expect(have.getMinute()).to.equal(30);
			expect(have.getWeekdays().length).to.equal(3);
			expect(have.getAction()).to.equal(dummyAction);
		});
	});

	describe('trigger', () => {
		it('triggers action', () => {
			let executed = false;
			const testAction = {
				execute: () => {
					executed = true;
				},
			} as Action;

			const trigger = new TimeTriggerBuilder()
				.setId('0')
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday])
				.setAction(testAction)
				.build();

			trigger.trigger();

			expect(executed).to.be.true;
		});
	});
});
