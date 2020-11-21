const { Chess } = require('chess.js')

const tournamentMaker = (games) => {

    let tournament = []
    
    games.forEach(game => {

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
    
    return tournament

}

module.exports = {
  tournamentMaker
}