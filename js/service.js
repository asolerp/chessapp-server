let EventEmitter = require('events').EventEmitter,
    Client = require('ssh2').Client;


const { fileWatcher } = require('./ftpWatcher')

module.exports = function(config) {
    let event = new EventEmitter()
    let timeinterval

    event.on("stop", function() {
        clearInterval(timeinterval);
        event.emit("close", "SFTP watcher stopped");
    });

    if (!config.host && !config.username) {
        event.emit("error", "Invalid input");
    } else {
        event.emit('heartbeat', true);
        let conn = new Client();
        conn.on('ready', function() {
            conn.sftp(function(err, sftp) {
                if (err) {
                    event.emit('error', err.message || err);
                } else {
                    event.emit('connected', true);
                    fileWatcher(sftp, config.path, event);
                }
            });
        }).on('error', function(err) {
            event.emit('error', err.message || err);
        }).connect(config);
    };
    return event;
};