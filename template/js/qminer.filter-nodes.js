$(function () {
    myNodes = [];
    filter = /FIO.*/;
});

$.ajax({
    //getting information about nodes
    url: '/api/get-nodes',
    success: function (data) { filteredLoadedNodes(data, filter); }
});

function filteredLoadedNodes(data, filter) {
    //saving nodes...we will need them to get unit types and such when drawing charts
    myNodes = JSON.parse(data);
    myNodes1 = [];
    for (counter = 0; counter < myNodes.length; counter++) {
        internal = [];
        for (counter2 = 0; counter2 < myNodes[counter].Sensors.length; counter2++) {
            if (myNodes[counter].Sensors[counter2].Name.search(filter) != -1) {
                internal.push(myNodes[counter].Sensors[counter2]);
            }
        }
        if (internal != []) {
            myNodes1.push(myNodes[counter]);
            myNodes1[myNodes1 - 1].Sensors = internal;
        }
    }
    myNodes = myNodes1;
}