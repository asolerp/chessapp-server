let EventEmitter = require('events').EventEmitter,
    Client = require('ssh2').Client;

const { Chess } = require('chess.js')
const parser = require('@mliebelt/pgn-parser')
const pgnParser = require('pgn-parser');


module.exports = function(config) {
    let event = new EventEmitter(),
        timeinterval,
        fileWatcher;
    event.on("stop", function() {
        clearInterval(timeinterval);
        event.emit("close", "SFTP watcher stopped");
    });
    if (!config.host && !config.username) {
        //return "Invalid input";
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
                    fileWatcher(sftp, config.path);
                }
            });
        }).on('error', function(err) {
            event.emit('error', err.message || err);
        }).connect(config);
    };
    fileWatcher = function(sftp, folder) {
        let job = function(baseObjList) {
                folderObjList = {};
                sftp.readdir(folder, function(err, objList) {
                    if (err) {
                        event.emit('error', err.message || err);
                    } else {
                        if (baseObjList === null) {
                            objList.forEach(function(fileObj) {
                                folderObjList[fileObj.filename] = fileObj;
                            });
                        } else {
                            objList.forEach(function(fileObj) {
                                if (!baseObjList[fileObj.filename] || (baseObjList[fileObj.filename] && fileObj.attrs.size != baseObjList[fileObj.filename].attrs.size)) {
                                    fileObj.status = "uploading";
                                } else if (baseObjList[fileObj.filename].status == "uploading") {
                                    if (fileObj.attrs.size == baseObjList[fileObj.filename].attrs.size) {

                                        if (baseObjList[fileObj.filename].filename === 'games.pgn') {
                                        
                                            let sourceFile = sftp.createReadStream(config.path + '/' + fileObj.filename)
    
                                            sourceFile.on('data', (data) => {
    
                                                let tournament = []                                   
    
                                                let games = data.toString().split('[Event')
    
                                                splitGames = games.map(game => '[Event' + game)
    
                                                splitGames.shift()
                                         
                                                splitGames.forEach(game => {
    
                                                    let chess1 = new Chess
                                                    let chess2 = new Chess
                                                    let chess3 = new Chess 
    
                                                    let fens = []
                                                    let pgns = []
    
                                                    let pgn = game                 
    
                                                    chess1.load_pgn(pgn)
        
                                                    fens = chess1.history().map(move => {                                
                                                      chess2.move(move)                                    
                                                      return chess2.fen()
                                                    })
        
                                                    pgns = chess1.history().map(move => {
                                                      chess3.move(move)
                                                      return chess3.pgn()
                                                    })
                                                    
                                                    tournament.push({
                                                        headers: chess1.header(),
                                                        pgns: pgns,
                                                        match: fens
                                                    })
    
                                                })                
                                                          
                                                delete fileObj.status;
                                                event.emit("upload", {                                
                                                    tournament: tournament
                                                });
                                            })
                                        }

                                    }
                                }
                                folderObjList[fileObj.filename] = fileObj;
                            });


                        }
                        if (baseObjList && Object.keys(baseObjList).length != 0) {
                            Object.keys(baseObjList).forEach(function(filename) {
                                if (!folderObjList[filename]) {
                                    event.emit("delete", {
                                        host: config.host,
                                        user: config.username,
                                        folder: config.path,
                                        file: baseObjList[filename]
                                    });
                                }
                            });
                        }
                    }
                });
            },
            folderObjList = null;
        timeinterval = setInterval(function() {
            new job(JSON.parse(JSON.stringify(folderObjList)));
            event.emit('heartbeat', new Date());
        }, 500);

    };
    return event;
};