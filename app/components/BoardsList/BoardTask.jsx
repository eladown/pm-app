import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'underscore';
import moment from 'moment';
import emoji from '../../utils/emoji/emoji';
import { filterProjects } from '../../utils/tasks';
import { LabelsList } from '../LabelsList/LabelsList';
import * as taskConst from '../../constants/tasks';
import { setDraggedTask, dropDraggedTask, setDraggedTaskDropPosition } from '../../actions/draggedTask';
import { updateDraggedTaskPosition } from '../../actions/tasks';
import { selectTask } from '../../actions/selectedEntity';

import './BoardTask.less';

class BoardTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            renderPlaceholder: false,
        };

        this.dropPlaceholderTimeoutId = null;

        this.dragStart = (e) => {
            const { task, setDraggedTask } = this.props;

            // dragged task can't be set right after dragging started,
            // case it will trigger "display: none;" style and as a result it will stop dragging from happening
            setTimeout(() => {
                setDraggedTask(task);
            }, 50);

            e.dataTransfer.effectAllowed = 'move';

            // Firefox requires calling dataTransfer.setData
            // for the drag to properly work
            e.dataTransfer.setData('text/html', e.currentTarget);
        };

        this.dragEnd = () => {
            const { draggedTask, dropDraggedTask, updateDraggedTaskPosition } = this.props;

            updateDraggedTaskPosition(draggedTask);
            dropDraggedTask();
        };

        const { setDraggedTaskDropPosition } = this.props;
        const _setDraggedTaskDropPosition = _.debounce(setDraggedTaskDropPosition, 20);

        this.dragOver = (e) => {
            e.stopPropagation();
            clearTimeout(this.dropPlaceholderTimeoutId);
            this.dropPlaceholderTimeoutId = setTimeout(() => {
                this.setState({
                    renderPlaceholder: false,
                });
            }, 70);

            if (e.target.className.indexOf('board-task_placeholder') > -1) return;

            const { task } = this.props;
            const relY = e.clientY - e.target.offsetTop;
            const height = e.target.offsetHeight / 2;
            const position = relY > height ? 'after' : 'before';
            _setDraggedTaskDropPosition(task.id, position, task.board_id);

            this.setState({
                renderPlaceholder: position,
            });
        };

        this.openTask = () => {
            const { task, selectTask } = this.props;
            selectTask(task);
        };
    }

    render() {
        const { task, projects, draggedTask } = this.props;
        const { selectedProjects } = filterProjects(task, projects);
        const taskWrapClass = classnames({
            'board-task-wrap': true,
            'board-task-wrap_is-dragged': draggedTask && draggedTask.task && draggedTask.task.id === task.id,
        });

        // `position` can be `before` or `after`
        const renderPlaceholder = (position) => {
            if (this.state.renderPlaceholder === position) {
                const placeholderClass = classnames({
                    'board-task_placeholder': true,
                    [`board-task_placeholder__${position}`]: true,
                });
                return (
                    <div className={placeholderClass}></div>
                );
            }
            return null;
        };

        const renderSP = () => {
            if (task.sp > 0) {
                return (
                    <div className='board-task-description__item'>
                        SP: {task.sp}
                    </div>
                );
            }
            return null;
        };

        const renderDue = () => {
            if (task.due && task.due !== '') {
                return (
                    <div className='board-task-description__item'>
                        <span className='glyphicon glyphicon-calendar'></span>
                        {moment(task.due, taskConst.DUE_BASE_TIME_FORMAT).format('MMM, D')}
                    </div>
                );
            }
            return null;
        };

        return (
            <div className={taskWrapClass}
                 onDragOver={this.dragOver}>
                {renderPlaceholder('before')}
                <div className='board-task'
                     draggable='true'
                     onClick={this.openTask}
                     onDragOver={this.dragOver}
                     onDragStart={this.dragStart}
                     onDragEnd={this.dragEnd}>
                    <div className='board-task__menu-icon'>
                        <span className='glyphicon glyphicon-option-vertical'
                              aria-hidden='true'></span>
                    </div>
                    {emoji(task.name)}
                    <div className='board-task-description
                                    text-muted'>
                        {renderSP()}
                        {renderDue()}
                    </div>
                    <div className='board-task__labels-list'>
                        <LabelsList list={selectedProjects}
                                    delitable={false} />
                    </div>
                </div>
                {renderPlaceholder('after')}
            </div>
        );
    }
}

BoardTask.proptypes = {
    task: React.PropTypes.object,
};

export default connect(
    state => {
        return {
            tasks: state.tasks,
            projects: state.projects,
            draggedTask: state.draggedTask,
        };
    }, {
        setDraggedTask,
        dropDraggedTask,
        setDraggedTaskDropPosition,
        updateDraggedTaskPosition,
        selectTask,
    }
)(BoardTask);
