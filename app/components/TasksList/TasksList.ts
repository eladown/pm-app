import {Component, Injectable} from '@angular/core';
import {TasksService, ITask} from '../../services/TasksService';
import {SelectedTaskService} from '../../services/SelectedTaskService';
import {TasksListItem} from './TasksListItem';
import {RadioMenu} from '../RadioMenu';
import {IGeneralListItem} from '../../interfaces/IGeneralListItem';
import {FilterTasks, filterTasksType} from '../../pipes/FilterTasks';

@Component({
    selector: 'tasks-list',
    directives: [TasksListItem, RadioMenu],
    pipes: [FilterTasks],
    template: `
        <radio-menu [list]="listMenu"
                    (onSelect)="filterTasks($event)"></radio-menu>
        <div class="tasks-list">
            <tasks-list-item [task]="task"
                             *ngFor="let task of tasks | filterTasks: filterType">
            </tasks-list-item>
        </div>
        <button class="btn btn-default" (click)="addNewTask()">New Task</button>
    `,
})
@Injectable()
export class TasksList {
    private tasks: ITask[] = [];
    private tasksSubscription: any;
    private listMenu: IGeneralListItem[] = [];
    private filterType: filterTasksType;

    constructor(
        private TasksService: TasksService,
        private SelectedTaskService: SelectedTaskService
    ) {
        this.tasksSubscription = TasksService.tasks.subscribe(newTasks => {
            this.tasks = newTasks;
        });
        this.listMenu = [
            { id: filterTasksType.all, name: 'All'},
            { id: filterTasksType.active, name: 'Active' },
            { id: filterTasksType.completed, name: 'Completed' },
        ];
    }

    addNewTask(): void {
        this.SelectedTaskService.setNewTask();
    }

    filterTasks(filter: IGeneralListItem): void {
        this.filterType = filter.id;
    }

    ngOnInit(): void {
        this.TasksService.refreshTasks();
    }

    ngOnDestroy(): void {
        this.tasksSubscription.unsubscribe();
    }
}
