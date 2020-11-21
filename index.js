require('dotenv').config()

const process = require('process');


const SftpClient = require('./utils/sftpClient')

const event = new SftpClient()

const { logger } = require('./utils/logger')

// App - Expresss
const { app, io } = require('./app')

// MongoDB connection
const { connectDb } = require('./db/index') 



event.con.on("upload", function (data) {
  console.log("uploading....")
  const updatedTournament = data.tournament.map((game, i) => ({
    ...game, pgns: game.pgns.map((pgn, x) => {
      return pgn.replace(data.tournament[i].pgns[x - 1], '').trim()
    })
  }))
  io.sockets.emit("get_data", updatedTournament)
});

event.con.on("error", function (data) {
	console.log(data.toString())
});


process.on('SIGINT', function onSigint() {
  app.shutdown();
});

process.on('SIGTERM', function onSigterm() {
  app.shutdown();
});

connectDb().then(async () => {
  app.listen(process.env.PORT || 4003, () => logger.info(`<<< Listening on port ${process.env.PORT} >>>`));
});
