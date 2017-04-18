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
 iterateJSON(result)
});
function stringBuilder(fname,lname,description,img,i,tag)
{
  title = ' <h3><p class="provider-name">'+fname+' '+lname+'Recommended : <div id="progressbar'+i+'"><div id="progress-label1" class="progress-label">Recommended</div></div> </h3><div>'
  profile = '<figure class="snip0057 red"> <figcaption> <h2>'+fname+'<span>'+lname+'</span></h2><p>'+description+'</p> </figcaption>'
   image =  '<div class="image"><img src='+img+' alt="sample4"/></div>'
   position =  '<div class="position">'+tag+'</div>'
  end = '</figure> <button id="myBtn'+i+'">Check Availability</button> </div>"'

  	
  $( ".providerList" ).append( title+profile+image+position+end);

}

function UpdateProgressBars(recommend,total,count)
 {
 
    
        console.log("#progressbar"+count)
    $( "#progressbar"+count ).progressbar({
      value:recommend/total*100
     
    });
     $("#progress-label"+count).text( count+"/124" );
    
    
  } 

function inputChange(val)
{
    console.log(val);
    
    socketSeeker.emit('seekerQuery',{searchTerm: val});    
    iterateJSON();
}

function updateMaps(lat,long)
{

}

function iterateJSON(providerList)
{
  console.log(providerList);

    for (i=1;i<=providerList.lengthi++)
    {
      stringBuilder(providerList[i]["fname"],providerList[i]["lname"],providerList[i]["description"],providerList[i]["img"],i,,providerList[i]["tag"])
      updateMaps(providerList[i]["lat"],providerList[i]["long"])
      UpdateProgressBars(providerList[i]["recommend"],providerList[i]["totalusers"]i);
    }

    
}

