import { expect } from 'chai';
import { Job, JobCallback, RecurrenceRule } from 'node-schedule';
import * as TypeMoq from 'typemoq';
import { It, Times } from 'typemoq';
import { Action } from '../../../src/actions/Action';
import { TimeTriggerScheduler } from '../../../src/scheduler/TimeTriggerScheduler';
import { LoggingService } from '../../../src/services/LoggingService';
import { TimeTriggerBuilder } from '../../../src/triggers/TimeTriggerBuilder';
import { Weekday } from '../../../src/triggers/Weekday';

describe('TimeTriggerScheduler', () => {
	let action: TypeMoq.IMock<Action>;
	let logger: TypeMoq.IMock<LoggingService>;
	let scheduleJobMock: TypeMoq.IMock<(rule: RecurrenceRule, callback: JobCallback) => Job>;
	let cancelJobMock: TypeMoq.IMock<(job: Job) => boolean>;
	let sut: TimeTriggerScheduler;

	beforeEach(() => {
		action = TypeMoq.Mock.ofType<Action>();
		logger = TypeMoq.Mock.ofType<LoggingService>();
		scheduleJobMock = TypeMoq.Mock.ofType<(rule: RecurrenceRule, callback: JobCallback) => Job>();
		cancelJobMock = TypeMoq.Mock.ofType<(job: Job) => boolean>();
		sut = new TimeTriggerScheduler(scheduleJobMock.object, cancelJobMock.object, logger.object);
	});

	it('forType is TimeTrigger', () => {
		expect(sut.forType()).to.equal('TimeTrigger');
	});

	describe('register', () => {
		it('throws on registering same trigger twice', () => {
			setUpScheduleJobToReturnAJob();
			const trigger = new TimeTriggerBuilder()
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday])
				.setAction(action.object)
				.build();

			sut.register(trigger);
			expect(() => sut.register(trigger)).to.throw();
			sut.unregister(trigger);
		});

		it('should schedule job on register', () => {
			setUpScheduleJobToReturnAJob();
			const trigger = new TimeTriggerBuilder()
				.setHour(14)
				.setMinute(38)
				.setWeekdays([2, 5])
				.setAction(action.object)
				.build();
			sut.register(trigger);
			scheduleJobMock.verify(
				(s) =>
					s(
						It.is<RecurrenceRule>((r) => {
							expect(r.minute).to.equal(trigger.getMinute());
							expect(r.hour).to.equal(trigger.getHour());
							expect(r.dayOfWeek).to.deep.equal(trigger.getWeekdays());
							expect(r.second).to.equal(0);
							expect(r.year).to.be.null;
							expect(r.month).to.be.null;
							expect(r.date).to.be.null;
							return true;
						}),
						It.isAny(),
					),
				Times.once(),
			);
			scheduleJobMock.verify((s) => s(It.isAny(), It.isAny()), Times.once());
		});

		it('should call execute of action when on job callback', () => {
			setUpScheduleJobToReturnAJob();
			const trigger = new TimeTriggerBuilder()
				.setHour(11)
				.setMinute(58)
				.setWeekdays([1, 2])
				.setAction(action.object)
				.build();
			sut.register(trigger);
			scheduleJobMock.verify(
				(s) =>
					s(
						It.isAny(),
						It.is<JobCallback>((c) => {
							action.verify((a) => a.execute(), Times.never());
							c(new Date());
							action.verify((a) => a.execute(), Times.once());
							return true;
						}),
					),
				Times.once(),
			);
			scheduleJobMock.verify((s) => s(It.isAny(), It.isAny()), Times.once());
		});
	});

	describe('unregister', () => {
		it('throws on unregistering a not registered trigger', () => {
			setUpScheduleJobToReturnAJob();
			const trigger = new TimeTriggerBuilder()
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday])
				.setAction(action.object)
				.build();
			expect(() => sut.unregister(trigger)).to.throw();
		});

		it('should cancel job on unregister', () => {
			const job = setUpScheduleJobToReturnAJob();
			const trigger = new TimeTriggerBuilder()
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday])
				.setAction(action.object)
				.build();
			sut.register(trigger);
			sut.unregister(trigger);
			scheduleJobMock.verify((s) => s(It.isAny(), It.isAny()), Times.once());
			cancelJobMock.verify((c) => c(job), Times.once());
			cancelJobMock.verify((c) => c(It.isAny()), Times.once());
		});
	});

	describe('destroy', () => {
		it('should unregister all', () => {
			const job1 = setUpScheduleJobToReturnAJob();
			const trigger1 = new TimeTriggerBuilder()
				.setHour(12)
				.setMinute(30)
				.setWeekdays([Weekday.Monday])
				.setAction(action.object)
				.build();
			sut.register(trigger1);
			const job2 = setUpScheduleJobToReturnAJob();
			const trigger2 = new TimeTriggerBuilder()
				.setHour(8)
				.setMinute(17)
				.setWeekdays([Weekday.Thursday])
				.setAction(action.object)
				.build();
			sut.register(trigger2);

			sut.destroy();

			cancelJobMock.verify((c) => c(job1), Times.once());
			cancelJobMock.verify((c) => c(job2), Times.once());
			cancelJobMock.verify((c) => c(It.isAny()), Times.exactly(2));
		});
	});

	function setUpScheduleJobToReturnAJob(): Job {
		const job = TypeMoq.Mock.ofType<Job>().object;
		scheduleJobMock.setup((s) => s(It.isAny(), It.isAny())).returns((_) => job);
		return job;
	}
});
