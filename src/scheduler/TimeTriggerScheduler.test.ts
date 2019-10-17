import { fail } from 'assert';
import { TimeTrigger } from '../triggers/TimeTrigger';
import { Weekday } from '../triggers/Weekday';
import { TimeTriggerScheduler } from './TimeTriggerScheduler';
import { expect } from 'chai';

describe('TimeTriggerScheduler', function() {
	describe('register', function() {
		it('throws on registering same trigger twice', () => {
			const sut = new TimeTriggerScheduler();
			const trigger = new TimeTrigger(12, 30, [Weekday.Monday]);
			sut.register(trigger, () => {});
			expect(() => sut.register(trigger, () => {})).to.throw();
			sut.unregister(trigger);
		});

		it('should trigger on time', done => {
			const currentTime = new Date();
			const inOneMinute = new Date(currentTime.getTime() + 60000);
			const sut = new TimeTriggerScheduler();
			const trigger = new TimeTrigger(inOneMinute.getHours(), inOneMinute.getMinutes(), [inOneMinute.getDay()]);
			sut.register(trigger, () => {
				const triggeredDate = new Date();
				expect(triggeredDate.getHours()).to.equal(inOneMinute.getHours());
				expect(triggeredDate.getMinutes()).to.equal(inOneMinute.getMinutes());
				done();
				sut.unregister(trigger);
			});
		}).timeout(70000);
	});

	describe('unregister', () => {
		it('throws on unregistering a not registered trigger', () => {
			const sut = new TimeTriggerScheduler();
			const trigger = new TimeTrigger(12, 30, [Weekday.Monday]);
			expect(() => sut.unregister(trigger)).to.throw();
		});

		it('should not call unregistered trigger', done => {
			const currentTime = new Date();
			const inOneMinute = new Date(currentTime.getTime() + 60000);
			const sut = new TimeTriggerScheduler();
			const trigger = new TimeTrigger(inOneMinute.getHours(), inOneMinute.getMinutes(), [inOneMinute.getDay()]);
			setTimeout(done, 69000);
			sut.register(trigger, () => {
				fail('Unregistered trigger should not be called');
			});
			sut.unregister(trigger);
		}).timeout(70000);
	});
});
