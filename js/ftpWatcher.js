const { tournamentMaker } = require('./tournamentMaker')

const fileWatcher = function(sftp, folder, event) {
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
                                        let sourceFile = sftp.createReadStream(folder + '/' + fileObj.filename)
                                        sourceFile.on('data', (data) => {
                                                                 
                                            // Split games into an array
                                            let games = data.toString().split('[Event')
                                            splitGames = games.map(game => '[Event' + game)
                                            splitGames.shift()
                                            
                                            // Create a tournament array with all the games
                                            const tournament = tournamentMaker(splitGames)                                             
                                                    
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
                                    folder: folder,
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

module.exports = {
    fileWatcher
}