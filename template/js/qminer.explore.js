$('#loading1').text('Loading available sensors ...');
$(function () {
    //init-ing and setting a few starting variables
    $.fn.datepicker.defaults.format = "yyyy-mm-dd";
    $('#datepicker').datepicker({
        forceParse: false,
        autoclose: true
    });
    myNodes = [];
    namesToLocations = {}; //maps dataType names to their places in myNodes
    scatterMat = new scatterM();
    compatibleDates = true;
});

$.ajax({
    //reading available
    url: '/api/get-sensors',
    success: loadedSensors
});

function loadedSensors(data) {
    // loading sensors into html
    var sensors = JSON.parse(data);
    var str;
    console.log("Number of sensors: " + sensors.length);
    for (j = 1; j < 5; j++) {
        $("<option value=\"" + "None" + "\">" + "None" + "</option>").appendTo("#ch-sensor" + j);
        for (i = 0; i < sensors.length; i++) {
            str = sensors[i].str;
            if (str.indexOf("alarm") == -1) $("<option value=\"" + sensors[i].str + "\">" + str + "</option>").appendTo("#ch-sensor" + j);
        }
    }
    handleSelectpicker();
    $('#loading1').text('Compare data types');
};

var handleSelectpicker = function () {
    $('.selectpicker').selectpicker('render');
};

$('#loading1').text('Loading sensor data ...');
$.ajax({
    //getting information about nodes
    url: '/api/get-nodes',
    success: loadedNodes
});

function loadedNodes(data) {
    //saving nodes...we will need them to get unit types and such when drawing charts
    myNodes = JSON.parse(data);
    $('#loading1').text('Compare data types');
}

function updateDate() {
    dataTyp = [$('#ch-sensor1 option:selected').val(), $('#ch-sensor2 option:selected').val(), $('#ch-sensor3 option:selected').val(), $('#ch-sensor4 option:selected').val()]
    found = [false, false, false, false];
    counter = [0, 0, 0, 0];
    counter2 = [0, 0, 0, 0];
    endDate = ["", "", "", ""];
    startDate = ["", "", "", ""];
    for (k = 0; k < 4; k++) {
        if (dataTyp[k] != "None") {
            while (!found[k] && counter[k] < myNodes.length) {
                counter2[k] = 0;
                while (!found[k] && counter2[k] < myNodes[counter[k]].Sensors.length) {
                    if (myNodes[counter[k]].Sensors[counter2[k]].Name == dataTyp[k]) {
                        found[k] = true;
                    }
                    counter2[k]++;
                }
                counter[k]++;
            }
            counter[k]--;
            counter2[k]--;
            endDate[k] = myNodes[counter[k]].Sensors[counter2[k]].EndDate.split("-");
            startDate[k] = myNodes[counter[k]].Sensors[counter2[k]].StartDate.split("-");
        }
        if (found[k]) {
            namesToLocations[dataTyp[k]] = { "fst": counter[k], "snd": counter2[k]};
        }
    }
    k = 0;
    j = 0;
    for (i = 0; i < dataTyp.length; i++) {
        if (dataTyp[i] != "None") {
            k += 1;
            j = i;
        }
    }
    if (k == 1) {
        endDate1 = endDate[j];
        endDate2 = new Date(endDate1[0], endDate1[1] - 1, endDate1[2] - 7);
        endDate2 = [endDate2.getFullYear(), endDate2.getMonth() + 1, endDate2.getDate()];
        $('#start').datepicker('setDate', new Date(endDate2[0], endDate2[1] - 1, endDate2[2]));
        $('#end').datepicker('setDate', new Date(endDate1[0], endDate1[1] - 1, endDate1[2]));
    }
    else {
        newDate = {};

        for (k = 0; k < 4; k++) {
            //this only allows bounded intervals. can fix if needed ???
            if (newDate != false && endDate[k] && startDate[k]) {
                newDate = dateIntersection(newDate, { "start": startDate[k], "end": endDate[k] });
            }
        }
        newDate = dateIntersection(newDate, { "start": endDate2, "end": endDate1 })
        if (newDate == false) {
            compatibleDates = false;
            alert("Current date interval is not compatible with this sensor.");
        }
        else {
            compatibleDates = true;
        }
    }
}

//function updateDate1() {
//    //??? edit date, so it takes in accout all 4 data types
//    dataTyp = [$('#ch-sensor1 option:selected').val(), $('#ch-sensor2 option:selected').val(), $('#ch-sensor3 option:selected').val(), $('#ch-sensor4 option:selected').val()]
//    found = [false, false, false, false];
//    counter = [0, 0, 0, 0];
//    counter2 = [0, 0, 0, 0];
//    endDate = ["", "", "", ""];
//    startDate = ["", "", "", ""];
//    for (k = 0; k < 4; k++) {
//        if (dataTyp[k] != "None") {
//            while (!found[k] && counter[k] < myNodes.length) {
//                counter2[k] = 0;
//                while (!found[k] && counter2[k] < myNodes[counter[k]].Sensors.length) {
//                    if (myNodes[counter[k]].Sensors[counter2[k]].Name == dataTyp[k]) {
//                        found[k] = true;
//                    }
//                    counter2[k]++;
//                }
//                counter[k]++;
//            }
//            counter[k]--;
//            counter2[k]--;
//            endDate[k] = myNodes[counter[k]].Sensors[counter2[k]].EndDate.split("-");
//            startDate[k] = myNodes[counter[k]].Sensors[counter2[k]].StartDate.split("-");
//        }
//        if (found[k]) {
//            namesToLocations[dataTyp[k]] = { "fst": counter, "snd": counter2 };
//        }
//    }
//    //we are looking for the intersection of these date intervals
//    newDate = {};

//    for (k = 0; k < 4; k++) {
//        //this only allows bounded intervals. can fix if needed ???
//        if (newDate != false && endDate[k] && startDate[k]) {
//            newDate = dateIntersection(newDate, {"start": startDate[k], "end": endDate[k]});
//        }
//    }
//    if (newDate != false) {
//        $('#start').datepicker('setDate', new Date(newDate.start[0], newDate.start[1] - 1, newDate.start[2]));
//        $('#end').datepicker('setDate', new Date(newDate.end[0], newDate.end[1] - 1, newDate.end[2]));
//    }
//    else {
//        $('#start').datepicker('setDate', "0-0-0");
//        $('#end').datepicker('setDate', "0-0-0");
//    }

//    //??? why doesnt setting min/max work? .. probably code from template overwrites it :(
//    //$('#start').datepicker('option', {'minDate': new Date(startDate[0], startDate[1]-1, startDate[2]), 'maxDate': new Date(endDate[0], endDate[1] - 1, endDate[2])});
//    //$('#end').datepicker('option', {'minDate': new Date(startDate[0], startDate[1]-1, startDate[2]), 'maxDate': new Date(endDate[0], endDate[1] - 1, endDate[2])});
//}

function dateIntersection(d1, d2) {
    if (!d1.end && d2.end) minEnd = d2.end;
    else if (d1.end && !d2.end) minEnd = d1.end;
    else if (!d1.end && !d2.end) return false;
    else if (compareDates(d1.end, d2.end)) {
        minEnd = d1.end;
    }
    else {
        minEnd = d2.end;
    }

    if (!d1.start && d2.start) maxStart = d2.start;
    else if (d1.start && !d2.start) maxStart = d1.start;
    else if (!d1.start && !d2.start) return false;
    else if (compareDates(d2.start, d1.start)) {
        maxStart = d1.start;
    }
    else {
        maxStart = d2.start;
    }
    if (compareDates(minEnd, maxStart)) {
        return false;
    }
    return {"start": maxStart, "end": minEnd}
}

function compareDates(date1, date2) {
    //returns true if date1 is before date2 and false otherwise
    date1 = [parseInt(date1[0]), parseInt(date1[1]), parseInt(date1[2])];
    date2 = [parseInt(date2[0]), parseInt(date2[1]), parseInt(date2[2])];
    if (date1[0] < date2[0]) {
        return true;
    }
    else if (date1[0] == date2[0] && date1[1] < date2[1]) {
        return true;
    }
    else if (date1[0] == date2[0] && date1[1] == date2[1] && date1[2] < date2[2]) {
        return true;
    }
    else {
        return false;
    }
}

function scatterM() {
    //chart class, draws charts
    //since we compare data it has to be sampled at the same time. Hence we cannot allow Raw data (no guarantees it will be sampled correctly)
    this.data = [];
    this.timeInterval;
    this.dateStart;
    this.dateEnd;
    this.aggregateType;
    this.dataType;
    this.sm;
    this.colorType = "workday";

    this.draw = function () {
        //collecting data from form
        if (!compatibleDates) {
            alert("Date interval is incompatible and there is nothing to compare!");
            return ;
        }
        $('#loadingMatrix').text('Collecting series data ...');
        this.data = [];
        this.timeInterval = correctTimeInterval($('#time-interval option:selected').val());
        this.dateStart = $('#start').val();
        this.dateEnd = $('#end').val();
        this.aggregateType = $('#aggregate-type option:selected').val().toLowerCase();
        this.dataType = [];
        for (j = 1; j < 5; j++) {
            selected = $('#ch-sensor' + j + ' option:selected').val();
            if (selected != "None") {
                this.dataType[this.dataType.length] = selected;
            }
        }
        for (i in this.dataType) this.data.push("");//just so it is the right size

        // in reasonable time we can process approximately 240 measurments for 4x4,
        // 400 for 3x3 and 800 for 2x2
        //this.noPoints = 0.0;
        //if (this.timeInterval == "1h") {
        //    this.noPoints = dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) * 24;
        //}
        //else if (this.timeInterval == "6h") {
        //    this.noPoints = dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) * 4;
        //}
        //else if (this.timeInterval == "1d") {
        //    this.noPoints = dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true);
        //}
        //else if (this.timeInterval == "1w") {
        //    this.noPoints = dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) / 7;
        //}
        //else if (this.timeInterval == "1m") {
        //    this.noPoints = dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) / 30;
        //}
        //else if (this.timeInterval == "1y") {
        //    this.noPoints = dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) / 365;
        //}
        this.nPoints = 0.0; 
        if (this.dataType.length == 2) this.nPoints = 800;
        else if (this.dataType.length == 3) this.nPoints = 400;
        else if (this.dataType.length == 4) this.nPoints = 240;
        else if (this.dataType.length == 1) this.nPoints = 3000;
        else console.log("ERROR: not supposed to happen.");


        //if (this.timeInterval == "1h") {
        //    if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) > 7) {
        //        alert("Too much data. Please select a smaller interval (less than 8 days), or a bigger sampling interval.");
        //        $('#loadingMatrix').html('&nbsp');
        //        return;
        //    }
        //}
        //else if (this.timeInterval == "6h") {
        //    if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) > 15) {
        //        alert("Too much data. Please select a smaller interval (less than 15 days), or a bigger sampling interval.");
        //        $('#loadingMatrix').html('&nbsp');
        //        return;
        //    }
        //}
        //else if (this.timeInterval == "1d") {
        //    if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) > 60) {
        //        alert("Too much data. Please select a smaller interval (less than 2 months), or a bigger sampling interval.");
        //        $('#loadingMatrix').html('&nbsp');
        //        return;
        //    }
        //}
        //else if (this.timeInterval == "1w") {
        //    if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) > 300) {
        //        alert("Too much data. Please select a smaller interval (less than 10 months), or a bigger sampling interval.");
        //        $('#loadingMatrix').html('&nbsp');
        //        return;
        //    }
        //}
        //else if (this.timeInterval == "1m") {
        //    if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) > 900) {
        //        alert("Too much data. Please select a smaller interval (less than 2.5 years), or a bigger sampling interval.");
        //        $('#loadingMatrix').html('&nbsp');
        //        return;
        //    }
        //}
        //else if (this.timeInterval == "1y") {
        //    if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-"), true) > 8000) {
        //        alert("Too much data. Please select a smaller interval (less than 20 years), or a bigger sampling interval.");
        //        $('#loadingMatrix').html('&nbsp');
        //        return;
        //    }
        //}
        var myUrl;
        if (this.dateStart == "" || this.dateEnd == "") {
            console.log("ERROR daterange not selected");
            alert("ERROR daterange not selected");
        }
        else {
            for (j = 1; j < 5; j++) {
                if (this.aggregateType != "raw") myUrl = '/api/get-aggregates?p=' + escape(this.dataType[j-1]) + ':' + this.aggregateType + ':' + this.timeInterval + ':' + this.dateStart + ':' + this.dateEnd;
                else myUrl = '/api/get-measurements?p=' + escape(this.dataType[j-1]) + ':' + this.dateStart + ':' + this.dateEnd;


                if (this.dataType[j - 1] != "None" && this.dataType[j - 1]) {
                    var newthis = { "con": this, "j": j - 1 };
                    $.ajax({
                        url: myUrl,
                        success: function (data1) { this.con.loadedAggregates(data1, this.con.dataType, this.con.timeInterval, this.con.dateStart, this.con.dateEnd, this.j, this.con.colorType) },
                        context: newthis
                    });
                }
            }
        }
    };

    this.loadedAggregates = function (data1, dataTyp, timeInterval, startDate, endDate, where, colorType) {
        this.data[where] = JSON.parse(data1);
        pass = true;
        for (i = 0; i < this.data.length; i++) {
            if (!this.data[i] || this.data[i] == "") pass = false;
        }
        if (pass) {
            if (this.data.length == 0) {
                console.log("ERROR I am not supposed to happen.");
            }
            $('#loadingMatrix').text('Filtering data ...');
            for (i = 0; i < this.data.length; i++) {
                if (!this.data[i][0]) {
                    alert("There is unfortulatley no data on this time interval for " + dataTyp[i] + ", please choose another interval.");
                    $('#loadingMatrix').text('&nbsp');
                    return;
                }
            }
            this.filterData(timeInterval, startDate, endDate);

            noPoints = this.data[0].length;
            if (this.nPoints > noPoints) this.nPoints = noPoints;
            console.log("Out of " + (noPoints) + " points (per graph) we will sample " + this.nPoints + " points.");

            //compose string and draw the scatter matrix
            //example:
                //var data2 = "Segment,sepal length,sepal width,petal length,petal width\n" +
                //        "setosa,5.1,3.5,1.4,0.2\n" +
                //        "setosa,4.9,3,1.4,0.2\n" +
                //        "setosa,4.7,3.2,1.3,0.2"

            //counters = []
            var data2 = "Segment";
            //header
            for (i = 0; i < dataTyp.length; i++) {
                data2 += "," + dataTyp[i]
                //counters[i] = namesToLocations[dataTyp[i]]
            }
            //data
            this.data = this.randomSample(this.data, this.nPoints);
            $('#loadingMatrix').text('Constructing .csv ...');
            for (j = 0; j < this.data[0].length; j++) {
                data2 += "\n";
                
                if (colorType == "quarterly") { //if we want quarterly segmentation
                    if (j / this.data[0].length < 0.25) data2 += "first quarter of data";
                    else if (j / this.data[0].length < 0.5) data2 += "second quarter of data";
                    else if (j / this.data[0].length < 0.75) data2 += "third quarter of data";
                    else data2 += "fourth quarter of data";
                }
                else if (colorType == "workday") { //if we want workday/night/rest segmentation
                    hour = parseInt(this.data[0][j].Timestamp.split("T")[1].split(":")[0]);
                    if (hour > 6 && hour < 17) data2 += "Work day (7h-16h)";
                    else if (hour > 21 || hour < 7) data2 += "Night (22h-7h)";
                    else data2 += "Afternoon (16h-22h)";
                }
                else if (colorType == "transit") {
                    hour = parseInt(this.data[0][j].Timestamp.split("T")[1].split(":")[0]);
                    if (hour > 8 && hour < 15) data2 += "Work day (9h-15h)";
                    else if (hour > 21 || hour < 5) data2 += "Night (22h-5h)";
                    else if (hour > 4 && hour < 9) data2 += "Morinig transit (5h-9h)";
                    else if (hour > 14 && hour < 19) data2 += "Afternoon transit (15h-19h)";
                    else data2 += "Afternoon (19h-22h)";
                }

                for (i = 0; i < dataTyp.length; i++) {
                    data2 += "," + this.data[i][j].Val;
                    //console.log(i + "  " + this.data[i][j].Val);
                }
            }
            
            var divId = "scatter";
            //first we empty the div in case we have a scatter matrix there already
            $('#' + divId).empty();
            $('#loadingMatrix').text('Rendering matrix ...');
            this.sm = new ScatterMatrix('whatever.csv', data2, divId); //if we provide data it will not try to read it from file
            this.sm.render();
            $('#loadingMatrix').html('&nbsp');

            this.data = [] //resets data, so we cannot have conflicts. also resets at draw, in case the user gets impatient.
            this.dataType = []
        }
    };

    this.randomSample = function (data, nPoints) {
        data1 = [];
        internal = [];
        //console.log(data[2]);
        //console.log(nPoints, this.data[0].length, this.data[1].length);
        for (i = 0; i < data.length; i++) {
            data1.push([]);
        }
        for (j = 0; j < nPoints; j++) {
            gz = Math.random();
            n = Math.floor(gz *data[0].length); //all are the same length
            internal.push(n);
        }
        internal.sort();
        for (j = 0; j < internal.length; j++) {
            for (i = 0; i < data.length; i++) {
                data1[i].push(data[i][internal[j]]);
            }
        }
        return data1;
    }

    this.filterData = function(timeInterval, startDate, endDate) {
        //filters this.data so that only one measurment is present in each timeInterval
        var da;
        for (i = 0; i < this.data.length; i++) {
            da = [];
            prevDateTime = startDate + "T00:00:00.0";
            for (j = 0; j < this.data[i].length; j++) {
                dateTime = this.data[i][j].Timestamp;

                if (j == 0 || doesDifferBy(timeInterval, prevDateTime, dateTime, 1)) {
                    if (j == 0 || !doesDifferBy(timeInterval, prevDateTime, dateTime, 2)) {
                        da.push(this.data[i][j]);
                    }
                    else {
                        while (doesDifferBy(timeInterval, prevDateTime, dateTime, 2)) {
                            da.push(da[da.length - 1]);
                            dt = prevDateTime.split("T");
                            t = dt[1].split(":");
                            d = dt[0].split("-");
                            tt = t[2].split(".");
                            if (timeInterval == "1h") d = new Date(d[0], d[1] - 1, d[2], t[0] - (-1), t[1], t[2], tt[0], tt[1]);
                            else if (timeInterval == "6h") d = new Date(d[0], d[1] - 1, d[2], t[0] - (-6), t[1], t[2], tt[0], tt[1]);
                            else if (timeInterval == "1d") d = new Date(d[0], d[1] - 1, d[2] - (-1), t[0], t[1], t[2], tt[0], tt[1]);
                            else if (timeInterval == "1w") d = new Date(d[0], d[1] - 1, d[2] - (-7), t[0], t[1], t[2], tt[0], tt[1]);
                            else if (timeInterval == "1m") d = new Date(d[0], d[1] - 1, d[2] - (-30), t[0], t[1], t[2], tt[0], tt[1]);
                            else if (timeInterval == "1y") d = new Date(d[0], d[1] - 1, d[2] - (-365), t[0], t[1], t[2], tt[0], tt[1]);
                            else console.log("ERROR time interval.");
                            prevDateTime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
                        }
                        da.push(this.data[i][j]);
                    }
                    if (j != 0) {
                        dt = prevDateTime.split("T");
                        t = dt[1].split(":");
                        d = dt[0].split("-");
                        tt = t[2].split(".");
                        if (timeInterval == "1h") d = new Date(d[0], d[1] - 1, d[2], t[0] - (-1), t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "6h") d = new Date(d[0], d[1] - 1, d[2], t[0] - (-6), t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "1d") d = new Date(d[0], d[1] - 1, d[2] - (-1), t[0], t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "1w") d = new Date(d[0], d[1] - 1, d[2] - (-7), t[0], t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "1m") d = new Date(d[0], d[1] - 1, d[2] - (-30), t[0], t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "1y") d = new Date(d[0], d[1] - 1, d[2] - (-365), t[0], t[1], t[2], tt[0], tt[1]);
                        else console.log("ERROR time interval.");
                        prevDateTime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
                    }
                }
                if (j == 0 && compareDates(prevDateTime.split("T")[0].split("-"), dateTime.split("T")[0].split("-"))) {
                    //dateTime is after prevDateTime, so we have to fill in some data until we have actual data available
                    //console.log("Data incomplete: filling from start date to real start date.");
                    while (compareDates(prevDateTime.split("T")[0].split("-"), dateTime.split("T")[0].split("-"))) {
                        da.push(da[da.length - 1]);
                        dt = prevDateTime.split("T");
                        t = dt[1].split(":");
                        d = dt[0].split("-");
                        tt = t[2].split(".");
                        if (timeInterval == "1h") d = new Date(d[0], d[1] - 1, d[2], t[0] - (-1), t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "6h") d = new Date(d[0], d[1] - 1, d[2], t[0] - (-6), t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "1d") d = new Date(d[0], d[1] - 1, d[2] - (-1), t[0], t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "1w") d = new Date(d[0], d[1] - 1, d[2] - (-7), t[0], t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "1m") d = new Date(d[0], d[1] - 1, d[2] - (-30), t[0], t[1], t[2], tt[0], tt[1]);
                        else if (timeInterval == "1y") d = new Date(d[0], d[1] - 1, d[2] - (-365), t[0], t[1], t[2], tt[0], tt[1]);
                        else console.log("ERROR time interval.");
                        prevDateTime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
                    }
                }
            }
            if (compareDates(prevDateTime.split("T")[0].split("-"), endDate.split("-"))) {
                //if we stop before the end of the interval we fill it to the end
                //console.log("Data incomplete: filling from real end date to end.");
                while (compareDates(prevDateTime.split("T")[0].split("-"), endDate.split("-"))) {
                    da.push(da[da.length - 1]);
                    dt = prevDateTime.split("T");
                    t = dt[1].split(":");
                    d = dt[0].split("-");
                    tt = t[2].split(".");
                    if (timeInterval == "1h") d = new Date(d[0], d[1] - 1, d[2], t[0] - (-1), t[1], t[2], tt[0], tt[1]);
                    else if (timeInterval == "6h") d = new Date(d[0], d[1] - 1, d[2], t[0] - (-6), t[1], t[2], tt[0], tt[1]);
                    else if (timeInterval == "1d") d = new Date(d[0], d[1] - 1, d[2] - (-1), t[0], t[1], t[2], tt[0], tt[1]);
                    else if (timeInterval == "1w") d = new Date(d[0], d[1] - 1, d[2] - (-7), t[0], t[1], t[2], tt[0], tt[1]);
                    else if (timeInterval == "1m") d = new Date(d[0], d[1] - 1, d[2] - (-30), t[0], t[1], t[2], tt[0], tt[1]);
                    else if (timeInterval == "1y") d = new Date(d[0], d[1] - 1, d[2] - (-365), t[0], t[1], t[2], tt[0], tt[1]);
                    else console.log("ERROR time interval.");
                    prevDateTime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
                }
            }
            this.data[i] = da;
        }
    };
    
};

function doesDifferBy(timeInterval, dt1, dt2, scale) {
    //dt1 always before dt2
    //scale can only be 1 or 2. (or 3, but we will not use it. for tI other than 1h or 6h it can be anything)
    dt1 = dt1.split("T");
    dt2 = dt2.split("T");
    d1 = dt1[0].split("-");
    t1 = dt1[1].split(":");
    d2 = dt2[0].split("-");
    t2 = dt2[1].split(":");
    if (timeInterval == "1h") {
        //abs takes care of dateDiff = 0 and dateDiff = 1 at the same time
        if (dateDiff(d1, d2) > 1 || (Math.abs(timeDiff(t1, t2)) > 3600 * scale)) return true;
        else return false;
    }
    else if (timeInterval == "6h") {
        //abs takes care of dateDiff = 0 and dateDiff = 1 at the same time
        if (dateDiff(d1, d2) > 1 || (Math.abs(timeDiff(t1, t2)) > 6 * 3600 * scale)) return true;
        else return false;
    }
    else if (timeInterval == "1d") {
        if (dateDiff(d1, d2) > 1 * scale || (dateDiff(d1, d2) == 1 * scale && timeDiff(t1, t2) >= 0)) return true;
        else return false;
    }
    else if (timeInterval == "1w") {
        if (dateDiff(d1, d2) > 7 * scale || (dateDiff(d1, d2) == 7 * scale && timeDiff(t1, t2) >= 0)) return true;
        else return false;
    }
    else if (timeInterval == "1m") {
        if (dateDiff(d1, d2) > 30 * scale || (dateDiff(d1, d2) == 30 * scale && timeDiff(t1, t2) >= 0)) return true;
        else return false;
    }
    else if (timeInterval == "1y") {
        if (dateDiff(d1, d2) > 365 * scale || (dateDiff(d1, d2) == 365 * scale && timeDiff(t1, t2) >= 0)) return true;
        else return false;
    }
    else {
        console.log("ERROR invalid interval.");
        return false;
    }
}

function dateDiff(d1, d2, supressError) {
    //in days, d1 must be before d2, month = 30 days, year = 365 days
    minusOne = false
    if (d2[2] - d1[2] >= 0) {
        daysDiff = d2[2] - d1[2];
        minusOne = false;
    }
    else {
        daysDiff = 30 - d1[2] - (-d2[2]);
        minusOne = true;
    }
    if (d2[1] - d1[1] >= 0) {
        monthsDiff = d2[1] - d1[1];
        if (minusOne) monthsDiff -= 1;
        minusOne = false;
    }
    else {
        monthsDiff = 12 - d1[1] - (- d2[1]);
        if (minusOne) monthsDiff -= 1;
        minusOne = true;
    }
    yearsDiff = d2[0] - d1[0];
    if (minusOne) yearsDiff -= 1;
    diff = 365 * yearsDiff - (- 30 * monthsDiff - daysDiff);
    if (diff < 0 && supressError) {
        // we want to supress this error when we check if data is too big. Because not all minDate/maxDate-s are the same negative diff can happen.
        console.log("ERROR date diff not supposed to be < 0.");
    }
    return diff;
}

function timeDiff(t1, t2) {
    t1 = [parseInt(t1[0]), parseInt(t1[1]), parseFloat(t1[2])];
    t2 = [parseInt(t2[0]), parseInt(t2[1]), parseFloat(t2[2])];
    if (t1[0] < t2[0] || (t1[0] == t2[0] && t1[1] < t2[1]) || (t1[0] == t2[0] && t1[1] == t2[1] && t1[2] < t2[2])) {
        //t1 is before t2
        return timeDiff1(t1, t2);
    }
    else {
        //t2 before t1, we return negative diff, since dt1 is before dt2
        return - timeDiff1(t1, t2);
    }
}

function timeDiff1(t1, t2) {
    //t1 before t2
    minusOne = false
    if (t2[2] - t1[2] >= 0) {
        secondsDiff = t2[2] - t1[2];
        minusOne = false;
    }
    else {
        secondsDiff = 60 - t1[2] - (- t2[2]);
        minusOne = true;
    }
    if (t2[1] - t1[1] >= 0) {
        minutesDiff = t2[1] - t1[1];
        if (minusOne) minutesDiff -= 1;
        minusOne = false;
    }
    else {
        minutesDiff = 60 - t1[1] - (- t2[1]);
        if (minusOne) minutesDiff -= 1;
        minusOne = true;
    }
    hoursDiff = t2[0] - t1[0];
    if (minusOne) hoursDiff -= 1;
    diff = 3600 * hoursDiff - (- 60 * minutesDiff - secondsDiff);
    return diff;
}

function correctDate(date) {
    //corrects date because it is in wrong format
    date = date.split("-");
    if (date.length != 3) {
        console.log("ERROR: provided date is in wrong format.")
    }
    return date[2] + "-" + date[1] + "-" + date[0];
};

function correctTimeInterval(ti) {
    //time intervals map: 1h -> 1h, 6h -> 6h, 1 day -> 1d, 1 week -> 1w, 1 month -> 1m, 1 year -> 1y
    ti = ti.split(" ");
    if (ti.length < 2) {
        return ti[0];
    }
    else {
        return ti[0] + ti[1][0];
    }
}
