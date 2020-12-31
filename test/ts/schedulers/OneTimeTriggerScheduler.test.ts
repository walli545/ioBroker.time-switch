import { expect } from 'chai';
import { Job, JobCallback } from 'node-schedule';
import * as TypeMoq from 'typemoq';
import { It, Times } from 'typemoq';
import { Action } from '../../../src/actions/Action';
import { OneTimeTriggerScheduler } from '../../../src/scheduler/OneTimeTriggerScheduler';
import { LoggingService } from '../../../src/services/LoggingService';
import { OneTimeTriggerBuilder } from '../../../src/triggers/OneTimeTriggerBuilder';

describe('OneTimeTriggerScheduler', function () {
	let action: TypeMoq.IMock<Action>;
	let logger: TypeMoq.IMock<LoggingService>;
	let scheduleJobMock: TypeMoq.IMock<(date: Date, callback: JobCallback) => Job>;
	let cancelJobMock: TypeMoq.IMock<(job: Job) => boolean>;
	let sut: OneTimeTriggerScheduler;

	beforeEach(() => {
		action = TypeMoq.Mock.ofType<Action>();
		logger = TypeMoq.Mock.ofType<LoggingService>();
		scheduleJobMock = TypeMoq.Mock.ofType<(date: Date, callback: JobCallback) => Job>();
		cancelJobMock = TypeMoq.Mock.ofType<(job: Job) => boolean>();
		sut = new OneTimeTriggerScheduler(scheduleJobMock.object, cancelJobMock.object, logger.object);
	});

	it('forType is OneTimeTrigger', () => {
		expect(sut.forType()).to.equal('OneTimeTrigger');
	});

	describe('register', function () {
		it('throws on registering same trigger twice', () => {
			setUpScheduleJobToReturnAJob();
			const trigger = new OneTimeTriggerBuilder()
				.setId('0')
				.setDate(getFutureDate())
				.setAction(action.object)
				.build();

			sut.register(trigger);
			expect(() => sut.register(trigger)).to.throw();
		});

		it('should schedule job on register', () => {
			setUpScheduleJobToReturnAJob();
			const date = getFutureDate();
			const trigger = new OneTimeTriggerBuilder().setId('0').setDate(date).setAction(action.object).build();
			sut.register(trigger);
			scheduleJobMock.verify(
				(s) =>
					s(
						It.is<Date>((d) => {
							expect(d.getTime()).to.equal(date.getTime());
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
			const trigger = new OneTimeTriggerBuilder()
				.setId('0')
				.setDate(getFutureDate())
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

		it('should destroy trigger with date in the past', () => {
			setUpScheduleJobToReturnAJob();
			const date = getFutureDate(-20);
			const onDestroyMock = TypeMoq.Mock.ofType<() => void>();
			const trigger = new OneTimeTriggerBuilder()
				.setId('0')
				.setDate(date)
				.setAction(action.object)
				.setOnDestroy(onDestroyMock.object)
				.build();
			sut.register(trigger);
			scheduleJobMock.verify((s) => s(It.isAny(), It.isAny()), Times.never());
			onDestroyMock.verify((m) => m(), Times.once());
		});
	});

	describe('unregister', () => {
		it('throws on unregistering a not registered trigger', () => {
			setUpScheduleJobToReturnAJob();
			const trigger = new OneTimeTriggerBuilder()
				.setId('0')
				.setDate(getFutureDate())
				.setAction(action.object)
				.build();
			expect(() => sut.unregister(trigger)).to.throw();
		});

		it('should cancel job on unregister', () => {
			const job = setUpScheduleJobToReturnAJob();
			const trigger = new OneTimeTriggerBuilder()
				.setId('0')
				.setDate(getFutureDate())
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
			const trigger1 = new OneTimeTriggerBuilder()
				.setId('0')
				.setDate(getFutureDate(10_000))
				.setAction(action.object)
				.build();
			sut.register(trigger1);
			const job2 = setUpScheduleJobToReturnAJob();
			const trigger2 = new OneTimeTriggerBuilder()
				.setId('1')
				.setDate(getFutureDate(20_000))
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

	function getFutureDate(plus?: number): Date {
		return new Date(new Date().getTime() + (plus ? plus : 1_000_000));
	}
});
