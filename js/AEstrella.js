class List {
    constructor(name = "open") {
        this.cells = [];
        this.name = name;
    }
    add(cell) {
        cell.list = this.name;
        this.cells.push(cell);
    }

    reset() {
        this.cells = [];
    }

    reverse() {
        this.cells.reverse();
    }

    getFirst() {
        return this.cells.splice(0, 1)[0];
    }

    sort() {
        this.cells.sort(function (a, b) { return a.F - b.F; });
    }

    contains(cell) {
        return this.cells.indexOf(cell) < 0 ? false : true;
    }
}

class AEstrella {
    constructor(map) {
        this.open_list = new List();
        this.closed_list = new List("closed");
        this.map = map;
        this.ctx = this.map.ctx;
        this.iterations = 0;
        this.wayPointsReached = 1;
        this._nextWayPoint();
        this.path = [];
    }

    _copy(src){
        return Object.assign({}, src);
    }

    _clear(){
        this.open_list.reset();
        this.closed_list.reset();
    }

    _nextWayPoint(finalCell){
        if(finalCell) {
            let cell = finalCell;
            let offset = this.map.cell_size / 2;
            let next = cell.dad;
            let tempPath = [];

            tempPath.push(cell);
            // Add current path
            while (next) {
                cell = next;
                next = cell.dad;
                tempPath.push(cell);
                cell.dad = 0x0; // Restablezco su padre
            }

            tempPath.reverse().forEach(function(c) { this.path.push({x: c.x, y: c.y})}.bind(this));
        }

        this._clear();
        this.ended = this.wayPointsReached == (this.map.wayPoints.length + 1);
        this.origin = !this.ended ? this.map.wayPoints[this.wayPointsReached - 1] : 0x0;
        this.destiny = this.wayPointsReached < this.map.wayPoints.length ? this.map.wayPoints[this.wayPointsReached] : this.map.endPoints[0]; // Just one endPoint (the first)

        console.log(`Origin: ${JSON.stringify(this.origin)} Destiny: ${JSON.stringify(this.destiny)} Ends: ${this.ended}`);

        this.wayPointsReached++;
        if(!this.ended) this.open_list.add(this.map.cells[this.origin.x][this.origin.y]);
    }

    next(skip_render) {
        if (this.ended) return;
        this.interations++;

        // Get the first cell
        var dad = this.open_list.getFirst();
        this.closed_list.add(dad);

        //add the adjacents cells to the open list
        var adjacent_cells = this.map.getAdjacentCells(dad);
        for (var i = 0; i < adjacent_cells.length; i++) {
            var cell = adjacent_cells[i];
            //~~~ Start check end
            if (cell.x == this.destiny.x && cell.y == this.destiny.y) {
                cell.dad = dad;
                this._nextWayPoint(cell);
                if (!skip_render && this.ended)
                    this.drawPath();
                return cell;
            }
            //~~~ End check end
            //~~~ Start of the exclusion zone
            if (!cell.terrain.awkwardness || this.closed_list.contains(cell))
                continue;

            let awk = cell.terrain.awkwardness;
            let newG = parseInt(cell.x != dad.x && cell.y != dad.y ? dad.G + 14 / awk : dad.G + 10 / awk);

            //Change the dad and G,H,F if the current path is better
            if (this.open_list.contains(cell) && cell.G < newG) //worse? ok, skip
                    continue;

            //~~~ End of the exclusion zone
            cell.dad = dad;
            //Length to the origin
            cell.G = newG;
            //Manhattan heuristic
            let dx = Math.abs(this.destiny.x - cell.x);
            let dy = Math.abs(this.destiny.y - cell.y);
            cell.H = (dx + dy) * 10;
            cell.F = cell.G + cell.H; //Update F
            this.open_list.add(cell);
        }
        //sort open list
        this.open_list.sort();
        //render
        if (!skip_render)
            this.map.render();
    }
    drawCurrentPath(cell) {
        var offset = this.map.cell_size / 2;
        var next = cell.dad;
        this.ctx.save();
        while (next) {
            this.ctx.moveTo(cell.x * this.map.cell_size + offset, cell.y * this.map.cell_size + offset);
            this.ctx.lineTo(next.x * this.map.cell_size + offset, next.y * this.map.cell_size + offset);
            this.ctx.stroke();
            cell = next;
            next = cell.dad;
        }
        this.ctx.restore();
    }
    drawPath(){
        this.ctx.save();
        let offset = this.map.cell_size / 2;
        for (let i = 0; i < (this.path.length - 1); i++){
            let cell = this.path[i];
            let next = this.path[i + 1];
            this.ctx.moveTo(cell.x * this.map.cell_size + offset, cell.y * this.map.cell_size + offset)
            this.ctx.lineTo(next.x * this.map.cell_size + offset, next.y * this.map.cell_size + offset);
            this.ctx.stroke();

        }
        this.ctx.restore();
    }

    solve() {
        var last_cell = 0x0;
        while (!this.ended)
            last_cell = this.next(true);
        this.map.render();
        this.drawPath(last_cell);
    }
}