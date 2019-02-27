class Cell {
    constructor(ctx, map, x, y) {
        this.ctx = ctx;
        this.map = map;
        this.G = "";
        this.H = "";
        this.F = this.G + this.H;
        this.x = x;
        this.y = y;
        this.list = 0x0;
        this.dad = 0x0;
        this.terrain = map.randTerrain();
    }
    drawDad(x, y) {
        this.ctx.save();
        this.ctx.fillStyle = "#4D92FF";
        this.ctx.strokeStyle = "#000";
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.map.cell_size / 10, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.restore();
    }
    render() {
        this.ctx.save();
        this.ctx.fillStyle = this.terrain.color;
        this.ctx.strokeStyle = "#000";
        this.ctx.fillRect(0, 0, this.map.cell_size, this.map.cell_size);
        this.ctx.strokeRect(0, 0, this.map.cell_size, this.map.cell_size);
        //Draw data
        this.ctx.fillStyle = "#000";
        this.ctx.font = "10px Arial";
        this.ctx.textAlign = "start";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(this.F, 1, 1);
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText(this.G, 1, this.map.cell_size);
        this.ctx.textAlign = "end";
        this.ctx.fillText(this.H, this.map.cell_size - 1, this.map.cell_size);
        //Draw list
        if (this.list) {
            this.ctx.strokeStyle = this.list == "open" ? "#F00" : "#a0F";
            this.ctx.strokeRect(1, 1, this.map.cell_size - 2, this.map.cell_size - 2);
        }
        //Draw dad
        if (this.dad) {
            var offset = (this.map.cell_size / 10) * 3;
            var x = offset;
            var y = offset;
            if (this.dad.x == this.x)
                x = this.map.cell_size / 2;
            if (this.dad.x > this.x)
                x = this.map.cell_size - offset;
            if (this.dad.y == this.y)
                y = this.map.cell_size / 2;
            if (this.dad.y > this.y)
                y = this.map.cell_size - offset;
            this.drawDad(x, y);
        }
        this.ctx.restore();
    }
}
class Map {
    constructor(width, height, cell_size, canvas, terrains = [
        { awkwardness: 1.00, color: "#6DBF50", name: "ground" },
        { awkwardness: 0.75, color: "#1F7F3A", name: "forest" },
        { awkwardness: 0.50, color: "#6FD1FF", name: "water" },
        { awkwardness: 0.10, color: "#2B427D", name: "deep_water" },
        { awkwardness: 0.00, color: "#26221E", name: "wall" },
        { awkwardness: 0.90, color: "#76421E", name: "bridge" }
    ]) {
        this.width = width || 10;
        this.height = height || 10;
        this.cell_size = cell_size || 50;

        // Set canvas size
        canvas.width = this.width * this.cell_size;
        canvas.height = this.height * this.cell_size;

        this._ctx = canvas.getContext("2d");
        this.wayPoints = [];
        this.endPoints = [];
        
        //-- members
        this.cells = [];
        this.terrainsDef = terrains;

        let map = this;
        // -- allow external access by name (like map.terrain.water...)
        (function indexTerrains() {
            map.terrains = {};
            for (var i = 0; i < map.terrainsDef.length; i++)
                map.terrains[map.terrainsDef[i].name] = map.terrainsDef[i];
        }());


        //-- Assistent
        for (var i = 0; i < this.width; i++) {
            this.cells[i] = [];
            for (var j = 0; j < this.height; j++)
                this.cells[i].push(new Cell(this._ctx, this, i, j));
        }
    }

    get ctx() {
        return this._ctx;
    }

    get prepared() {
        return this.wayPoints.length > 0 && this.endPoints.length > 0;
    }

    addWayPoint(p = {x, y}){
        this.wayPoints.push(p);
    }

    addEndPoint(p = {x, y}){
        if(this.endPoints.length < 1)
            this.endPoints.push(p);
        else {
            alert(`We support just an end point, let's update it!`);
            this.endPoints[0] = p; // Me quedo con el ultimo
        };
    }

    //-- utils
    randTerrain() {
        var index = Math.floor(Math.random() * this.terrainsDef.length - 0.2);
        return this.terrainsDef[index > 0 ? index : 0];
    }
    drawFlag(x, y, color) {
        var x = x * this.cell_size + this.cell_size / 2;
        var y = y * this.cell_size + this.cell_size / 2;
        this._ctx.save();
        this._ctx.fillStyle = color;
        this._ctx.strokeStyle = "#000";
        this._ctx.beginPath();
        this._ctx.arc(x, y, this.cell_size / 3, 0, 2 * Math.PI);
        this._ctx.stroke();
        this._ctx.fill();
        this._ctx.restore();
    }
    render() {
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this._ctx.save();
                this._ctx.translate(i * this.cell_size, j * this.cell_size);
                this.cells[i][j].render();
                this._ctx.restore();
            }
        }
        this.wayPoints.forEach(function(p) {
            this.drawFlag(p.x, p.y, "#A65C3E");
        }.bind(this));

        this.endPoints.forEach(function(p) {
            this.drawFlag(p.x, p.y, "#A92535");
        }.bind(this));
    }
    fill(terrain, skip_render) {
        for (var i = 0; i < this.width; i++)
            for (var j = 0; j < this.height; j++)
                this.cells[i][j].terrain = terrain;
        if (!skip_render)
            this.render();
    }
    rect(terrain, x, y, w, h, skip_render) {
        for (var i = x; i < x + w; i++)
            for (var j = y; j < y + h; j++)
                this.cells[i][j].terrain = terrain;
        if (!skip_render)
            this.render();
    }
    addTerrain(terrain) {
        this.terrainsDef.push(terrain);
        indexTerrains();
    }
    getAdjacentCells(cell) {
        var adjacent_cells = [];
        for (var i = cell.x - 1; i <= cell.x + 1; i++) {
            for (var j = cell.y - 1; j <= cell.y + 1; j++) {
                try {
                    if (this.cells[i][j] && !(i == cell.x && j == cell.y))
                        adjacent_cells.push(this.cells[i][j]);
                }
                catch (ex) { }
            }
        }
        return adjacent_cells;
    }

}