new Vue ({
    el: "#app",
    data: {
        gameInfo: [],
        errorMessage: null,
        ships: [],
        salvoes: [],
        rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        columns: ["", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        playerId: null,
        gamePlayerId: null,
        shipTypes: [{name: "Carrier", length: 5},
                    {name: "Battleship", length: 4},
                    {name: "Submarine", length: 3},
                    {name: "Destroyer", length: 3},
                    {name: "Patrol Boat", length: 2}],
        shipInProcess: {},
        currentShipPositions: []
    },

    mounted() {
      this.initParams()
      this.getCurrentPlayerId();
    },

    computed: {
    board() {
      let array = [];
      for (let i = 0; i < this.rows.length; i++) {
        let object = { rowId: this.rows[i], column: [] };
        for (let j = 1; j < this.columns.length; j++) {
          let anotherObject = {
            columnId: this.columns[j],
            ship: this.getShipCells(this.rows[i] + this.columns[j]),
            mySalvoes: this.getMySalvoCell(this.rows[i] + this.columns[j]),
            oponentSalvoes: this.getOponentSalvoes(
              this.rows[i] + this.columns[j]
            ),
            salvoTurn: this.getTurn(this.rows[i] + this.columns[j])
          };
          object.column.push(anotherObject);
        }
        array.push(object);
      }
      return array;
    }
    },

    methods: {
    initParams() {
      let url = new URL(window.location.href);
      this.gamePlayerId = url.searchParams.get("gp");
    },
    getCurrentPlayerId() {
      axios
        .get("/api/games")
        .then(response => {
            if(response.data.player.id != null) {
              this.playerId = response.data.player.id;
              this.getGameInfo()
            }
        })
        .catch(error => console.log(error));
    },

    getGameInfo() {
      axios
        .get("http://localhost:8080/api/game_view/" + this.gamePlayerId)
        .then(response => {
            this.gameInfo = response.data;
            this.ships = this.gameInfo.ships;
            this.salvoes = this.gameInfo.salvoes;
        })
        .catch(error => {
            this.errorMessage = error.response.data.error;
        })
    },
    getShipCells(coordinate) {
      for (let i = 0; i < this.ships.length; i++) {
        if (this.ships[i].locations.includes(coordinate)) {
          return true;
        }
      }
      return false;
    },
    getMySalvoCell(coordinate) {
      for (let i = 0; i < this.salvoes.length; i++) {
        if (
          this.salvoes[i].player === this.playerId &&
          this.salvoes[i].locations.includes(coordinate)
        ) {
          return true;
        }
      }
      return false;
    },
    getOponentSalvoes(coordinate) {
      for (let i = 0; i < this.salvoes.length; i++) {
        if (
          this.salvoes[i].player != this.playerId &&
          this.salvoes[i].locations.includes(coordinate)
        ) {
          return true;
        }
      }
      return false;
    },
    getTurn(coordinate) {
      for (let i = 0; i < this.salvoes.length; i++) {
        if (this.salvoes[i].locations.includes(coordinate)) {
          return this.salvoes[i].turn;
        }
      }
      return null;
    },
    logOut() {
      fetch("/api/logout", {
        credentials: "include",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then(window.location.replace("/web/games.html"));
    },

    showErrorMessage() {
        alert("You have no permission")
    },

    addShips () {
        fetch ('/games/players/' + this.gamePlayerId + '/ships', {
            credentials: "include",
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify([{shipType: "test", shipLocations: ["A1", "A2"]}])
        })
        .then (response => this.getGameInfo())
        .catch (error => console.log(error))
    },

    getPossibleShipPosition(a, b, shipLength) {
            for (let i = 0; i < this.currentShipPositions.length; i ++) {
                document.getElementById(this.currentShipPositions[i]).style.backgroundColor = "white"
            }
            this.currentShipPositions = []
        for (let i = 0; i < shipLength; i ++) {
            let start = a
            let end = parseInt(b + i)
            if (end > 10) {
                end = 10
            } else if (start < 1) {
                start = 1
            }
            let coordinate = start + end
            this.currentShipPositions[i] = coordinate
        }
        for (let i = 0; i < this.currentShipPositions.length; i ++) {
            document.getElementById(this.currentShipPositions[i]).style.backgroundColor = "yellow"
        }
        console.log(this.currentShipPositions)
    },

    getShipInProcess (shipName, shipLength) {
        this.shipInProcess = { name:  shipName,
                               length:  shipLength }
         console.log(this.shipInProcess)
         return this.shipInProcess
    }
}
})