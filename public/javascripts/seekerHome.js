//Progress Bar
// $(function() {
//     progressVals = 4
//     val = 1;
//     console.log(progressVals)
//     while (val < progressVals) {
//         console.log("#progressbar" + val)
//         $("#progressbar" + val).progressbar({
//             value: val * 10
//         });
//         $("#progress-label" + val).text(val + "/10");
//         val++;
//     }
// });
//DatePicker

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
// $(function() {
//     $("#accordion").accordion({
//         heightStyle: "content"
//     });
// });




