var divLists = [];
var globalList ;
var map = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var socketProvider = io.connect();
socketProvider.on('providerQueryResults', function(result) {
    iterateJSON(result);
});

function pendingRequest()
{
   
        $("#search-result").empty();
        socketProvider.emit('pendingRequests', {
            searchTerm: sessionStorage.getItem('user')
        });
}

function updateRequest(val)
{
 
   

        socketProvider.emit('updateRequest', {
            searchTerm: val
        });
    }


function stringBuilder(fname, lname, askingPrice, img, i) {
    title = ` <li class="DocumentItem">
           <div class="portfolio-item graphic-design">
					<div class="he-wrap tpl6">
					<img src="`+img+`" style="height:150px; width:150px;">
						<div class="he-view">
							<div class="bg a0" data-animate="fadeIn">
                                <h3 class="a1" data-animate="fadeInDown">`+fname+askingPrice+`</h3>
                                
                                <a  onclick="bookingCase(this)"  data-value-yes = "yes" data-value="`+i+`" class="dmbutton a2" data-animate="fadeInUp">Ok</a>
                                <a onclick="bookingCase(this)" data-value-yes = "no"class="dmbutton a2" data-animate="fadeInUp">X</a>
                                
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

function updateMaps(lat,long,fname,lname)
{
    L.marker([lat, long]).addTo(map).bindPopup(fname+' '+lname).openPopup();
}
function iterateJSON(providerList) {

    providerList = providerList.result;
    globalList = providerList;
    for (i = 0; i < providerList.length; i++) {
        console.log(providerList[i]);
        stringBuilder(providerList[i]["fname"], providerList[i]["lname"], providerList[i]["askingPrice"], providerList[i]["img"],i);
        updateMaps(providerList[i]["lat"],providerList[i]["long"],providerList[i]["fname"], providerList[i]["lname"])
        // UpdateProgressBars(providerList[i]["recommend"], providerList[i]["totalusers"], i);

    }

    // $('#accordion').accordion("refresh");
}


function bookingCase(params)
{
   var ReqId = globalList[$(params).data("value")]["ReqId"];
   var status =$(params).data("value-yes");

   var myObj = { "ReqId":ReqId, "status":status }
    console.log($(params).data("value"));
   updateRequest(myObj);
    pendingRequest();
    
}

pendingRequest();