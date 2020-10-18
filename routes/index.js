const express = require("express");
const router = express.Router();
const { io } = require('./index')

router.get("/", (req, res) => {
  res.send({ response: "Chess App Server Ready 🎮" }).status(200);
});

router.get("/finalizar_torneo", (req, res) => {
  var io = req.app.get('socketio');
  io.sockets.emit("finish_torneo")
  res.send({ response: "Torneo finalizado 🎮" }).status(200);
});

module.exports = router;