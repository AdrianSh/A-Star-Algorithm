class Menu {
    constructor(menuSelectedCallBack) {
        this.menuSelectedCallBack = menuSelectedCallBack;
        this.terrains = [
            { awkwardness: 1.00, color: "#6DBF50", name: "ground" },
            { awkwardness: 0.75, color: "#1F7F3A", name: "forest" },
            { awkwardness: 0.50, color: "#6FD1FF", name: "water" },
            { awkwardness: 0.10, color: "#2B427D", name: "deep_water" },
            { awkwardness: 0.00, color: "#26221E", name: "wall" },
            { awkwardness: 0.90, color: "#76421E", name: "bridge" }];
        this.menuOptions = $("#options");
        this.menuOptions.show();
        this.paintMenuOptions();
    }

    paintMenuOptions(){
        this.terrains.forEach(function(t){
            let terrainElement = $(`<div class="terrain" style="background: ${t.color};">${name}</div>`);
            terrainElement.on("click", function(e){
                this.menuSelectedCallBack(t);
            }.bind(this));
            this.menuOptions.append(terrainElement);
        }.bind(this));
        let wayPointElement = $(`<div class="wayPoint" style="background: #A65C3E;">Way Point</div>`);
        let endPointElement = $(`<div class="endPoint" style="background: #A92535;">End point</div>`);
        wayPointElement.on("click", function(e){
            this.menuSelectedCallBack("wayPoint");
        }.bind(this));
        endPointElement.on("click", function(e){
            this.menuSelectedCallBack("endPoint");
        }.bind(this));
        this.menuOptions.append(wayPointElement);
        this.menuOptions.append(endPointElement);
    }
}

class Builder {
    constructor() {
        this.menuSelected = null;
        this.menu = new Menu(function(terrain) { this.menuSelected = terrain}.bind(this));
        this.canvas = document.getElementsByTagName("canvas")[0];
        document.body.appendChild(this.canvas);
        this.height = window.innerHeight - 50;
        this.width = window.innerWidth;

        let cellSize = Math.min(this.height / Assistent.numRows, this.width / Assistent.numColumns);

        this.map = new Map(Assistent.numColumns, Assistent.numRows, cellSize, this.canvas);

        this.map.fill(this.map.terrains.ground)

        this.canvas.onclick = (e) => {
            if(this.menuSelected){
                let canvasPos = document.body.getElementsByTagName("canvas")[0].getBoundingClientRect();
                let cell = { x: Math.floor((e.pageX - canvasPos.x) / cellSize) + 1, y: Math.floor((e.pageY - canvasPos.y) / cellSize) + 1 };

                if(this.menuSelected == "wayPoint"){
                    this.map.addWayPoint({ x: cell.x - 1, y: cell.y - 1 });
                } else if (this.menuSelected == "endPoint"){
                    this.map.addEndPoint({ x: cell.x - 1, y: cell.y - 1 });
                } else {
                    this.map.rect(this.menuSelected, cell.x - 1, cell.y - 1, 1, 1);
                }
                this.map.render();
                this.menuSelected = null;
            }
        };

        var startButton = document.createElement("input");
        startButton.value = "Comenzar";
        startButton.type = "submit";
        let menuElement = document.getElementById("menu");
        menuElement.appendChild(startButton);

        startButton.onclick = (e) => {
            if (this.map.prepared) {
                if (startButton.value == "Comenzar") {
                    window.aestrella = new AEstrella(this.map);
                    startButton.value = "Continuar";
                } else {
                    if (aestrella.ended) {
                        startButton.value = "Comenzar";
                    } else
                        aestrella.next();
                }
            } else alert("Por favor ponga la casilla de inicio y de fin!");
        }

        var playButton = document.createElement("input");
        playButton.value = "Ejecutar Automaticamente";
        playButton.type = "submit";
        menuElement.appendChild(playButton);

        playButton.onclick = (e) => {
            if (this.map.prepared) {
                window.aestrella = new AEstrella(this.map);
                window.timerVariable = window.setInterval(() => {
                    if (aestrella.ended) {
                        alert("Ha terminado!");
                        window.clearInterval(timerVariable);

                        // playButton.style.display = "none";
                    }
                    aestrella.next();
                }, 100);
            } else alert("Por favor ponga la casilla de inicio y de fin!");
        }


        // var AEstrella = new AEstrella(map);
        /*
        map.fill(map.terrains.ground)
        map.rect(map.terrains.wall, 4, 2, 2, 6);
        map.rect(map.terrains.water, 8, 0, 4, 15);
        map.rect(map.terrains.deep_water, 9, 0, 2, 15);
        map.rect(map.terrains.forest, 13, 6, 5, 5);
        map.rect(map.terrains.water, 15, 1, 4, 4);
        map.rect(map.terrains.deep_water, 16, 2, 2, 2);
        map.rect(map.terrains.wall, 19, 3, 1, 6);
        map.rect(map.terrains.bridge, 8, 10, 4, 1);
        map.origin = { x: 2, y: 2 };
        map.destiny = { x: 27, y: 4 };
        map.render();
        var AEstrella = new AEstrella(map);
    
        //Para avanzar un paso AEstrella.next();
        //Para resolver directamente AEstrella.solve();
        this.canvas.onclick = () => {
            AEstrella.next();
        }
        */
    }

    get Map() {
        return this.map
    }
}
