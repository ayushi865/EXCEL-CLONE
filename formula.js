for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
        let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
        cell.addEventListener("blur",(e)=>{
            let address = addressBar.value;
            let [activeCell,cellProp] = getCellAndCellProp(address);
            let enteredData = activeCell.innerText;
            if(enteredData == cellProp.value) return;
            cellProp.value = enteredData;

            removeChildFromParent(cellProp.formula);
            cellProp.formula = "";
            updateChildrenCells(address);
        });
    }
}

let formulaBar = document.querySelector(".formula-bar");

formulaBar.addEventListener("keydown", async (e) =>{
    let inputFormula = formulaBar.value;
    if(e.key === "Enter" && inputFormula){  // input formula should not be empty

        // if change in formula, break old P-C relation, evaluate new formula and add new P-C relation
        let address = addressBar.value; // current cell details
        let [cell,cellProp] = getCellAndCellProp(address);

        if(inputFormula !== cellProp.formula){ // if the formula is not same to old formula,break old relationship
            removeChildFromParent(cellProp.formula);
        }

        addChildToGraphComponent(inputFormula,address);
        // Check for cyclic formula, if yes then only evalute
        //true->cycle, false->not cycle
        let cycleResonse = isGraphCyclic(graphComponentMatrix);  // True -> Cycle

        if(cycleResonse) {
            // alert("Your Formula is Cyclic");
            let response = confirm("Your Formula is Cyclic. Do you want to trace your Path ?");
            while(response === true){
                // Keep on tracking color until user is satisfied
                await isGraphCyclicTracePath(graphComponentMatrix,cycleResonse); // i want to complete full iteration of color tracking so i will attach await here also
                response = confirm("Your Formula is Cyclic. Do you want to trace your Path ?");
            }
            removeChildFromGraphComponent(inputFormula, address);
            return;
        }

        let evaluatedValue = evaluateFormula(inputFormula); 

        // to update cell prop in UI and DB
        setCellUIAndCellProp(evaluatedValue, inputFormula, address);
        addChildToParent(inputFormula);

        updateChildrenCells(address);
    }
});


function addChildToGraphComponent(formula, childAddress){
    let [crid,ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){          
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){
            let [prid, pcid] = decodeRIDCIDFromAddress(encodedFormula[i]); 
            //B1:A1+10
            //rid->i, cid->j 
            graphComponentMatrix[prid][pcid].push([crid,ccid]);   // inside the parent cell, we push child details
        }
    }
}

function removeChildFromGraphComponent(formula, childAddress){
    let [crid,ccid] = decodeRIDCIDFromAddress(childAddress);
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){
            let [prid, pcid] = decodeRIDCIDFromAddress(encodedFormula[i]);
            graphComponentMatrix[prid][pcid].pop();
        }
    }
}


function updateChildrenCells(parentAddress){
    let [parentCell,parentCellProp] = getCellAndCellProp(parentAddress);
    let children = parentCellProp.children;
    for(let i=0;i<children.length;i++){
        let childAddress = children[i];
        let [childCell, childCellProp] = getCellAndCellProp(childAddress);
        let childFormula = childCellProp.formula;
        let evaluatedValue = evaluateFormula(childFormula);
        setCellUIAndCellProp(evaluatedValue, childFormula, childAddress);
        updateChildrenCells(childAddress);
    }
}

function addChildToParent(formula){   //establish parent child relationship
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){
            let [parentCell, parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            parentCellProp.children.push(childAddress);
        }
    }
}

function removeChildFromParent(formula){  // we have to break the old relationship
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){
            let [parentCell, parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            let idx = parentCellProp.children.indexOf(childAddress);
            parentCellProp.children.splice(idx,1); 
        }
    }
}

function evaluateFormula(formula){
    let encodedFormula = formula.split(" ");
    for(let i=0;i<encodedFormula.length;i++){       // checking if normal or dependant expression
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if(asciiValue >= 65 && asciiValue <= 90){
            let [cell, cellProp] = getCellAndCellProp(encodedFormula[i]);   // so we decond the values
            encodedFormula[i] = cellProp.value;    //replacing A1 by 10
        }
    }
    let decodedFormula = encodedFormula.join(" ");
    return eval(decodedFormula); 
}

function setCellUIAndCellProp(evaluatedValue, formula,address){
    let [cell,cellProp] = getCellAndCellProp(address);
    //UI update
    cell.innerText = evaluatedValue;
    //db update
    cellProp.value = evaluatedValue;
    cellProp.formula = formula;
}