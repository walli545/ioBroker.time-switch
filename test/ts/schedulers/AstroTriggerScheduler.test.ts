import * as TypeMoq from 'typemoq';
import { It, Times } from 'typemoq';
import { AstroTriggerScheduler } from '../../../src/scheduler/AstroTriggerScheduler';
import { Coordinate } from '../../../src/Coordinate';
import { TimeTriggerScheduler } from '../../../src/scheduler/TimeTriggerScheduler';
import { GetTimesResult } from 'suncalc';
import { TimeTrigger } from '../../../src/triggers/TimeTrigger';
import { expect } from 'chai';
import { AllWeekdays, Weekday } from '../../../src/triggers/Weekday';
import { AstroTime } from '../../../src/triggers/AstroTime';
import { AstroTrigger } from '../../../src/triggers/AstroTrigger';
import { Action } from '../../../src/actions/Action';
import { AstroTriggerBuilder } from '../../../src/triggers/AstroTriggerBuilder';

describe('AstroTriggerScheduler', () => {
	let sut: AstroTriggerScheduler;
	let timeTriggerScheduler: TypeMoq.IMock<TimeTriggerScheduler>;
	let getTimesMock: TypeMoq.IMock<(date: Date, latitude: number, longitude: number) => GetTimesResult>;
	let actionMock: TypeMoq.IMock<Action>;
	const coordinate = new Coordinate(30, 50);

	beforeEach(() => {
		timeTriggerScheduler = TypeMoq.Mock.ofType<TimeTriggerScheduler>();
		getTimesMock = TypeMoq.Mock.ofType<(date: Date, latitude: number, longitude: number) => GetTimesResult>();
		sut = new AstroTriggerScheduler(timeTriggerScheduler.object, getTimesMock.object, coordinate);
		actionMock = TypeMoq.Mock.ofType<Action>();
		timeTriggerScheduler.reset();
	});

	it('forType is AstroTrigger', () => {
		expect(sut.forType()).to.equal('AstroTrigger');
	});

	describe('register', () => {
		it('should schedule trigger if astro time is in the future', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 1);
			setupGetTimes(({ sunrise: sunriseDate } as any) as GetTimesResult);

			sut.register(
				new AstroTriggerBuilder()
					.setId('1')
					.setAstroTime(AstroTime.Sunrise)
					.setShift(0)
					.setWeekdays(AllWeekdays)
					.setAction(actionMock.object)
					.build(),
			);

			getTimesMock.verify(g => g(It.isAny(), It.isAny(), It.isAny()), Times.once());
			verifyRegisterTimeTrigger(
				sunriseDate.getHours(),
				sunriseDate.getMinutes(),
				[sunriseDate.getDay()],
				'TimeTriggerForAstroTrigger:1',
			);
		});

		it('should schedule trigger if astro time is in the future (with positive shift)', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 1);
			setupGetTimes(({ sunrise: new Date(sunriseDate) } as any) as GetTimesResult);

			sut.register(
				new AstroTriggerBuilder()
					.setId('1')
					.setAstroTime(AstroTime.Sunrise)
					.setShift(20)
					.setWeekdays(AllWeekdays)
					.setAction(actionMock.object)
					.build(),
			);

			getTimesMock.verify(g => g(It.isAny(), It.isAny(), It.isAny()), Times.once());
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 20);
			verifyRegisterTimeTrigger(
				sunriseDate.getHours(),
				sunriseDate.getMinutes(),
				[sunriseDate.getDay()],
				'TimeTriggerForAstroTrigger:1',
			);
		});

		it('should schedule trigger if astro time is in the future (with negative shift)', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 35);
			setupGetTimes(({ sunrise: new Date(sunriseDate) } as any) as GetTimesResult);

			sut.register(
				new AstroTriggerBuilder()
					.setId('1')
					.setAstroTime(AstroTime.Sunrise)
					.setShift(-33)
					.setWeekdays(AllWeekdays)
					.setAction(actionMock.object)
					.build(),
			);

			getTimesMock.verify(g => g(It.isAny(), It.isAny(), It.isAny()), Times.once());
			sunriseDate.setMinutes(sunriseDate.getMinutes() - 33);
			verifyRegisterTimeTrigger(
				sunriseDate.getHours(),
				sunriseDate.getMinutes(),
				[sunriseDate.getDay()],
				'TimeTriggerForAstroTrigger:1',
			);
		});

		it('should call actions execute() when scheduled time trigger is executed', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 1);
			setupGetTimes(({ sunrise: new Date(sunriseDate) } as any) as GetTimesResult);

			sut.register(
				new AstroTriggerBuilder()
					.setId('1')
					.setAstroTime(AstroTime.Sunrise)
					.setWeekdays(AllWeekdays)
					.setAction(actionMock.object)
					.build(),
			);
			timeTriggerScheduler.verify(
				s =>
					s.register(
						It.is<TimeTrigger>(t => {
							t.getAction().execute();
							actionMock.verify(a => a.execute(), Times.once());
							return true;
						}),
					),
				Times.once(),
			);
		});

		it('should not schedule trigger if astro time is in the past', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() - 1);
			setupGetTimes(({ sunrise: sunriseDate } as any) as GetTimesResult);

			sut.register(
				new AstroTriggerBuilder()
					.setId('1')
					.setAstroTime(AstroTime.Sunrise)
					.setShift(0)
					.setWeekdays(AllWeekdays)
					.setAction(actionMock.object)
					.build(),
			);

			getTimesMock.verify(g => g(It.isAny(), It.isAny(), It.isAny()), Times.once());
			timeTriggerScheduler.verify(s => s.register(It.isAny()), Times.never());
		});

		it('should not schedule trigger if astro time is in the past (due to negative shift)', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 1);
			setupGetTimes(({ sunrise: sunriseDate } as any) as GetTimesResult);

			sut.register(
				new AstroTriggerBuilder()
					.setId('1')
					.setAstroTime(AstroTime.Sunrise)
					.setShift(-120)
					.setWeekdays(AllWeekdays)
					.setAction(actionMock.object)
					.build(),
			);

			getTimesMock.verify(g => g(It.isAny(), It.isAny(), It.isAny()), Times.once());
			timeTriggerScheduler.verify(s => s.register(It.isAny()), Times.never());
		});

		it('should not schedule trigger if today is not in weekdays', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() - 1);
			setupGetTimes(({ sunrise: sunriseDate } as any) as GetTimesResult);

			sut.register(
				new AstroTriggerBuilder()
					.setId('1')
					.setAstroTime(AstroTime.Sunrise)
					.setShift(0)
					.setWeekdays(AllWeekdays.filter(w => w !== sunriseDate.getDay()))
					.setAction(actionMock.object)
					.build(),
			);

			getTimesMock.verify(g => g(It.isAny(), It.isAny(), It.isAny()), Times.once());
			timeTriggerScheduler.verify(s => s.register(It.isAny()), Times.never());
		});

		it('throws when trigger is already registered', () => {
			setupGetTimes(({ sunrise: new Date() } as any) as GetTimesResult);
			const trigger = new AstroTriggerBuilder()
				.setId('1')
				.setAstroTime(AstroTime.Sunrise)
				.setShift(0)
				.setWeekdays(AllWeekdays)
				.setAction(actionMock.object)
				.build();
			sut.register(trigger);
			expect(() => sut.register(trigger)).to.throw();
		});
	});

	describe('unregister', () => {
		it('throws when not registered', () => {
			const trigger = new AstroTriggerBuilder()
				.setId('1')
				.setWeekdays(AllWeekdays)
				.setAction(actionMock.object)
				.setAstroTime(AstroTime.Sunrise)
				.build();
			expect(() => sut.unregister(trigger)).to.throw();
		});

		it('should unregister scheduled time trigger for today', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 1);
			setupGetTimes(({ sunrise: sunriseDate } as any) as GetTimesResult);
			const trigger = new AstroTriggerBuilder()
				.setId('1')
				.setAstroTime(AstroTime.Sunrise)
				.setShift(0)
				.setWeekdays(AllWeekdays)
				.setAction(actionMock.object)
				.build();
			sut.register(trigger);
			getTimesMock.reset();
			timeTriggerScheduler.reset();

			sut.unregister(trigger);

			timeTriggerScheduler.verify(
				t =>
					t.unregister(
						It.is<TimeTrigger>(t => {
							expect(t.getHour()).to.equal(sunriseDate.getHours());
							expect(t.getMinute()).to.equal(sunriseDate.getMinutes());
							expect(t.getWeekdays()).to.deep.equal([sunriseDate.getDay()]);
							expect(t.getId()).to.equal('TimeTriggerForAstroTrigger:1');
							return true;
						}),
					),
				Times.once(),
			);
			timeTriggerScheduler.verify(t => t.unregister(It.isAny()), Times.once());
		});

		it('should keep other scheduled triggers', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 1);
			const sunsetDate = new Date(sunriseDate);
			sunsetDate.setMinutes(sunsetDate.getMinutes() + 1);
			setupGetTimes(({ sunrise: sunriseDate, sunset: sunsetDate } as any) as GetTimesResult);
			const trigger1 = new AstroTriggerBuilder()
				.setId('1')
				.setAstroTime(AstroTime.Sunrise)
				.setShift(0)
				.setWeekdays(AllWeekdays)
				.setAction(actionMock.object)
				.build();
			const trigger2 = new AstroTriggerBuilder()
				.setId('2')
				.setAstroTime(AstroTime.Sunset)
				.setShift(0)
				.setWeekdays(AllWeekdays)
				.setAction(actionMock.object)
				.build();
			sut.register(trigger1);
			sut.register(trigger2);
			getTimesMock.reset();
			timeTriggerScheduler.reset();

			sut.unregister(trigger1);

			timeTriggerScheduler.verify(
				t =>
					t.unregister(
						It.is<TimeTrigger>(t => {
							expect(t.getHour()).to.equal(sunriseDate.getHours());
							expect(t.getMinute()).to.equal(sunriseDate.getMinutes());
							expect(t.getWeekdays()).to.deep.equal([sunriseDate.getDay()]);
							expect(t.getId()).to.equal('TimeTriggerForAstroTrigger:1');
							return true;
						}),
					),
				Times.once(),
			);
			timeTriggerScheduler.verify(t => t.unregister(It.isAny()), Times.once());
		});

		it('should not unregister time trigger when not scheduled for today', () => {
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() - 1);
			setupGetTimes(({ sunrise: sunriseDate } as any) as GetTimesResult);
			const trigger = new AstroTriggerBuilder()
				.setId('1')
				.setAstroTime(AstroTime.Sunrise)
				.setShift(0)
				.setWeekdays(AllWeekdays)
				.setAction(actionMock.object)
				.build();
			sut.register(trigger);
			getTimesMock.reset();
			timeTriggerScheduler.reset();

			sut.unregister(trigger);

			timeTriggerScheduler.verify(t => t.unregister(It.isAny()), Times.never());
		});
	});

	describe('destroy', () => {
		it('should destroy time trigger scheduler', () => {
			sut.destroy();
			timeTriggerScheduler.verify(s => s.destroy(), Times.once());
		});
	});

	describe('reschedule', () => {
		it('registers reschedule on 00:00', () => {
			timeTriggerScheduler.reset();
			sut = new AstroTriggerScheduler(timeTriggerScheduler.object, getTimesMock.object, coordinate);
			timeTriggerScheduler.verify(
				s =>
					s.register(
						It.is<TimeTrigger>(t => {
							expect(t.getHour()).to.equal(0);
							expect(t.getMinute()).to.equal(0);
							expect(t.getWeekdays()).to.deep.equal(AllWeekdays);
							expect(t.getId()).to.equal('AstroTriggerScheduler-Rescheduler');
							return true;
						}),
					),
				Times.once(),
			);
			timeTriggerScheduler.verify(s => s.register(It.isAny()), Times.once());
		});

		it('should unregister scheduled triggers from yesterday', () => {
			let rescheduleAction: Action;
			timeTriggerScheduler
				.setup(s => s.register(It.is(t => t.getId() === 'AstroTriggerScheduler-Rescheduler')))
				.callback((t: TimeTrigger) => {
					if (!rescheduleAction) {
						rescheduleAction = t.getAction();
					}
				});
			const sunriseDate = new Date();
			sunriseDate.setMinutes(sunriseDate.getMinutes() + 1);
			setupGetTimes(({ sunrise: sunriseDate } as any) as GetTimesResult);
			const trigger = new AstroTriggerBuilder()
				.setId('1')
				.setAstroTime(AstroTime.Sunrise)
				.setShift(0)
				.setWeekdays(AllWeekdays)
				.setAction(actionMock.object)
				.build();

			sut = new AstroTriggerScheduler(timeTriggerScheduler.object, getTimesMock.object, coordinate);
			sut.register(trigger);
			timeTriggerScheduler.reset();

			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			rescheduleAction.execute();

			verifyUnRegisterTimeTrigger(
				sunriseDate.getHours(),
				sunriseDate.getMinutes(),
				[sunriseDate.getDay()],
				`TimeTriggerForAstroTrigger:${trigger.getId()}`,
			);
			timeTriggerScheduler.verify(s => s.unregister(It.isAny()), Times.once());
		});
	});

	function setupGetTimes(result: GetTimesResult) {
		getTimesMock
			.setup(g =>
				g(
					It.is<Date>(d => verifyDate(d, new Date())),
					It.isValue(coordinate.getLatitude()),
					It.isValue(coordinate.getLongitude()),
				),
			)
			.returns(_ => result);
	}

	function verifyRegisterTimeTrigger(hour: number, minute: number, weekdays: Weekday[], id: string) {
		console.log(`wanting to verify: hour(${hour}) minute(${minute} weekdays(${weekdays}) id(${id})`);
		timeTriggerScheduler.verify(
			s =>
				s.register(
					It.is<TimeTrigger>(t => {
						return (
							t.getHour() === hour &&
							t.getMinute() === minute &&
							t.getWeekdays().length === weekdays.length &&
							t.getWeekdays().every(w => weekdays.indexOf(w) !== -1) &&
							t.getId() === id
						);
					}),
				),
			Times.once(),
		);
	}

	function verifyUnRegisterTimeTrigger(hour: number, minute: number, weekdays: Weekday[], id: string) {
		timeTriggerScheduler.verify(
			s =>
				s.unregister(
					It.is<TimeTrigger>(t => {
						return (
							t.getHour() === hour &&
							t.getMinute() === minute &&
							t.getWeekdays().length === weekdays.length &&
							t.getWeekdays().every(w => weekdays.indexOf(w) !== -1) &&
							t.getId() === id
						);
					}),
				),
			Times.once(),
		);
	}

	function verifyDate(have: Date, expected: Date): boolean {
		expect(have.getHours()).to.equal(expected.getHours());
		expect(have.getDay()).to.equal(expected.getDay());
		expect(have.getMinutes()).to.equal(expected.getMinutes());
		expect(have.getFullYear()).to.equal(expected.getFullYear());
		return true;
	}
});
