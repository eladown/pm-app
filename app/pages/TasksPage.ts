import {Component, Injectable} from '@angular/core';
import {TasksList} from '../components/TasksList/TasksList';
import {SingleTask} from '../components/TasksList/SingleTask';
import {SelectedTaskService} from '../services/SelectedTaskService';

@Component({
    selector: 'tasks-page',
    directives: [TasksList, SingleTask],
    template: `
        <div class="list-container"
             [ngClass]="{'list-container_open-right-panel' : openSingleTask}">
            <div class="list-container__list">
                <tasks-list></tasks-list>
            </div>
            <div class="list-container__panel">
                <single-task></single-task>
            </div>
        </div>
    `,
})
@Injectable()
export class TasksPage {
    private openSingleTask: boolean = false;
    private taskSubscription: any;

    constructor(
        private SelectedTaskService: SelectedTaskService
    ) {
        this.taskSubscription = SelectedTaskService.task.subscribe(newTask => {
            this.openSingleTask = !!newTask;
        });
    }

    ngOnDestroy(): void {
        this.taskSubscription.unsubscribe();
    }
}
