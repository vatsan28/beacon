//Progress Bar
$(function() {
	progressVals = 4
	val = 1;
	console.log(progressVals)
	while (val < progressVals) {
		console.log("#progressbar" + val)
		$("#progressbar" + val).progressbar({
			value: val * 10
		});
		$("#progress-label" + val).text(val + "/10");
		val++;
	}
});
//DatePicker
$(function() {
	$("#datepicker").datepicker({
		minDate: -20,
		maxDate: "+1M +10D"
	});
});
$("#datepicker").datepicker("setDate", "04/16/2017");
$("#datepicker").datepicker("setDate", "04/17/2017");
//Category Suggestion
$(function() {
	var availableTags = ["Tutor", "Chef", "Web Developer", "Photographer", "Errands"];
	$("#tags").autocomplete({
		source: availableTags,
		select: function(e, ui) {
			inputChange(ui.item.label);
		},
	});
});
//Accordion 
$(function() {
	$("#accordion").accordion({
    heightStyle: "content"
  });
});
//Leaflet functions
var map = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
L.marker([51.5, -0.09]).addTo(map).bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();
$("#myBtn").click(function() {
	$("#dialog-message").dialog({
		modal: true,
		minWidth: 600,
		buttons: {
			Book: function() {
				$(this).dialog("close");
			}
		}
	});
});