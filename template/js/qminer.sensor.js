$('#loading1').text('Loading available sensors ...');
$.ajax({
    //reading available
    url: '/api/get-sensors',
    success: loadedSensors
});

$(function () {
    //init-ing and setting a few starting variables
    $.fn.datepicker.defaults.format = "yyyy-mm-dd";
    $('#datepicker').datepicker({
        forceParse: false,
        autoclose: true
    });
    chartNumber = 1;
    myChart = [new highChart("container1")];
    myNodes = [];
    namesToLocations = {} //maps dataType names to their places in myNodes
});

$('#loading1').text('Loading sensor data ...');
$.ajax({
    //getting information about nodes
    url: '/api/get-nodes',
    success: loadedNodes
});

function addNewChart() {
    if (myChart.length < 5) {
        chartNumber = myChart.length + 1;
        $('#content-row1').prepend(
                '<div class="col-md-12 ui-sortable" id="ucontainer' + chartNumber + '"> ' +
                    '<div class="panel panel-inverse"> ' +
                        '<div class="panel-heading ui-sortable"> ' +
                            '<div class="panel-heading-btn"> ' +
                                '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-default" data-click="panel-expand"> <i class="fa fa-expand"> </i></a> ' +
                                '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-success" data-click="panel-reload"> <i class="fa fa-repeat"> </i> </a> ' +
                                '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-warning" data-click="panel-collapse"> <i class="fa fa-minus"> </i> </a> ' +
                                '<!-- ??? Catch remove and update counter/chart list. -->' +
                                '<a href="javascript:;" class="btn btn-xs btn-icon btn-circle btn-danger" data-click="panel-remove"><i class="fa fa-times"></i></a> ' +
                            '</div> ' +
                            '<h4 class="panel-title" id="loadingChart"' + chartNumber + '>Chart</h4> ' +
                        '</div> ' +
                        '<div class="panel-body"> ' +
                            '<form class="form-horizontal form-bordered"> ' +
                                '<div id="container'+ chartNumber + '" class="panel-body"> </div> ' +
                            '</form> ' +
                        '</div> ' +
                    '</div> ' +
                '</div>');
        ///$('#contet-row').render();

        //var pannel = $('#content-row').append('div').attr({"class": "dol-md-12", "id": "ucontainer"+chartNumber}).append('div').attr("class", "panel panel-inverse");
        //var pannelInside = pannel.append('div').attr("class", "panel-heading-btn");
        //pannelInside.append('a').attr({"href": "javascript:;", "class": "btn btn-xs btn-icon btn-circle btn-default", "data-click": "panel-expand"}).append('i').attr("class", "fa fa-expand");
        //pannelInside.append('a').attr({"href": "javascript:;", "class": "btn btn-xs btn-icon btn-circle btn-success", "data-click": "panel-reload"}).append('i').attr("class", "fa fa-repeat");
        //pannelInside.append('a').attr({"href": "javascript:;", "class": "btn btn-xs btn-icon btn-circle btn-warning", "data-click": "panel-collapse"}).append('i').attr("class", "fa fa-minus");
        //pannel.append('h4').attr("class", "panel-title").text("Chart");
        //pannel.append('div').attr("class", "panel-body").append('form').attr("class", "form-horizontal form-bordered").append('div').attr({ "id": "container" + chartNumber, "class": "panel-body" });
        //console.log(pannel);
        $('#ucontainer' + chartNumber).trigger('create');
        myChart[chartNumber - 1] = new highChart("container" + chartNumber);
        $('#content-row1').render();
    }
    else {
        console.log("Maximum number of charts reached already.");
        alert("Maximum number of charts reached already.");
    }
}

function loadedNodes(data) {
    //saving nodes...we will need them to get unit types and such when drawing charts
    myNodes = JSON.parse(data);
    updateDate(); //displays proper dates also when page starts
    $('#loading1').text('Data type');
}

function updateDate() {
    if (myChart[myChart.length - 1].chart.series.length > 0) {
        updateDate1();
        return;
    }
    dataTyp = $('#ch-sensor option:selected').val();
    found = false;
    counter = 0;
    counter2 = 0;
    while (!found && counter < myNodes.length) {
        counter2 = 0;
        while (!found && counter2 < myNodes[counter].Sensors.length) {
            if (myNodes[counter].Sensors[counter2].Name == dataTyp) {
                found = true;
            }
            counter2++;
        }
        counter++;
    }
    counter--;
    counter2--;
    endDate = myNodes[counter].Sensors[counter2].EndDate.split("-");
    startDate = myNodes[counter].Sensors[counter2].StartDate.split("-");
    $('#start').datepicker('setDate', new Date(endDate[0], endDate[1] - 1, endDate[2] - 7));
    $('#end').datepicker('setDate', new Date(endDate[0], endDate[1] - 1, endDate[2]));
    //??? why doesnt setting min/max work?
    //$('#start').datepicker('option', {'minDate': new Date(startDate[0], startDate[1]-1, startDate[2]), 'maxDate': new Date(endDate[0], endDate[1] - 1, endDate[2])});
    //$('#end').datepicker('option', {'minDate': new Date(startDate[0], startDate[1]-1, startDate[2]), 'maxDate': new Date(endDate[0], endDate[1] - 1, endDate[2])});
    $('#start').datepicker('render');
    $('#end').datepicker('render');
    if (found) {
        namesToLocations[dataTyp] = { "fst": counter, "snd": counter2 };
    }
}

function updateDate1() {
    dataTyp = $('#ch-sensor option:selected').val();
    found = false;
    counter = 0;
    counter2 = 0;
    while (!found && counter < myNodes.length) {
        counter2 = 0;
        while (!found && counter2 < myNodes[counter].Sensors.length) {
            if (myNodes[counter].Sensors[counter2].Name == dataTyp) {
                found = true;
            }
            counter2++;
        }
        counter++;
    }
    counter--;
    counter2--;
    if (found) {
        namesToLocations[dataTyp] = { "fst": counter, "snd": counter2 };
    }
    endDate = myNodes[counter].Sensors[counter2].EndDate.split("-");
    startDate = myNodes[counter].Sensors[counter2].StartDate.split("-");
    endDate1 = $('#end').val();
    if (compareDates($('#start').val(), myNodes[counter].Sensors[counter2].StartDate))
    {
        if (compareDates(endDate1, myNodes[counter].Sensors[counter2].StartDate)) {
            //if we do not do this we cannot set start date, because end would be smaller than start
            $('#end').datepicker('setDate', new Date(startDate[0], startDate[1] - 1, startDate[2] + 1));
        }
        $('#start').datepicker('setDate', new Date(startDate[0], startDate[1] - 1, startDate[2]));
    }
    if (compareDates(myNodes[counter].Sensors[counter2].EndDate, endDate1))
    {
        $('#end').datepicker('setDate', new Date(endDate[0], endDate[1] - 1, endDate[2]));
    }
    //??? why doesnt setting min/max work?
    //$('#start').datepicker('option', {'minDate': new Date(startDate[0], startDate[1]-1, startDate[2]), 'maxDate': new Date(endDate[0], endDate[1] - 1, endDate[2])});
    //$('#end').datepicker('option', {'minDate': new Date(startDate[0], startDate[1]-1, startDate[2]), 'maxDate': new Date(endDate[0], endDate[1] - 1, endDate[2])});
    if (!compareDates(endDate, startDate) && !compareDates(startDate, endDate)) alert("Date interval is uncompatible with selected data.");
    //??? preverjaj ce je interval prazen, preden ga nastavis
}

function compareDates(date1, date2) {
    //returns true if date1 is before date2 and false otherwise
    date1 = date1.split("-");
    date2 = date2.split("-");
    if (date1[0] < date2[0]) {
        return true;
    }
    else {
        return false;
    }
    if (date1[1] < date2[1]) {
        return true;
    }
    else {
        return false;
    }
    return date1[2] < date2[2];
}

var handleSelectpicker = function () {
    $('.selectpicker').selectpicker('render');
};

function loadedSensors(data) {
    // loading sensors into html
    var sensors = JSON.parse(data);
    var str;
    console.log("Number of sensors: "+sensors.length);
    for (i = 0; i < sensors.length; i++) {
        str = sensors[i].str;
        if (str.indexOf("alarm") == -1) $("<option value=\"" + sensors[i].str + "\">" + str + "</option>").appendTo("#ch-sensor");
    }
    handleSelectpicker();
    $('#loading1').text('Data type');
};



function highChart(container) {
    //chart class, draws charts
    this.data = [];
    this.timeInterval;
    this.dateStart;
    this.dateEnd;
    this.aggregateType;
    this.dataType;
    this.raw;
    this.chart = newChart(container);
    this.chart.yAxis[0].remove();

    this.deleteLastSeries = function () {
        $('#loadingChart' + chartNumber).text('Removing last added series ...');
        var titl;
        var titl1;
        //removing series
        if (this.chart.series.length > 0) {
            titl = this.chart.series[this.chart.series.length - 1].options.yAxis;
            titl1 = this.chart.series[this.chart.series.length - 1].options.name;
            this.chart.series[this.chart.series.length - 1].remove();
            console.log("Removed last added series: "+titl1+".");
        }
        else {
            console.log("No series left to remove.");
            alert("ERROR no series left to remove.");
        }
        //removing y axis if no longer needed
        found = false;
        counter = 0;
        while (!found && counter < this.chart.series.length) {
            if (this.chart.series[counter].options.yAxis == titl) {
                found = true;
            }
            counter++;
        }
        if (!found) {
            console.log("Removing unnecessary y axis: "+titl+".");
            found = false;
            counter = 1;
            while (!found && counter < this.chart.yAxis.length) {
                if (this.chart.options.yAxis[counter].id == titl) {
                    found = true;
                    this.chart.yAxis[counter].remove()
                }
                counter++;
            }
        }
        if (this.chart.series.length == 0 && this.chart.yAxis.length != 0) {
            this.chart.yAxis[0].remove();
        }
        $('#loadingChart' + chartNumber).text('Rendering chart ...');
        this.chart.redraw();
        $('#loadingChart' + chartNumber).text('Chart');
    };
    this.addSeries = function () {
        //collecting data from form
        $('#loadingChart' + chartNumber).text('Adding new series ...');
        this.timeInterval = correctTimeInterval($('#time-interval option:selected').val());
        this.dateStart = $('#start').val();
        this.dateEnd = $('#end').val();
        this.aggregateType = $('#aggregate-type option:selected').val();
        if (this.aggregateType) this.aggregateType = this.aggregateType.toLowerCase();
        this.dataType = $('#ch-sensor option:selected').val();
        if (this.timeInterval == "Raw") {
            if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 50) {
                alert("Too much data. Please select a smaller interval.");
                return;
            }
            this.raw = "Yes";
        }
        else {
            if (this.timeInterval == "1h") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 62) {
                    alert("Too much data. Please select a smaller interval (less than 2 months), or a bigger sampling interval.");
                    $('#loadingChart' + chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "6h") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 300) {
                    alert("Too much data. Please select a smaller interval (less than 7 months), or a bigger sampling interval.");
                    $('#loadingChart' + chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "1d") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 1000) {
                    alert("Too much data. Please select a smaller interval (less than 2.5 years), or a bigger sampling interval.");
                    $('#loadingChart' + chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "1w") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 4000) {
                    alert("Too much data. Please select a smaller interval (less than 10 years), or a bigger sampling interval.");
                    $('#loadingChart' + chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "1m") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 13000) {
                    alert("Too much data. Please select a smaller interval (less than 30 years), or a bigger sampling interval.");
                    $('#loadingChart' + chartNumber).text('Chart');
                    return;
                }
            }
            else if (this.timeInterval == "1y") {
                if (dateDiff(this.dateStart.split("-"), this.dateEnd.split("-")) > 100000) {
                    alert("Too much data. Please select a smaller interval (less than 200 years), or a bigger sampling interval.");
                    $('#loadingChart' + chartNumber).text('Chart');
                    return;
                }
            }
            this.raw = "No";
        }
        var myUrl;
        if (this.raw == "No") {
            myUrl = '/api/get-aggregates?p=' + escape(this.dataType) + ':' + this.aggregateType + ':' + this.timeInterval + ':' + this.dateStart + ':' + this.dateEnd;
        }
        else if (this.raw == "Yes") {
            myUrl = '/api/get-measurements?p=' + escape(this.dataType) + ':' + this.dateStart + ':' + this.dateEnd;
        }
        else {
            console.log("ERROR in checking equality!")
        }

        $.ajax({
            url: myUrl,
            success: function (data1) { this.loadedAggregates(data1, this.dataType, this.aggregateType, this.timeInterval) },
            context: this
        });
    };
    this.loadedAggregates = function (data1, dataType, aggregateType, timeInterval) {
        //extracting info about data
        datayDescription = "N/A";
        datayUnit = "N/A";
        //found = false;
        //counter = 0;
        //counter2 = 0;
        //while (!found && counter < myNodes.length) {
        //    counter2 = 0;
        //    while (!found && counter2 < myNodes[counter].Sensors.length) {
        //        if (myNodes[counter].Sensors[counter2].Name == dataType) {
        //            found = true;
        //            datayDescription = myNodes[counter].Sensors[counter2].Phenomenon;
        //            datayUnit = myNodes[counter].Sensors[counter2].UoM;
        //        }
        //        counter2++;
        //    }
        //    counter++;
        //}
        //this replaces commented above
        if (namesToLocations[dataType]) {
            found = true;
            counter = namesToLocations[dataType].fst;
            counter2 = namesToLocations[dataType].snd;
            datayDescription = myNodes[counter].Sensors[counter2].Phenomenon;
            datayUnit = myNodes[counter].Sensors[counter2].UoM;
        }
        else {
            found = false;
        }

        if (found == false) {
            console.log("ERROR: Data info not found in nodes.");
        }
        if (datayDescription == "" || datayDescription == "-") datayDescription = "N/A";
        if (datayUnit == "" || datayUnit == "-") datayUnit = "N/A";

        //checking if additional y axis needed because unit does not exist yet or scales are too diferent
        //find all y axis with same unit
        var axisData = [];
        for (i = 0; i < this.chart.yAxis.length; i++) {
            if (this.chart.options.yAxis[i].title.text == datayUnit) {
                axisData[axisData.length] = {
                    "index": i,
                    "min": this.chart.options.yAxis[i].min,
                    "max": this.chart.options.yAxis[i].max
                };
            }
        }
        //outputing collected data (& after finding min/max deciding if adding new axis)
        var data2 = JSON.parse(data1);
        console.log("Added data length: " + data2.length);
        this.data[this.data.length] = data2;
        
        var data1 = [];
        var date;
        var timedate;
        var min = Infinity;
        var max = -Infinity;
        for (j = 0; j < data2.length; j++) {
            timedate = data2[j].Timestamp.split("T");
            date = timedate[0].split("-");
            time = timedate[1].split(":");
            data1[data1.length] = [Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]), data2[j].Val]
            if (data2[j].Val < min) {
                min = data2[j].Val;
            }
            else if (data2[j].Val > max) {
                max = data2[j].Val;
            }
        }
        //adding y axis if needed
        addedNumber = ""; //number added to axis id so we can seperate axis with same unit
        i = 0;
        axisIndex = -1;
        addAxis = true;
        while (addAxis && i < axisData.length) {
            // /3 gives us effectively maximum 6x the scale size (but only maximum 3x up and 3x down)
            if (axisData[i].max - axisData[i].min > Math.abs(axisData[i].max - max) / 3 &&
                axisData[i].max - axisData[i].min > Math.abs(axisData[i].min - min) / 3  ) {
                //in this case we already have an appropriate axis
                addAxis = false;
                axisIndex = axisData[i].index;
            }
            i++;
        }
        newMin = min - (max - min) * 0.1;
        newMax = max + (max - min) * 0.1;
        if (addAxis) {
            console.log("Adding new axis: " + datayUnit + addedNumber + ".")
            if (axisData.length != 0) {
                addedNumber = axisData.length;
            }
            this.chart.addAxis({
                id: datayUnit + addedNumber,
                title: {
                    text: datayUnit + addedNumber
                },
                min: newMin,
                max: newMax
            });
        }
        else {
            if (i - 1 != 0) {
                addedNumber = i - 1; //i-1 is where we found the right axis to add data on
            }
        }
        //adding data
        $('#loadingChart' + chartNumber).text('Rendering chart ...');
        this.chart.addSeries({
            type: 'line',
            data: data1,
            name: dataType + "(" + timeInterval + "-" + aggregateType + ")" + ": " + datayDescription + " - " + datayUnit + addedNumber,
            yAxis: datayUnit + addedNumber
        });
        if (axisIndex != -1) {
            this.chart.options.yAxis[axisIndex].min = Math.min(newMin, this.chart.options.yAxis[axisIndex].min);
            this.chart.options.yAxis[axisIndex].max = Math.max(newMax, this.chart.options.yAxis[axisIndex].max);
            this.chart.yAxis[axisIndex].min = Math.min(newMin, this.chart.options.yAxis[axisIndex].min);
            this.chart.yAxis[axisIndex].max = Math.max(newMax, this.chart.options.yAxis[axisIndex].max);
            this.chart.yAxis[axisIndex].options.startOnTick = true;
            this.chart.yAxis[axisIndex].options.endOnTick = true;
            this.chart.yAxis[axisIndex].setExtremes(this.chart.options.yAxis[axisIndex].min, this.chart.options.yAxis[axisIndex].max);
        }
        
        this.chart.redraw();
        $('#loadingChart' + chartNumber).text('Chart');
        console.log("Added series: " + dataType + "(" + timeInterval + "-" + aggregateType + ")" + ": " + datayDescription + " - " + datayUnit + addedNumber + ".");
    };
};

function correctDate(date) {
    //corrects date because it is in wrong format
    date = date.split("-");
    if (date.length != 3) {
        console.log("ERROR: provided date is in wrong format.")
    }
    return date[2] + "-" + date[1] + "-" + date[0];
};

function correctTimeInterval(ti) {
    //time intervals map: Raw -> Raw, 1h -> 1h, 6h -> 6h, 1 day -> 1d, 1 week -> 1w, 1 month -> 1m, 1 year -> 1y
    ti = ti.split(" ");
    if (ti.length < 2) {
        return ti[0];
    }
    else {
        return ti[0] + ti[1][0];
    }
}

function newChart(container) {
    //inits an empty highchart
    return new Highcharts.Chart({
        chart: {
            zoomType: 'x',
            renderTo: container,
            height: '500'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                    'Click and drag in the plot area to zoom in' :
                    'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime',
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
    });
}

function disableAggregate() {
    value = $('#time-interval option:selected').val();
    if (value == "Raw") {   
        $('#aggregate-type').find('option').remove().end();
        $('#aggregate-type').prop('data-style', 'btn-inverse');
        $('#aggregate-type').prop('disabled', 'disabled');
        $('#aggregate-type').selectpicker('refresh');
    }
    else {
        $.each({ "EMA": "EMA", "MA": "MA", "MIN": "MIN", "MAX": "MAX", "CNT": "CNT", "SUM": "SUM", "VAR": "VAR" }, function (key, value) {
            $('#aggregate-type').append($("<option></option>").prop('value',value).text(key));
        });
        $('#aggregate-type').prop('data-style', 'btn-white');
        $('#aggregate-type').prop('disabled', false);
        $('#aggregate-type').selectpicker('refresh');
    }
}

function dateDiff(d1, d2) {
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
        monthsDiff = 12 - d1[1] - (-d2[1]);
        if (minusOne) monthsDiff -= 1;
        minusOne = true;
    }
    yearsDiff = d2[0] - d1[0];
    if (minusOne) yearsDiff -= 1;
    diff = 365 * yearsDiff - (-30 * monthsDiff - daysDiff);
    if (diff < 0) {
        console.log("ERROR date diff not supposed to be < 0.");
    }
    return diff;
}
