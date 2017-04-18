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



	


