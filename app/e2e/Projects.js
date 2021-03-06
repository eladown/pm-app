/* eslint-disable strict*/
'use strict';

const helper = require('./services/helper');
const mainMenu = require('./services/mainMenu');
const auth = require('./suits/auth');

const getProjectName = (() => {
    const projects = {};
    return (projectId) => {
        if (!projects[projectId]) {
            projects[projectId] =
                `New Project - ${projectId} - ${helper.getRandomWord(4)} ${helper.getRandomWord(12)}`;
        }
        return projects[projectId];
    };
})();

const getProjectDescription = (() => {
    const projects = {};
    return (projectId) => {
        if (!projects[projectId]) {
            projects[projectId] =
                `Description - ${projectId} - ${helper.getRandomWord(8)} ${helper.getRandomWord(12)}`;
        }
        return projects[projectId];
    };
})();

const getProjectPath = (id, groupName = 'active') => {
    switch (true) {
        case id === 'first':
            return `.projects-list[data-qa=projects-list__${groupName}] .projects-list-item:first-of-type`;
        case id === 'last':
            return `.projects-list[data-qa=projects-list__${groupName}] .projects-list-item:last-of-type`;
    }
    return `.projects-list[data-qa=projects-list__${groupName}] .projects-list-item:nth-child(${id})`;
};

const getProjectNamePath = (id, groupName = 'active') => {
    return `${getProjectPath(id, groupName)} .projects-list-item__title`;
};

let projectIndex = 1;

module.exports = {
    'Add projects': (browser) => {
        auth.login(browser);

        browser.click(mainMenu.getMainMenuPath('projects'));

        for (; projectIndex < 4; projectIndex++) {
            browser
                .click('button[data-qa=new-project]')
                .setValue('.single-panel input[data-qa=project-name]', getProjectName(projectIndex))
                .setValue('.single-panel textarea[data-qa=project-description]', getProjectDescription(projectIndex))
                .click('.single-panel button[data-qa=project-save]')
                .pause(200)
                .assert.containsText(getProjectNamePath('first', 'other'), getProjectName(projectIndex));
        }

        browser.assert.cssClassNotPresent('.list-container', '.list-container_open-right-panel');
    },

    'Delete project': (browser) => {
        const newProjectName = 'Project to be deleted';

        browser
            .click('button[data-qa=new-project]')
            .setValue('.single-panel input[data-qa=project-name]', newProjectName)
            .click('.single-panel button[data-qa=project-save]')
            .pause(200)
            .assert.containsText(getProjectNamePath('first', 'other'), newProjectName)
            .click(getProjectPath('first', 'other'))
            .click('.single-panel span[data-qa=delete-button]')
            .click('.single-panel .delete-button .delete-button-buttons__ok')
            .pause(200)
            .assert.containsText(getProjectNamePath('first', 'other'), getProjectName(projectIndex - 1));
    },

    'Change project name and description': (browser) => {
        const newProjectName = 'Project - new name';
        const newProjectDescription = 'Project - new description';

        browser
            .click(getProjectPath('first', 'other'))
            .clearValue('.single-panel input[data-qa=project-name]')
            .setValue('.single-panel input[data-qa=project-name]', newProjectName)
            .clearValue('.single-panel textarea[data-qa=project-description]')
            .setValue('.single-panel textarea[data-qa=project-description]', newProjectDescription)
            .click('.single-panel button[data-qa=project-save]')
            .pause(200)
            .assert.containsText(getProjectNamePath('first', 'other'), newProjectName)
            .click(getProjectPath('first', 'other'))
            .assert.value('.single-panel input[data-qa=project-name]', newProjectName)
            .assert.value('.single-panel textarea[data-qa=project-description]', newProjectDescription);

        auth.logout(browser);
    },
};
