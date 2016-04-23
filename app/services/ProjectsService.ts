import {Http, Headers} from 'angular2/http';
import {Subject} from 'rxjs';
import {Injectable, Inject} from 'angular2/core';

export interface IProject {
    id: number;
    name: string;
    description: string;
    added: string;
    updated: string;
}

export interface IProjectService {
    projects: Subject<IProject[]>;
    addProject(project: IProject): Promise<{}>;
    updateProject(project: IProject): Promise<{}>;
    deleteProject(projectId: number): Promise<{}>;
    refreshProjects(): void;
}

// Model for form
export class Project {
    public name: string;
    public description: string;

    constructor(newProject: IProject){
        this.name = newProject.name;
        this.description = newProject.description;
    }
}

@Injectable()
export class ProjectService implements IProjectService {
    public projects: Subject<IProject[]> = new Subject<IProject[]>();
    private _projects: IProject[] = [];

    constructor(@Inject(Http) private Http) {
        this.loadProjects();
    }
    
    loadProjects() {
        this.Http.get('/projects/all')
            .subscribe((res) => {
                this._projects = res.json();
                this.refreshProjects();
            });
    }
    
    addProject(project: IProject): Promise<{}> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return new Promise((resolve, reject) => {
            this.Http.post('/projects', JSON.stringify(project), {
                headers: headers
            }).subscribe((res) => {
                this._projects.push(Object.assign(project, res.json()));
                this.refreshProjects();
                resolve();
            }, () => {
                reject();
            });
        });
    }
    
    updateProject(project: IProject): Promise<{}> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return new Promise((resolve, reject) => {
            this.Http.put('/projects', JSON.stringify(project), {
                headers: headers
            }).subscribe((res) => {
                let updated = false;
                for (var i = 0, len = this._projects.length; i < len; i++) {
                    if (this._projects[i].id == project.id) {
                        this._projects[i] = project;
                        this.refreshProjects();
                        updated = true;
                        resolve();
                        break;
                    }
                }
                if (!updated) {
                    reject();
                }
            }, () => {
                reject();
            });
        });
    }
    
    deleteProject(projectId: number): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.Http.delete(`/projects/${projectId}`).subscribe((res) => {
                let deleted = false;
                for (var i = this._projects.length - 1; i >= 0; i--) {
                    if (this._projects[i].id == projectId) {
                        this._projects.splice(i, 1);
                        this.refreshProjects();
                        resolve();
                        deleted = true;
                        break;
                    }
                }
                if (!deleted) {
                    reject();
                }
            }, () => {
                reject();
            });
        });
    }    
    
    refreshProjects() {
        this.projects.next(this._projects);
    }
}