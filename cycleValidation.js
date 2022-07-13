// Storage
let collectedGraphComponent = [];
let graphComponentMatrix = [];

// for(let i=0;i<rows;i++){
    // why array-> more than 1 child relation dependancy
//     let row = [];
//     for(let j=0;j<cols;j++){
//         row.push([]);
//     }
//     graphComponentMatrix.push(row);
// }

// True -> Cycle
function isGraphCyclic(graphComponentMatrix) {
    // Dependenvy -> visited, dfsVisited (2D Array)
    let visited = [];
    let dfsVisited = [];

    for(let i=0;i<rows;i++){
        let visitedRow = [];
        let dfsVisitedRow = [];
        for(let j=0;j<cols;j++){
            visitedRow.push(false);
            dfsVisitedRow.push(false);
        }
        visited.push(visitedRow);
        dfsVisited.push(dfsVisitedRow);
    }

    for(let i=0;i<rows;i++){
        for(let j=0;j<cols;j++){
            if(visited[i][j] === false){
                let response = dfsCycleDetection(graphComponentMatrix, i, j, visited, dfsVisited);
                if(response === true){
                    return [i,j];
                }
            }
        }
    }
    return null;
}

// at start-> vis(TRUE) dfsvis(TRUE)
//// at end->dfsvis(false)
// if vis[i][j]->already explored path, so go back no use to explore again
// cycle detection condition-> if vis[i][j]==true ans dfsvis[i][j]==true ->cycle
// return bool
//if visualViewport()
function dfsCycleDetection(graphComponentMatrix, srcr, srcc, visited, dfsVisited){ // source row and source col
   
    visited[srcr][srcc] = true;
    dfsVisited[srcr][srcc] = true;

    // A1-> [[0,1], [1,0], [2,7], ...]
    for(let children = 0;children < graphComponentMatrix[srcr][srcc].length;children++){
        let [crid,ccid] = graphComponentMatrix[srcr][srcc][children]; //child row and child col
        if(visited[crid][ccid] === false){
            let response = dfsCycleDetection(graphComponentMatrix,crid,ccid,visited,dfsVisited);
            if(response === true){
                return true;
            }
        }
        else if(dfsVisited[crid][ccid] === true){
            //found cycle so no need to iterate more, and return true
            return true;
        }
    }
    
    dfsVisited[srcr][srcc] = false;
    return false;
}