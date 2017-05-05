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
                                <a class="infoModal" data-rel="prettyPhoto" href="assets/img/portfolio/portfolio_09.jpg" class="dmbutton a2" data-animate="fadeInUp"><i class="fa fa-search"></i></a>
                                <a href="single-project.html" class="dmbutton a2" data-animate="fadeInUp"><i class="fa fa-link"></i></a>
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
    for (i = 0; i < providerList.length; i++) {
        console.log(providerList[i]);
        stringBuilder(providerList[i]["fname"], providerList[i]["lname"], providerList[i]["description"], providerList[i]["img"],i, providerList[i]["tag"]);
        updateMaps(providerList[i]["lat"],providerList[i]["long"],providerList[i]["fname"], providerList[i]["lname"])
        // UpdateProgressBars(providerList[i]["recommend"], providerList[i]["totalusers"], i);

    }

    // $('#accordion').accordion("refresh");
}


function sendRequest()
{
    val= "Hello";
    if (sessionStorage.getItem('user').toUpperCase() == 'NONE'){
        console.log('No user');
        window.location.replace('/login');
    }else{
        socketSeeker.emit('bookRequest', {
            searchTerm: val
        });
    }

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

$(".infoModal").click(function(){
    console.log("Modal Works")
             $("#myModal").modal();
        })