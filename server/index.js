'use strict';

let fs = require('fs');
const path = require('path');
const Hapi = require('hapi');
const inert = require('inert');
const chalk = require('chalk');
const hapiAuthJwt = require('hapi-auth-jwt2');
const bcrypt = require('bcrypt');
const DB = require('sqlite-crud');
const defaultDBPath = './pm-database/pm.db';
let cliDBPath = '';
let migrateDB = false;

// node ./server/index --db=e2e-test.db --migrate
process.argv.forEach((value) => {
    if (~value.indexOf('--db')) {
        const match = /--db=(\S+.db)$/.exec(value);
        if (match) {
            cliDBPath = match[1];
        }
    } else if (value === '--migrate') {
        migrateDB = true;
    }
});

let pathToTheDB = defaultDBPath;
if (cliDBPath) {
    pathToTheDB = cliDBPath;
} else {
    try {
        fs.lstatSync(pathToTheDB);
    } catch(e) {
        // If there is no default DB, then I assume that user has no access to the repository
        // and I will create new DB
        pathToTheDB = './pm.db';
        try {
            fs.lstatSync(pathToTheDB);
        } catch(e) {
            migrateDB = true;
        }
    }
}

DB.connectToDB(pathToTheDB);
if (migrateDB) {
    const migrationPath = 'server/models/migrations';
    console.log(chalk.yellow('[Migrating DB] ') + migrationPath);
    DB.migrate(migrationPath)
}

// Normalize a port into a number, string, or false.
function normalizePort(val) {
    let port = parseInt(val, 10);

    switch (true) {
        case (isNaN(port)):
            return val;
        case port >= 0:
            return port;
        default:
            return false;
    }
}

// Create a server with a host and port
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: path.join(__dirname, '../public')
            }
        }
    }
});

server.connection({
    host: 'localhost',
    port: normalizePort(process.env.PORT || 8000)
});

// inert provides new handler methods for serving static files and directories,
// as well as decorating the reply interface with a file method for serving file based resources.
server.register(inert, () => {});

/**
 * Authentication
 */
server.register(hapiAuthJwt, () => {});

// Generating secure key (base64, 256 random bytes)
// https://tonicdev.com/artemdemo/5736ead43ed13c11004bb76b
server.auth.strategy('jwt', 'jwt',{
    key: require('./secret').key,
    validateFunc: require('./auth').validate,
    verifyOptions: {
        ignoreExpiration: true,
        algorithms: ['HS256']
    }
});

server.auth.default('jwt');

/**
 * Routing
 */
// Dynamically include routes
// Function will recursively enter all directories and include all '*.js' files
let routerDirWalker = (dirPath) => {
    fs.readdirSync(dirPath).forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            routerDirWalker(path.join(dirPath, file))
        } else {
            let pathToRoute = '.' + path.sep + path.join(dirPath, file.split('.').shift());
            let routes = require(pathToRoute.replace(/\\/g,'/').replace('/server',''));
            for (var route in routes) {
                server.route(routes[route]);
            }
        }
    });
};
routerDirWalker('./server/routes');

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(chalk.yellow.bold('Server is running at: ') + chalk.cyan(server.info.uri));
});
