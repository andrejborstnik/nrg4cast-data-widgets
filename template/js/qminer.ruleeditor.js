var handleSelectpicker = function () {
    $('.selectpicker').selectpicker('render');
};

$('#accordion').on('show hide', function () {
    $(this).css('height', 'auto');
});
$('#accordion1').on('show hide', function () {
    $(this).css('height', 'auto');
});

function filterLoadedSensors(data, filter) {
    //saving nodes...we will need them to get unit types and such when drawing charts
    var myNodes = JSON.parse(data);
    var myNodes1 = [];
    for (counter = 0; counter < myNodes.length; counter++) {
        if (myNodes[counter].str.search(filter) != -1 && !myNodes[counter].alarm) {
            myNodes1.push(myNodes[counter]);
        }
    }
    loadedSensors(myNodes1);
};

$(document).ready(function () {
    $('.collapse.in').css('height', 'auto');
    $('#rulelevel').selectpicker('render');
    $('#alarmtype').selectpicker('render');
    $('#list-rules').selectpicker('render');
    //handleSelectpicker();
});

$.ajax({
    //reading available
    url: '/proxy.php?cmd=api/get-sensors',
    success: function (data) { filterLoadedSensors(data, filterConf); }
});

//??? why does create new rule only blink after first click (in html)

function loadedSensors(sensors) {
    // loading sensors into html
    var str;
    console.log("Number of sensors: " + sensors.length);
    for (i = 0; i < sensors.length; i++) {
        str = sensors[i].str;
        $("<option value=\"" + str + "\">" + str + "</option>").appendTo("#sv-sensor");
        $("<option value=\"" + str + "\">" + str + "</option>").appendTo("#sv-sensor1");
        $("<option value=\"" + str + "\">" + str + "</option>").appendTo("#sv-sensor2");
    }
    handleSelectpicker();
    $('#loading1').text("Create a new rule");
};


$(function () {
    var to = false;
    $('#q').keyup(function () {
        if (to) { clearTimeout(to); }
        to = setTimeout(function () {
            var v = $('#q').val();
            $('#jstree').jstree(true).search(v);
        }, 250);
    });

    $('#jstree').jstree({
        "core": {
            "animation": 1,
            "check_callback": true,
            "themes": { "stripes": true },
            'data': [{ "text": "Insert rule name (counts as AND)", "type": "root" }]
        },
        "types": {
            "#": { "max_depth": 8, "valid_children": ["root"] },
            "root": { "icon": "glyphicon glyphicon-circle-arrow-right", "valid_children": ["and", "or", "sensorval", "sensorsensor"] },
            "and": { "icon": "glyphicon glyphicon-ok-sign", "valid_children": ["and", "or", "sensorval", "sensorsensor"] },
            "or": { "icon": "glyphicon glyphicon-ok-circle", "valid_children": ["and", "or", "sensorval", "sensorsensor"] },
            "sensorval": { "icon": "glyphicon glyphicon-dashboard", "valid_children": [] },
            "sensorsensor": { "icon": "glyphicon glyphicon-transfer", "valid_children": [] }
        },
        "plugins": ["contextmenu", "dnd", "state", "types", "wholerow"]
    });
});

function parseTree() {
    //assuming one root
    var tree = $('#jstree').jstree(true).get_json()[0];
    var map = { 'lt;': '<', 'gt': '>', '=': '=', '!=': '!=' }; // maps html description to string value
    mapp = {}; //maps sensor types to their number represantative

    var pomo = parseTre(tree, 0, '@Name(\"' + tree.text + '\") select * from', ' where ', 'and '); //we assume the rule token counts as "and"
    var clause = pomo.prelude + pomo.rest;
    
    function parseTre(node, counter, prelude, rest, andOr) {
        var children = node.children;
        var prelude = prelude;
        var rest = rest
        var counter = counter;
        rest += '(';
        if (!children.length) {
            if (andOr == 'and ') {
                rest += 'true';
            }
            else if (andOr == 'or ') {
                rest += 'false';
            }
            else {
                console.log("ERROR not supposed to happen.");
                return;
            }
            rest += ')';
            if (prelude.slice(-1, prelude.length) == ',') {
                prelude = prelude.slice(0, -1);
            }
            return { 'prelude': prelude, 'counter': counter, 'rest': rest };
        }
        var i = 0;
        while (i < children.length) {
            child = children[i];
            if (child.type == 'sensorsensor') {
                //prelude
                if (!mapp[child.data.sensor[0]] && mapp[child.data.sensor[0]] != 0) {
                    mapp[child.data.sensor[0]] = counter;
                    counter += 1;
                    var pomo = child.data.sensor[0].split(".");
                    if (pomo.length == 1) {
                        prelude += ' Measurement(sensorId=\"' + child.data.sensor[0] + '\") as M' + mapp[child.data.sensor[0]] + ',';
                    }
                    else if (pomo.length == 2){
                        prelude += ' Measurement(sensorId=\"' + pomo[0] + '\").' + pomo[1] + ' as M' + mapp[child.data.sensor[0]] + ',';
                    }
                    else {
                        console.log("ERROR not supposed to happen.")
                    }
                }
                if (!mapp[child.data.sensor[1]] && mapp[child.data.sensor[1]] != 0) {
                    mapp[child.data.sensor[1]] = counter;
                    counter += 1;
                    var pomo = child.data.sensor[1].split(".");
                    if (pomo.length == 1) {
                        prelude += ' Measurement(sensorId="' + child.data.sensor[1] + '") as M' + mapp[child.data.sensor[1]] + ',';
                    }
                    else if (pomo.length == 2){
                        prelude += ' Measurement(sensorId="' + pomo[0] + '").' + pomo[1] + ' as M' + mapp[child.data.sensor[1]] + ',';
                    }
                    else {
                        console.log("ERROR not supposed to happen.")
                    }
                }
                //rest
                rest += 'M' + mapp[child.data.sensor[0]] + '.value ' + map[child.data.operator] + ' M' + mapp[child.data.sensor[1]] + '.value ' + andOr;
            }
            else if (child.type == 'sensorval') {
                //prelude
                if (!mapp[child.data.sensor[0]] && mapp[child.data.sensor[0]] != 0) {
                    mapp[child.data.sensor[0]] = counter;
                    counter += 1;
                    var pomo = child.data.sensor[0].split(".");
                    if (pomo.length == 1) {
                        prelude += ' Measurement(sensorId="' + child.data.sensor[0] + '") as M' + mapp[child.data.sensor[0]] + ',';
                    }
                    else if (pomo.length == 2) {
                        prelude += ' Measurement(sensorId="' + pomo[0] + '").' + pomo[1] + ' as M' + mapp[child.data.sensor[0]] + ',';
                    }
                    else {
                        console.log("ERROR not supposed to happen.")
                    }
                }
                //rest
                rest += 'M' + mapp[child.data.sensor[0]] + '.value ' + map[child.data.operator] + ' ' + child.data.sensor[1] + ' ' + andOr;
            }
            else {
                var pomo = parseTre(child, counter, prelude, rest, child.type + ' '); 
                if (prelude != pomo.prelude) {
                    prelude = pomo.prelude + ',';
                }
                rest = pomo.rest + ' ' + andOr; // and/or was removed, but was not supposed to be (not at the top of tree yet)
                counter = pomo.counter;
            }
            i++;
        }
        var sth = andOr.length;
        rest = rest.slice(0, -(sth + 1)) + ')'; // remove the last and/or with the space
        if (prelude.slice(-1, prelude.length) == ',') { // remove the last comma
            prelude = prelude.slice(0, -1);
        } 
        return { 'prelude': prelude, 'counter': counter, 'rest': rest };
    }

    if (clause.match(/[^"]*\) select \* from where .*/)) {
        alert("This is an empty rule.")
        return;
    }
    console.log("New rule:   Name: " + tree.text + ",\n             EPL code: "+clause);
    return {'epl': clause, 'name':tree.text};
};

function createRule() {
    var type = $("#error-message").val();
    var level = $("#alarm-type").val();
    var rule = parseTree();
    if (type == "" || level == "") {
        alert("Please input the alarm type and error message.");
        return;
    }
    if (!rule) { return; }
    rule["level"] = level;
    rule["type"] = type;
    rule["pilotName"] = filterConf;
    var url = '/proxy.php?cmd=Esper-Services/RegisterEventPattern?rule=' + JSON.stringify(rule);
    $.ajax({
        url: url,
        success: function (data) { alert(data); console.log(data); },
        error: function (data) { alert(data); console.log(data); }
    });
    // ??? when we are sure rule is saved we can 
    //restartRule();
    //and alert the user.
    return;
}

function removeRule() {
    // go to url.
    var name = $('#list-rules option:selected').text();
    var url = '/proxy.php?cmd=Esper-Services/EventPatternRemoval?name=' + name;
    $.ajax({
        url: url,
        success: function (data) { alert(data); console.log(data); getRules(); },
        error: function (data) { alert(data); console.log(data); }
    });
}

function getRules() {
    $('#loading2').text("Browse/delete existing rules (loading rules ...)");
    var url = '/proxy.php?cmd=Esper-Services/EventPatternRemoval';
    $.ajax({
        url: url,
        success: listRules,
        error: function () {$('#loading2').text("Browse/delete existing rules"); alert("Loading rules has failed, please try again."); return;}
    });
};

function listRules(rules) {
    //list them
    var str;
    var epl;
    var rules = JSON.parse(rules);
    console.log("Number of rules: " + rules.queries.length);
    $('#list-rules').empty();
    for (i = 0; i < rules.queries.length; i++) {
        str = rules.queries[i];//.str;
        epl = str.epl.replace('"', '');
        while (epl != epl.replace('"', '')) {
            epl = epl.replace('"', '');
        }
        $('<option value=\"' + epl + '\">' + str.name + '</option>').appendTo('#list-rules');
    }
    $('#list-rules').selectpicker('refresh');
    //$('#list-rules').selectpicker('render');
    $('#loading2').text("Browse/delete existing rules");
    showRule();
};

function showRule() {
    var rule = $('#list-rules option:selected').val();
    $('#show-rule').empty();
    $('#show-rule').append("<p>" + rule + "</p>"); //append its epl, when returned
}

function isCorrect(ti) {
    // ti is already split with " ".
    // looking for 1 day 10 seconds ... format
    var map = {
        "years": "years",
        "year": "years",
        "months": "months",
        "month": "months",
        "days": "days",
        "day": "days",
        "hour": "hours",
        "hours": "hours",
        "min": "minutes",
        "minute": "minutes",
        "minutes": "minutes",
        "sec": "seconds",
        "seconds": "seconds",
        "second": "seconds",
        "msec": "miliseconds",
        "miliseconds": "miliseconds",
        "milisecond": "miliseconds"
    };
    var map1 = {
        "years": 0,
        "months": 1,
        "days": 2,
        "hours": 3,
        "minutes": 4,
        "seconds": 5,
        "miliseconds": 6

    };
    var j = 0;
    var lastUsed = -1;
    var lastNumber = -1;
    for (var i = 0; i < ti.length; i++) {
        if (j == 0 && isNaN(parseInt(ti[i]))) {
            return false;
        }
        else if (j == 0) {
            lastNumber = parseInt(ti[i]);
        }
        else if (j == 1) {
            if (map[ti[i]] && map1[map[ti[i]]] > lastUsed) {
                if (lastNumber != 1 && (ti[i][ti[i].length - 1] != "s" && ti[i] != "sec" && ti[i] != "min" && ti[i] != "msec")) {
                    return false;
                }
                else if (lastNumber == 1 && ti[i][ti[i].length - 1] == "s") {
                    return false;
                }
                else {
                    lastUsed = map1[map[ti[i]]];
                }
            }
            else if (map[ti[i]]) {
                return false;
            }
        }
        else {
            console.log("ERROR not supposed to happen.");
            return;
        }
        j = 1 - j;
    }
    return true;
}

function create(tType) {
    var ref = $('#jstree').jstree(true);
    sel = ref.get_selected();
    if (!sel.length) { return false; }
    sel = sel[0];
    var map = { 'lt;': '<', 'gt': '>', '=': '=', '!=': '!=' };
    //??? v deliverablu izbriši \" pri time windowih
    if (tType == 'sensorsensor') {
        var sensor1 = $("#sv-sensor1 option:selected").val();
        var sensor2 = $("#sv-sensor2 option:selected").val();
        var operator = $("#sv-operator1 option:selected").val();
        var timewindow = $("#window2").val();
        var wintype = $("#wintype2 option:selected").val();
        var pomo = timewindow.split(" ");
        if (!sensor1 || !sensor2 || !operator || !timewindow) {
            alert("Please select/input all requiered fields.")
            return;
        }
        if (!(wintype == "None") && (pomo.length < 2 || !isCorrect(pomo))) {
            alert("Please insert a proper time window. Example: 10 seconds 100 miliseconds.");
            return;
        }
        if (wintype != "None") {
            data = { 'sensor': [sensor1 + ".win:" + wintype + "(" + timewindow + ")", sensor2 + ".win:" + wintype + "(" + timewindow + ")"], 'operator': operator };
            sel = ref.create_node(sel, { "type": tType, "text": sensor1 + ".win:" + wintype + "(" + timewindow + ")" + " " + map[operator] + " " + sensor2 + ".win:" + wintype + "(" + timewindow + ")", "data": data });
        }
        else {
            data = { 'sensor': [sensor1, sensor2], 'operator': operator };
            sel = ref.create_node(sel, { "type": tType, "text": sensor1 + " " + map[operator] + " " + sensor2, "data": data });
        }
    }
    else if (tType == 'sensorval') {
        var sensor = $("#sv-sensor option:selected").val();
        var value = parseFloat($("#sv-value").val());
        var operator = $("#sv-operator option:selected").val();
        var timewindow = $("#window1").val();
        var wintype = $("#wintype1 option:selected").val();
        var pomo = timewindow.split(" ");
        if (!sensor || (!value && value != 0) || !operator || !timewindow) {
            alert("Please select/input all requiered fileds.")
            return;
        }
        if (!(wintype == "None") && (pomo.length < 2 || !isCorrect(pomo))) {
            alert("Please insert a proper time window. Example: 10 seconds 100 miliseconds.");
            return;
        }
        if (wintype != "None") {
            data = { 'sensor': [sensor + ".win:" + wintype + "(" + timewindow + ")", value], 'operator': operator };
            sel = ref.create_node(sel, { "type": tType, "text": sensor + ".win:" + wintype + "(" + timewindow + ")" + " " + map[operator] + " " + value, "data": data });
        }
        else {
            data = { 'sensor': [sensor, value], 'operator': operator };
            sel = ref.create_node(sel, { "type": tType, "text": sensor + " " + map[operator] + " " + value, "data": data });
        }
    }
    else if (tType == 'or') {
        sel = ref.create_node(sel, { "type": tType, "text": 'OR' });
    }
    else if (tType == 'and') {
        sel = ref.create_node(sel, { "type": tType, "text": 'AND' });
    }
    else { console.log("ERROR: not supposed to happen."); }
    if (sel) {
        ref._open_to(sel);
    }
};

function rename() {
    var ref = $('#jstree').jstree(true),
    sel = ref.get_selected();
    if (!sel.length) { return false; }
    sel = sel[0];
    ref.edit(sel);
};

function tdelete() {
    var ref = $('#jstree').jstree(true);
    sel = ref.get_selected();
    if (!sel.length) { return false; }
    //do not remove root
    if (sel[0] != "j1_1") { ref.delete_node(sel); }
    else { alert("Removing the root is disabled. If you want to start a new tree click the appropriate button instead."); return false; }
};

function restartRule() {
    var ref = $('#jstree').jstree(true);
    ref.delete_node("j1_1");
    ref.create_node("#", { "type": "root", "text": "Insert rule name (counts as AND)", "id":"j1_1" });
    return;
};
