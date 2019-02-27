function paint(cellType) {
    switch (cellType) {
        case "Prohibida":
            Assistent.builder.map.rect(Assistent.builder.map.terrains.wall, cell.x - 1, cell.y - 1, 1, 1);
            Assistent.builder.map.render();
            break;
        case "Fin":
            Assistent.builder.map.addEndPoint({ x: cell.x - 1, y: cell.y - 1 });
            Assistent.builder.map.render();
            break;
        case "Inicio":
            Assistent.builder.map.addWayPoint({ x: cell.x - 1, y: cell.y - 1 });
            Assistent.builder.map.render();
            break;
    }
}
function Assistent() {
    var form = document.createElement("div");
    form.className = "formInicio";
    var numRowsInput = document.createElement("input");
    numRowsInput.placeholder = "Numero de filas";
    form.appendChild(numRowsInput);
    var numColumnsInput = document.createElement("input");
    numColumnsInput.placeholder = "Numero de columnas";
    form.appendChild(numColumnsInput);
    var submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Continuar";
    form.appendChild(submitButton);

    submitButton.onclick = () => {
        try {
            Assistent.numRows = parseInt(numRowsInput.value, 0);
            Assistent.numColumns = parseInt(numColumnsInput.value, 0);
            if (!Assistent.numRows || !Assistent.numColumns)
                throw Error("Empty");
        } catch { alert("No se han reconocido correctamente las dimensiones:" + numRowsInput.value + ", " + numColumnsInput.value); return; };

        Assistent.builder = new Builder();
        document.body.removeChild(form);
    }

    document.body.appendChild(form);

    // Registro el selector de tipo de celda
    var options = $("#selectorCell input");
    options.__proto__ = [].__proto__;
    options.forEach(p => {
        p.onclick = () => {
            paint(p.value);
            $.modal.close();
        };
    });
}