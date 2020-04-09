import { fail } from 'assert';
import { TimeTrigger } from '../../../src/triggers/TimeTrigger';
import { Weekday } from '../../../src/triggers/Weekday';
import { TimeTriggerScheduler } from '../../../src/scheduler/TimeTriggerScheduler';
import { expect } from 'chai';
import { Action } from '../../../src/actions/Action';
import { TimeTriggerBuilder } from '../../../src/triggers/TimeTriggerBuilder';

describe('TimeTriggerScheduler', function() {
	const dummyAction = {
		getId: () => 'id01',
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		execute: () => {},
	} as Action;

	describe('register', function() {
		it('throws on registering same trigger twice', () => {
			const sut = new TimeTriggerScheduler();
			const trigger = new TimeTriggerBuilder()
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday])
				.setAction(dummyAction)
				.build();

			sut.register(trigger);
			expect(() => sut.register(trigger)).to.throw();
			sut.unregister(trigger);
		});

		it('should trigger on time', done => {
			const currentTime = new Date();
			const inOneMinute = new Date(currentTime.getTime() + 60000);
			const sut = new TimeTriggerScheduler();
			let trigger: TimeTrigger|null = null;
			const testAction = {
				getId: () => 'id01',
				execute: () => {
					const triggeredDate = new Date();
					expect(triggeredDate.getHours()).to.equal(inOneMinute.getHours());
					expect(triggeredDate.getMinutes()).to.equal(inOneMinute.getMinutes());
					done();
					sut.unregister(trigger as any);
				},
			} as Action
			trigger = new TimeTriggerBuilder()
				.setHour(inOneMinute.getHours())
				.setMinute(inOneMinute.getMinutes())
				.setWeekdays([inOneMinute.getDay()])
				.setAction(testAction)
				.build();
			sut.register(trigger);
		}).timeout(70000);
	});

	describe('unregister', () => {
		it('throws on unregistering a not registered trigger', () => {
			const sut = new TimeTriggerScheduler();
			const trigger = new TimeTriggerBuilder()
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday])
				.setAction(dummyAction)
				.build();
			expect(() => sut.unregister(trigger)).to.throw();
		});

		it('should not call unregistered trigger', done => {
			const currentTime = new Date();
			const inOneMinute = new Date(currentTime.getTime() + 60000);
			const sut = new TimeTriggerScheduler();
			const testAction = {
				getId: () => 'id01',
				execute: () => {
					fail('Unregistered trigger should not be called');
				},
			} as Action;
			const trigger = new TimeTriggerBuilder()
				.setHour(inOneMinute.getHours())
				.setMinute(inOneMinute.getMinutes())
				.setWeekdays([inOneMinute.getDay()])
				.setAction(testAction)
				.build();
			setTimeout(done, 69000);
			sut.register(trigger);
			sut.unregister(trigger);
		}).timeout(70000);
	});
});
