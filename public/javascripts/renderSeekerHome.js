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

var divLists = [];
var globalList ;
var map = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var socketSeeker = io.connect();
socketSeeker.on('seekerQueryResults', function(result) {
    iterateJSON(result);
});

// console.log(sessionStorage.getItem('loginBool'));
sessionStorage.setItem('loginBool',true);
 console.log(sessionStorage.getItem('loginBool'));
    console.log(sessionStorage.getItem('user'));
if (sessionStorage.getItem('searchCategory'))
{
var searchItem = inputChange(sessionStorage.getItem('searchCategory'));
$("#tags").attr("placeholder", searchItem).val("").focus().blur();
}
else
 window.location.replace("/home");

function stringBuilder(fname, lname, description, img, i, tag) {
    title = ` <li class="DocumentItem">
           <div class="portfolio-item graphic-design">
					<div class="he-wrap tpl6">
					<img src="`+img+`" style="height:150px; width:150px;">
						<div class="he-view">
							<div class="bg a0" data-animate="fadeIn">
                                <h3 class="a1" data-animate="fadeInDown">`+fname+`</h3>
                                <a data-rel="prettyPhoto" onclick="modalClick(this)" data-value="`+i+`" class="dmbutton a2" data-animate="fadeInUp">View</a>
                                
                        	</div><!-- he bg -->
						</div><!-- he view -->		
					</div><!-- he wrap -->
				</div><!-- end col-12 -->
        </li>`
    // profile = '<figure class="snip0057 red"> <figcaption> <h2>' + fname + '<span>' + lname + '</span></h2><p>' + description + '</p> </figcaption>'
    // image = '<div class="image"><img src=' + img + ' alt="sample4"/></div>'
    // position = '<div class="position">' + tag + '</div>'
    // end = '</figure> <button id="myBtn' + i + '" value='+i+' onclick= "popupModal(this.value)">Check Availability</button> </div>"'
    console.log("Reached here")
    $("#search-result").append(title);
    divLists.push(title);
}

// function UpdateProgressBars(recommend, total, count) {
//     console.log("#progressbar" + count)
//     $("#progressbar" + count).progressbar({
//         value: recommend / total * 100
//     });
//     $("#progress-label"+count).text(recommend+ "/"+total+" recommends this provider");
// }

function inputChange(val) {
    $("#searchTerm").text(val);
    $("#search-result").empty();
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
    globalList = providerList;
    for (i = 0; i < providerList.length; i++) {
        console.log(providerList[i]);
        stringBuilder(providerList[i]["fname"], providerList[i]["lname"], providerList[i]["description"], providerList[i]["img"],i, providerList[i]["tag"]);
        updateMaps(providerList[i]["lat"],providerList[i]["long"],providerList[i]["fname"], providerList[i]["lname"])
        // UpdateProgressBars(providerList[i]["recommend"], providerList[i]["totalusers"], i);

    }

    // $('#accordion').accordion("refresh");
}


function sendRequest(val)
{
 
   

        socketSeeker.emit('bookRequest', {
            searchTerm: val
        });
    }



// function popupModal(e)
// {
//     $("#dialog-message").empty();

//     $("#dialog-message").append(divLists[e]);

//     $("#dialog-message").dialog({
//         modal: true,
//         minWidth: 600,
//         buttons: {
//             RequestService: function() {
//                 sendRequest();
// 			$(this).dialog("close");
//             }
//         }
//     });
// }

function modalClick(params)

{
    console.log(globalList)
     console.log(globalList[$(params).data("value")]["fname"])
    
    $("#modal-fname").text(globalList[$(params).data("value")]["fname"]); 
    $("#modal-lname").text(globalList[$(params).data("value")]["lname"]);
    $('#modal-image').attr("src",globalList[$(params).data("value")]["img"]);
    $('#modal-info').text(globalList[$(params).data("value")]["description"]);
    // $('#modal-rate').text(Math.floor((Math.random() * 35) + 15));
    setSlider(Math.floor((Math.random() * 35) + 15),Math.floor((Math.random() * 35) + 50))
    $('#modal-rating').text(Math.floor((Math.random() * 5) + 1))
    $('#modal-skill').text(globalList[$(params).data("value")]["tag"])



     $("#myModal").modal();
}

function modalBook()
{
    var reqName = sessionStorage.getItem('user');
    console.log(reqName);
    var reqService = $("#searchTerm").text();
    var provider = $("#modal-fname").text();
    var amount = $( "#amount" ).val() ;

    var myObj = { "reqName":reqName, "reqService":reqService, "provider":provider,"amount":amount };
    console.log(myObj);

    sendRequest(myObj);
$('#modal-book').prop('disabled', true);
 $("#modal-book").html('Sending Request. Please Wait <i class="fa fa-circle-o-notch fa-spin" style="font-size:24px"></i>');
  $(document).ready(function(){

            setTimeout(function(){
               $("#modal-book").html('Done.. Redirecting');
                setTimeout(function(){
                 
                 window.location.replace("/home");
                },1000);
                  
            },3000);
        });

}

function setSlider(mini,maxi)
{
    $( function() {
    $( "#slider-range-min" ).slider({
      range: "min",
      value: 37,
      min: mini,
      max: maxi,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
      }
    });
    $( "#amount" ).val( "$" + $( "#slider-range-min" ).slider( "value" ) );
  } );
}