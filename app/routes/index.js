const program = require('./program.route');
const formsHandler = require('./formsHandler.route');
const users = require('./users.route');
const organization = require('./organization.route');
const controlHandler = require('./controlsHandler');
module.exports = {
    program,
    organization,
    users,
    formsHandler,
    controlHandler
}