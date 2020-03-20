"use strict";
// import {cancelJob, Job, scheduleJob} from 'node-schedule';
// import {AstroTimeService} from '../services/AstroTimeService';
// import {AstroTime} from '../triggers/AstroTime';
// import {AstroTrigger} from '../triggers/AstroTrigger';
// import {TriggerScheduler} from '../scheduler/TriggerScheduler';
// import {TimeTrigger} from '../triggers/TimeTrigger';
// import {Reschedulable} from './Reschedulable';
//
// export class AstroTriggerScheduler extends TriggerScheduler implements Reschedulable {
//
//     private registered: AstroTrigger[] = [];
//     private scheduledToday: [Job, AstroTrigger][] = [];
//
//     constructor(private astroTimeService: AstroTimeService) {
//         super();
//     }
//
//     public register(trigger: AstroTrigger): void {
//         if (this.isRegistered(trigger)) {
//             throw new Error('Trigger is already registered.');
//         }
//
//         this.registered.push(trigger);
//     }
//
//     public unregister(trigger: AstroTrigger): void {
//         if(this.isRegistered(trigger)) {
//             const job = this.scheduledToday.find(s => s[1] === trigger)
//             if () {
//                 cancelJob()
//             }
//         } else {
//             throw new Error('Trigger is not registered.');
//         }
//     }
//
//     public rescheduleAll(): void {
//         this.unscheduleTodaysTriggers();
//
//         this.registered.forEach((trigger: AstroTrigger) => {
//             this.scheduleTriggerForToday(trigger);
//         });
//     }
//
//     private scheduleTriggerForToday(trigger: AstroTrigger) {
//         if (this.isLaterToday(trigger)) {
//             const job = scheduleJob(this.astroTimeService.getTodaysTime(trigger.getAstroTime()), () => {
//                 trigger.trigger();
//             });
//             this.scheduledToday.push([job, trigger]);
//         }
//     }
//
//     private unscheduleTodaysTriggers() {
//         this.scheduledToday
//             .map(s => s[0])
//             .forEach((job: Job) => {
//                 cancelJob(job)
//             });
//     }
//
//     private isRegistered(trigger: AstroTrigger): boolean {
//         return this.registered.find(r => r === trigger) != undefined;
//     }
//
//     private isLaterToday(astroTrigger: AstroTrigger): boolean {
//         const now = new Date();
//         const triggerDate = this.astroTimeService.getTodaysTime(astroTrigger.getAstroTime());
//         return triggerDate > now && astroTrigger.getWeekdays().includes(now.getDay())
//     }
// }
