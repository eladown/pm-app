import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { browserHistory } from 'react-router';
import thunk from 'redux-thunk';

import tasks from './reducers/tasks';
import projects from './reducers/projects';
import user from './reducers/user';
import notification from './reducers/notification';

const pmApp = combineReducers({
    tasks,
    user,
    projects,
    notification,
    routing: routerReducer
});

export const store = createStore(pmApp, applyMiddleware(thunk));

export const history = syncHistoryWithStore(browserHistory, store);