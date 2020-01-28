// defines
const DATASET_DENDRO = 0;
const DATASET_WATER = 1;
const DATASET_TEMP = 2;
const DATASET_LUCHT = 3;

const GRAPH_COLOR_DENDRO = '#00ff00';
const GRAPH_COLOR_WATER = '#0000ff';
const GRAPH_COLOR_TEMP = '#ff0000';
const GRAPH_COLOR_LUCHT = '#ff8800';

const GRAPH_TYPE_DENDRO = 'line';
const GRAPH_TYPE_WATER = 'bar';
const GRAPH_TYPE_TEMP = 'line';
const GRAPH_TYPE_LUCHT = 'bar';

const GRAPH_DATASET_LABLE = [
    "Vruchtgrootte",
    "Bodemvochtigheid",
    "Temperatuur",
    "Luchtvochtigheid",
];
const FLAG_NUM_FLAGS = 4;

// global vars
var data_measure_view = "month";
var data_measure = [];
var date_low;
var date_high;
var data_measure_filtered = [];

/*
unchanged:
	id
	fruit_type
	date_time
	module_id
*/

function view_of_year(date, view) {
    if (view == "hour") {
        return date.getFullYear() + " " + date.getMonth() + " " + date.getDate() + " " + date.getHours();
    }
    if (view == "day") {
        return date.getFullYear() + " " + date.getMonth() + " " + date.getDate();
    }
    if (view == "week") {
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        var year_start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - year_start) / 86400000) + 1) / 7);
    }
    if (view == "year") {
        return date.getFullYear();
    }
    return date.getMonth();
}

function filter_view(view) {
    var objects = [];
    $.each(data_measure, function (index, element) {
        if (element.date_time >= date_low && element.date_time <= date_high) {
            objects.push(element);
        }
    });
//	var objects = data_measure.slice();
    var cur_view = 0;
    var cur_view_objects = [];
    var out = []; //output for average values for each view

    while (objects.length > 0) {
        cur_view = view_of_year(objects[0].date_time, view);

        /* get all objects from the same view */
        $.each(objects, function (index, element) {
            if (view_of_year(element.date_time, view) == cur_view) {
                cur_view_objects.push(element);
            }
        });

        /* get the average of all objects in cur_view_objects */
        var cur_object_values = [[]]; //for all values from all objects in the same view window
        var cur_object = []; //for the average calculated value of above multidimentional array
        var fields = ["id", "date_time", "module_id", "module_name", "fruit_type_id"]; //fields to be excluded from average calculation

        //push all objects from te same view window to cur_object
        $.each(cur_view_objects, function (index, object) {
            for (var key in object) {
                if (object[key] !== null && !fields.includes(key)) {
                    if (cur_object_values[key] == null)
                        cur_object_values[key] = [];
                    cur_object_values[key].push(object[key]);
                }
            }
            cur_object["date_time"] = object["date_time"];

            //remove objects to prevent infinite loop
            objects.splice(objects.indexOf(object), 1);
        });

        //calculate average values from cur_object
        for (var key in cur_object_values) {
            var sum = 0; //summation of all values
            $.each(cur_object_values[key], function (index, value) {
                sum += parseFloat(value);
            });
            cur_object[key] = sum / cur_object_values[key].length;
        }

        /* Push object to out and cleanup variables */
        out.push(cur_object);
        cur_view_objects = []; //empty view window
    }
    return out;
}

// graph data control
function graph_fill_by_flags(typeid) {
    for (var i = 0; i < FLAG_NUM_FLAGS; i++) {
        graph_set_dataset(i);
    }
    weergaveLabels(data_measure_view, data_measure_filtered);
}

function graph_set_dataset(setnr) {
    var data = [];
    $.each(data_measure_filtered, function (index, element) {
        var val;
        switch (setnr) {
            case DATASET_DENDRO:
                val = element.dendrometer;
                break;
            case DATASET_WATER:
                val = element.watermark;
                break;
            case DATASET_TEMP:
                val = element.temperature;
                break;
            case DATASET_LUCHT:
                val = element.humidity;
                break;
        }
        data.push(val);
    });
    chart_out.data.datasets[setnr].data = data;
    chart_out.data.datasets[setnr].label = GRAPH_DATASET_LABLE[setnr];
    chart_out.update();
}

function graph_clr_dataset(setnr) {
    chart_out.data.datasets[setnr].data = [];
    chart_out.update();
}

// ui interaction
// dropdowns
$('select[id=slc_soort]').change(function () {
    var value = $(this).val();
    fetch_data_measure_by_type(value);
});
$('select[id=slc_weergave]').change(function () {
    var value = $(this).val();
    data_measure_view = value;
    data_measure_filtered = filter_view(data_measure_view);
    graph_fill_by_flags();
    table_fill();
});
//dates
$('input[id=dte_begin]').change(function () {
    var value = $(this).val();
    date_low = new Date(value);
    data_measure_filtered = filter_view(data_measure_view);
    graph_fill_by_flags();
    table_fill();
});
$('input[id=dte_end]').change(function () {
    var value = $(this).val();
    date_high = new Date(value);
    data_measure_filtered = filter_view(data_measure_view);
    graph_fill_by_flags();
    table_fill();
});

// init chart
var cnv_graph = document.getElementById("cnv_graph").getContext("2d");
var chart_out = new Chart(cnv_graph, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            yAxisID: 'axistemp',
            data: [],
            type: GRAPH_TYPE_DENDRO,
            borderColor: GRAPH_COLOR_DENDRO,
            fill: false,
            hoverBorderWidth: 3,
            hoverBorderColor: '#000000',
            order: 1,
        },
            {
                yAxisID: 'axis1',
                data: [],
                type: GRAPH_TYPE_WATER,
                backgroundColor: GRAPH_COLOR_WATER,
                hoverBorderWidth: 3,
                hoverBorderColor: '#000000',
                order: 3,
            },
            {
                yAxisID: 'axis1',
                type: 'line',
                data: [],
                type: GRAPH_TYPE_TEMP,
                borderColor: GRAPH_COLOR_TEMP,
                fill: false,
                hoverBorderWidth: 3,
                hoverBorderColor: '#000000',
                order: 2,
            },
            {
                yAxisID: 'axis1',
                data: [],
                type: GRAPH_TYPE_LUCHT,
                backgroundColor: GRAPH_COLOR_LUCHT,
                hoverBorderWidth: 3,
                hoverBorderColor: '#000000',
                order: 4,
            }]
    },
    options: {
        title: {
            display: false,
            text: "Grafiek  titel",
            fontSize: 23,
        },
        legend: {
            display: true,
            position: 'bottom',
            fullwidth: true,
        },
        scales: {
            yAxes: [{
                id: 'axis1',
                ticks: {
                    beginAtZero: true
                },
                type: 'linear',
                position: 'left',
            },
                {
                    id: 'axistemp',
                    type: 'linear',
                    position: 'right',
                }]
        }
    }
});

// ajax
var BASE_URL = "https://floriandh.sinners.be/pcfruit/";
var URL_MEASURE = BASE_URL + "api/measurement/read.php";
var URL_MEASURE_TYPE = BASE_URL + "api/measurement/readByType.php?id=";
var URL_FRUIT_TYPE = BASE_URL + "api/fruit_type/read.php";
var URL_NOTIFICATION = BASE_URL + "api/notification/read.php";

function fetch_data_measure_by_type(typeid) {
    $.ajax({
        url: URL_MEASURE_TYPE + typeid,
        dataType: 'json',
        success: function (data) {
            data_measure = [];
            $.each(data, function (index, element) {
                var date = element.date_time;
                element.date_time = new Date(Date.parse(date));
                data_measure.push(element);
            });
            data_measure_filtered = filter_view(data_measure_view);
            graph_fill_by_flags();
            table_fill();
        }
    })
    weergaveLabels(typeid, data_measure);
}

function fetch_data_measure() {
    $.ajax({
        url: URL_MEASURE,
        dataType: 'json',
        success: function (data) {
            data_measure = [];
            $.each(data, function (index, element) {
                var date = element.date_time;
                element.date_time = new Date(Date.parse(date));
                data_measure.push(element);
            });
            data_measure_filtered = filter_view(data_measure_view)
            graph_fill_by_flags();
            table_fill();
        }
    })
}

function table_fill() {
	$('#data_table_body').empty();
	const dataSorted = data_measure_filtered.sort(function(obj2, obj1){return obj1.date_time - obj2.date_time});
    $.each(dataSorted, function (index, element) {
        var content = "<tr>";
        content += "<td>";
        content += dateFormat(element.date_time, true);
        content += "</td>";
		content += "<td>";
		content += element.module_name;
		content += "</td>";
        content += "<td>";
        content += element.dendrometer != null ? element.dendrometer.toFixed(2) : "";
        content += "</td>";
        content += "<td>";
        content += element.watermark != null ? element.watermark.toFixed(2) : "";
        content += "</td>";
        content += "<td>";
        content += element.temperature != null ? element.temperature.toFixed(2) : "";
        content += "</td>";
        content += "<td>";
        content += element.humidity != null ? element.humidity.toFixed(2) : "";
        content += "</td>";
        content += "</tr>";
        $('#data_table_body').append(content);
    })
}

function fill_notifications() {
    $.ajax({
        url: URL_NOTIFICATION,
        dataType: 'json',
        success: function (data) {
            $.each(data, function (index, element) {
				var date = element.date_time;
                element.date_time = new Date(Date.parse(date));
                var bg = element.severity == "alert" ? "rgba(220, 53, 69, 0.5)" : "rgba(255, 193, 7, 0.5)";
                var text = element.severity == "alert" ? "text-light" : "text-muted";
                var content = "<li class='mb-1' style='background-color: " + bg + "'>";
                content += "<div class='row ml-2'>";
                content += "<div class='col-auto'>";
                content += "<div class='row'>";
                content += "<h4 class='mb-0'>" + element.title + "</h4>";
                content += "</div>";
                content += "<div class='row'>";
                content += "<span class='" + text + "'>" + element.description + "</span>";
                content += "</div>";
                content += "</div>";
                content += "<div class='col-auto'>";
                content += "<p>" + dateFormat(element.date_time, false) + "</p>";
                content += "</div>";
                content += "</div>";
                content += "</li>";
                $('#notificationFeed').append(content);
            });
        }
    })
}

function fill_select_soort() {
    $.ajax({
        url: URL_FRUIT_TYPE,
        dataType: 'json',
        success: function (data) {

            $.each(data, function (index, element) {
                var content = "<option";
                content += " value=\"" + element.id + "\"";
                content += ">";
                content += element.name;
                content += "</option>";
                $('#slc_soort').append(content);
            });
        }
    })
}

function changeDateSelect() {
    $.ajax({
        url: URL_FRUIT_TYPE,
        dataType: 'json',
        success: function (data) {

            $.each(data, function (index, element) {
                var content = "<option";
                content += " value=\"" + element.id + "\"";
                content += ">";
                content += element.name;
                content += "</option>";
                $('#slc_soort').append(content);
            });
        }
    })
}


function ui_init() {
	data_measure_view = $('#slc_weergave').val();

	date_high = new Date($('#dte_end').val());
	date_low = new Date($('#dte_begin').val());

	if(!(date_high instanceof Date) || isNaN(date_high)) {
		date_high = Date.parse("1/1/2030");
		$('#dte_end').valueAsDate = date_high;
	}

	if(!(date_low instanceof Date) || isNaN(date_low)) {
		date_low= Date.parse("1/1/2000");
		$('#dte_begin').valueAsDate = date_low;
	}
}

function dateFormat(date, time) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();

    var dayZero = "";
    var monthZero = "";
    var hourZero = "";
    var minuteZero = "";

    if (day < 10) {
        dayZero = "0";
    }

    if (month < 10) {
        monthZero = "0";
    }

    if (hour < 10) {
        hourZero = "0";
    }

    if (minute < 10) {
        minuteZero = "0";
    }

    if (time == true) {
        return dayZero + day + "/" + monthZero + month + "/" + year + " " + hourZero + hour + ":" + minuteZero + minute;

    } else {
        return dayZero + day + "/" + monthZero + month + "/" + year;
    }

}

function weergaveLabels(weergave, data) {
    const labels = [];
    switch (weergave) {
        case 'hour' ://Hour
            $.each(data, function (index, element) {
                hour = element.date_time.getHours();
                day = element.date_time.getDate();
                month = getMonth(element.date_time.getMonth() + 1);
                labels.push(day + " " + month + " " + hour + ":00");
            });
            break;
        case 'day' ://Day
            $.each(data, function (index, element) {
                day = element.date_time.getDate();
                month = getMonth(element.date_time.getMonth() + 1);
                year = element.date_time.getFullYear().toString().substr(-2);
                labels.push(day + ' ' + month + ' ' + year);
            });
            break;
        case 'week' ://Week
            $.each(data, function (index, element) {
                day = element.date_time.getDate();
                month = getMonth(element.date_time.getMonth() + 1);
                year = element.date_time.getFullYear().toString().substr(-2);
                labels.push(day + ' ' + month + ' ' + year);
            });
            break;
        case 'month' ://Month
            $.each(data, function (index, element) {
                month = getMonth(element.date_time.getMonth() + 1);
                year = element.date_time.getFullYear().toString().substr(-2);
                labels.push(month + ' ' + year);
            });
            break;
        case 'year' ://Year
            $.each(data, function (index, element) {
                year = element.date_time.getFullYear().toString().substr(-2);
                labels.push(year);
            });
            break;
    }
    chart_out.data.labels = labels;
    chart_out.update();
    return labels;
}

function getMonth(month) {
    var months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return months[month - 1];
}

fetch_data_measure();
fill_select_soort();
fill_notifications();
ui_init();
