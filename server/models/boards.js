'use strict';

const chalk = require('chalk');
const moment = require('moment');
const Q = require('q');
const sessions = require('./sessions');
const DB = require('sqlite-crud');
const tableName = 'bards';

exports.getAll = (boardsData) => {
    const deferred = Q.defer();
    let boardsQuery = `SELECT boards.id, boards.title, boards.description FROM boards
                      INNER JOIN sessions ON sessions.user_id = boards.user_id
                      WHERE sessions.id = '${boardsData.tokenId}';`;

    DB.queryRows(boardsQuery)
        .then((boards) => {
            boards.forEach((data, index) => {
                boards[index]['tasks'] = [];
            });
            deferred.resolve(boards);
        }, () => {
            deferred.reject();
        });

    return deferred.promise;
};

exports.addNew = (newBoardData) => {
    const deferred = Q.defer();
    const now = moment(new Date());

    sessions.getSession({
        id: newBoardData.tokenId
    }).then((session) => {
        try {
            DB.insertRow(tableName, {
                title: newBoardData.payload.title,
                description: newBoardData.payload.description,
                added: now.format('YYYY-MM-DD HH:mm:ss'),
                updated: now.format('YYYY-MM-DD HH:mm:ss'),
                user_id: session.user_id
            }).then((result) => {
                deferred.resolve({
                    id: result.id,
                    added: now.format('YYYY-MM-DD HH:mm:ss'),
                    updated: now.format('YYYY-MM-DD HH:mm:ss')
                });
            }, (error) => {
                console.log(chalk.red.bold('[addNew Board error]'), error);
                deferred.reject();
            });
        } catch(error) {
            console.log(chalk.red.bold('[addNew Board error]'), error);
            deferred.reject();
        }
    }, () => deferred.reject());

    return deferred.promise;
};

exports.updateBoard = (boardData) => {
    const deferred = Q.defer();
    const now = moment(new Date());
    let updateData = {};
    let updateAllowed = true;

    if (!boardData.payload.id) {
        deferred.reject();
        console.log(chalk.red.bold('[updateBoard error]'), 'No boardData.payload.id in given task');
        return deferred.promise;
    }

    const allowedFields = ['title', 'description'];
    allowedFields.forEach((field) => {
        if (boardData.payload.hasOwnProperty(field)) {
            updateData[field] = boardData.payload[field];
        }
    });

    if (!updateAllowed) {
        deferred.reject();
        console.log(chalk.red.bold('[updateBoard error]'), 'No fields to update:', boardData.payload);
        return deferred.promise;
    }

    updateData['updated'] = now.format('YYYY-MM-DD HH:mm:ss');

    sessions.getSession({
        id: boardData.tokenId
    }).then((session) => {
        try {
            DB.updateRow(tableName, updateData, [{
                column: 'id',
                comparator: '=',
                value: boardData.payload.id
            },{
                column: 'user_id',
                comparator: '=',
                value: session.user_id
            }]).then(() => {
                deferred.resolve();
            }, (error) => {
                console.log(chalk.red.bold('[updateBoard error]'), error);
                deferred.reject();
            });
        } catch(error) {
            console.log(chalk.red.bold('[updateBoard error]'), error);
            deferred.reject();
        }
    }, () => deferred.reject());

    return deferred.promise;
};

exports.deleteBoard = (boardData) => {
    const deferred = Q.defer();

    if (!boardData.payload) {
        deferred.reject();
        console.log(chalk.red.bold('[deleteBoard error]'), 'No "id" in given task');
        return deferred.promise;
    }
    sessions.getSession({
        id: boardData.tokenId
    }).then((session) => {
        try {
            DB.deleteRows(tableName, [{
                column: 'id',
                comparator: '=',
                value: boardData.payload
            },{
                column: 'user_id',
                comparator: '=',
                value: session.user_id
            }]).then(() => {
                deferred.resolve();
            }, (error) => {
                console.log(chalk.red.bold('[deleteBoard error]'), error);
                deferred.reject();
            });
        } catch(error) {
            console.log(chalk.red.bold('[deleteBoard error]'), error);
            deferred.reject();
        }
    }, () => deferred.reject());


    return deferred.promise;
};