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
var socketSeeker = io.connect();
socketSeeker.on('seekerQueryResults',function(result){
    console.log(result);
 iterateJSON(result);
});
function stringBuilder(fname,lname,description,img,i,progress,tag)
{
  accordion = ' <h3><p class="provider-name">'+fname+' '+lname+'Recommended : <div id="progressbar'+i+'"><div id="progress-label1" class="progress-label">Recommended</div></div> </h3><div>'
  profile = '<figure class="snip0057 red"> <figcaption> <h2>'+fname+'<span>'+lname+'</span></h2><p>'+description+'</p> </figcaption>'
   image =  '<div class="image"><img src='+img+' alt="sample4"/></div>'
   position =  '<div class="position">'+tag+'</div>'
  end = '</figure> <button id="myBtn">Check Availability</button> </div>"'
}

function UpdateProgressBars(progressVals,count)
 {
 
    val = 1
    while(val<count)
    {
        console.log("#progressbar"+val)
    $( "#progressbar"+val ).progressbar({
      value:val*10
     
    });
     $("#progress-label"+val).text( val+"/10" );
    val++;
    }
  } 

function inputChange(val)
{
    console.log(val);
    
    socketSeeker.emit('seekerQuery',{searchTerm: val});    
    iterateJSON();
}

function updateMaps(latlong)
{;
//;
}

function iterateJSON(providerList)
{
    // obj = JSON.parse()
}

