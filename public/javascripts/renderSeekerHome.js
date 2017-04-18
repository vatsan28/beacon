// var AppView = Backbone.View.extend({
//   // el - stands for element. Every view has a element associate in with HTML
//   //      content will be rendered.
//   el: '#container',
//   // It's the first function called when this view it's instantiated.
//   initialize: function(){
//     this.render();
//   },
//   // $el - it's a cached jQuery object (el), in which you can use jQuery functions
//   //       to push content. Like the Hello World in this case.
//   render: function(){
//     this.$el.html("Hello World");
//   }
// });
// //  var appView = new AppView();

//Leaflet functions
divLists = []
var map = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var socketSeeker = io.connect();
socketSeeker.on('seekerQueryResults', function(result) {
	iterateJSON(result);
});

function stringBuilder(fname, lname, description, img, i, tag) {
	title = '<h3><p class="provider-name">' + fname + ' ' + lname + '<div id="progressbar' + i + '"><div id="progress-label'+i+'" class="progress-label">Recommended</div></div> </h3><div>'
	profile = '<figure class="snip0057 red"> <figcaption> <h2>' + fname + '<span>' + lname + '</span></h2><p>' + description + '</p> </figcaption>'
	image = '<div class="image"><img src=' + img + ' alt="sample4"/></div>'
	position = '<div class="position">' + tag + '</div>'
	end = '</figure> <button id="myBtn' + i + '" value='+i+' onclick= "popupModal(this.value)">Check Availability</button> </div>"'
  console.log("Reached here")
	$(".providerList").append(title + profile + image + position + end);
  divLists.push(title + profile + image + position + end);
}

function UpdateProgressBars(recommend, total, count) {
	console.log("#progressbar" + count)
	$("#progressbar" + count).progressbar({
		value: recommend / total * 100
	});
	$("#progress-label"+count).text(recommend+ "/"+total+" recommends this provider");
}

function inputChange(val) {
	console.log(val);
  $(".providerList").empty();
	socketSeeker.emit('seekerQuery', {
		searchTerm: val
	});
}


function updateMaps(lat,long,fname,lname)
{
  L.marker([lat, long]).addTo(map).bindPopup(fname+' '+lname).openPopup();
}
function iterateJSON(providerList) {

  providerList = providerList.result;
	for (i = 0; i < providerList.length; i++) {
    console.log(providerList[i]);
		stringBuilder(providerList[i]["fname"], providerList[i]["lname"], providerList[i]["description"], providerList[i]["img"],i, providerList[i]["tag"]);
		updateMaps(providerList[i]["lat"],providerList[i]["long"],providerList[i]["fname"], providerList[i]["lname"])
		UpdateProgressBars(providerList[i]["recommend"], providerList[i]["totalusers"], i);
   
	}
 
 $('#accordion').accordion("refresh");     
}


function sendRequest()
{
  val= "Hello";

  		socketSeeker.emit('bookRequest', {
		searchTerm: val
	});
}

function popupModal(e)
{
  $("#dialog-message").empty();

   $("#dialog-message").append(divLists[e]);

   $("#dialog-message").dialog({
		modal: true,
		minWidth: 600,
		buttons: {
			RequestService: function() {        
        
			}
		}
	});
  sendRequest();
  
}