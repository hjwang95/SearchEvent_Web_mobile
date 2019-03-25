var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var https = require('https');
const request = require("request");
const util = require('util');
const getPromise = util.promisify(request.get);
const fetch = require("node-fetch");
//Google Custom API: AIzaSyCCFUnuQQ9ub2hRx4QYg6c4G1TfpxA8beU
//Spotify Search site Client ID: 61c1b5339c334d4c933947c2f9bd110a
//spotify Client Secret: aa388563e3e84cedb1cf8d1497bafddd 

var SpotifyWebApi = require('spotify-web-api-node');

console.log("Hello");

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: '61c1b5339c334d4c933947c2f9bd110a',
  clientSecret: 'aa388563e3e84cedb1cf8d1497bafddd',
});



var geohash = require('ngeohash');

var myevents = [];
var upcomingDetail = [];

var google_lat = "";


function getSegmentId(Category) {
    var segmentID = "";
    if (Category === "All") {segmentID = "";}
	if (Category === "Music") {segmentID = "KZFzniwnSyZfZ7v7nJ";}
	if (Category === "Sports") {segmentID = "KZFzniwnSyZfZ7v7nE";}
	if (Category === "Art & Theatre") {segmentID = "KZFzniwnSyZfZ7v7na";}
	if (Category === "Film") {segmentID = "KZFzniwnSyZfZ7v7nn";}
	if (Category === "Miscellaneous") {segmentID = "KZFzniwnSyZfZ7v7n1";}

	return segmentID;
}


    var geoPoint0 = "";

app.use(bodyParser.json());
app.use( function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept");
    next();

})
app.use(express.static('dist'));


//To access routes now we have to go through /api/events
var apiRouter = express.Router();

//Table One Data
apiRouter.get('/events',function (req,res) {
    //event 只是用来中转 Here is pushing the thing to the above 'myevent' array
    //var inputArray = [];
    //inputArray.push(req.body);
    console.log(req.query);
    var keyword = "";
    var category =  "";
    var distance = "10";
    var unit =  ""; 
    var depart_radio = "";
    var segmentId = "";
    var geoPoint = "";


    //处理用户输入： keyword等...
     keyword = req.query.Keyword;       
     keyword = keyword.replace(new RegExp(" ","gm"),"+") 
     category =  req.query.Category;
     if(req.query.Distance != ""){distance = req.query.Distance;}
     unit =  req.query.Unit; 
     depart_radio = req.query.DepartLocChoice;
     segmentId = getSegmentId(category);
     geoPoint = "";
     async function get_googleGeopoint(google_loc_url) {
            
            
        let result = await getPromise(google_loc_url);
     
         // 可以加入 try catch 捕获异常  也可以加 .catch()
         //console.log("result" , JSON.parse(result.body));
         geoPoint = geohash.encode(JSON.parse(result.body).results[0].geometry.location.lat,JSON.parse(result.body).results[0].geometry.location.lng);
         /////////////////////////////////////////
         var event_url = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=PlOuJLEb8XdeMgz9EiDPe0CyVGSLCG9W"
         + "&keyword=" + keyword 
         + "&segmentId=" + segmentId
         + "&radius=" + distance
         + "&unit=" + unit 
         + "&geoPoint=" + geoPoint;

         console.log("HI I am 105");

         https.get(event_url, (resp) => {
         let data = '';
         // A chunk of data has been recieved.
         resp.on('data', (chunk) => {
             data += chunk;
         });

         // The whole response has been received. Print out the result.
         resp.on('end', () => {
             console.log("I am line 115 in serv.js");
             myevents= JSON.parse(data);

             res.send(JSON.parse(data));
             //res.json(data);

         });

         }).on("error", (err) => {
         console.log("Error: " + err.message);
         });
         ///////////////////////////////////////
     
     
         
         
     }

    if(depart_radio == "0"){
        geoPoint = geohash.encode(req.query.lat, req.query.lon);
        /////////////////////////////////////////
        var event_url = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=PlOuJLEb8XdeMgz9EiDPe0CyVGSLCG9W"
        + "&keyword=" + keyword 
        + "&segmentId=" + segmentId
        + "&radius=" + distance
        + "&unit=" + unit 
        + "&geoPoint=" + geoPoint;

        console.log("HI I am option 0");

        https.get(event_url, (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {

            if(JSON.parse(data)){
                myevents= JSON.parse(data);
                res.send(JSON.parse(data));
            }else{
                res.send("No_record");
            }
            
            //res.json(data);

        });

        }).on("error", (err) => {
        console.log("Error: " + err.message);
        res.send("ERROR");
        });
        ///////////////////////////////////////
    }
    if(depart_radio == "1"){
        var other = req.query.Other;
        other = other.replace(new RegExp(" ","gm"),"+") 
        var google_loc_url = "https://maps.googleapis.com/maps/api/geocode/json?address=" 
        + other 
        + "&key=AIzaSyAIToX3e-MuzjTM3RoDOZ0h1mkTwB8gXjQ";

        console.log(google_loc_url);
        get_googleGeopoint(google_loc_url);        

    } 

    }
 );

 //Event detail Tab1 Data
 apiRouter.get('/eventDetail',function (req2,res2) {
     console.log("eventDetail " + req2);
     var id = req2.query.eventID;
     var eventDetail_url = "https://app.ticketmaster.com/discovery/v2/events/"
     +id+".json?apikey=PlOuJLEb8XdeMgz9EiDPe0CyVGSLCG9W&";

    https.get(eventDetail_url, (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log("I am line 177 in serv.js");

            res2.send(JSON.parse(data));
        });

        }).on("error", (err) => {
        console.log("Error: " + err.message);
        });
        
 })

 //Venue detail Tab3 Data
 apiRouter.get('/venueDetail',function (req3,res3){
    var venueName = req3.query.venueName;
    venueName = venueName.replace(new RegExp(" ","gm"),"%20") 

    var venueDetail_url = "https://app.ticketmaster.com/discovery/v2/venues?apikey=PlOuJLEb8XdeMgz9EiDPe0CyVGSLCG9W&keyword="
     +venueName;


    https.get(venueDetail_url, (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log("I am line 177 in serv.js");

            res3.send(JSON.parse(data));
        });

        }).on("error", (err) => {
        console.log("Error: " + err.message);
        });

 })

 //Upcoming detail Tab4 Data
 
 apiRouter.get('/upcomingId',function (req4,res4){
    var venueName = req4.query.venueName;
    //venueName = venueName.replace(new RegExp(" ","gm"),"%20") 

    var songkickId_url = "https://api.songkick.com/api/3.0/search/venues.json?query="+venueName+"&apikey=nhqZYZqS9GKwGa9r";
    var songID = "";

    https.get(songkickId_url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            //Get/Save ID
            var songkickID_Json = JSON.parse(data);

            //Status should be "OK"
            var status = songkickID_Json.resultsPage.status;
            if(status == "ok"){
                if(songkickID_Json.resultsPage.results.venue == undefined || songkickID_Json.resultsPage.results.venue.length == 0){
                    res4.send({res:0});
                }
                else{
                    songID = songkickID_Json.resultsPage.results.venue[0].id;
                    if(songID !=""){
                        getupcpmingDetail(songID);
                    }
                    else{
                        res4.send({res:0});
                    }
                }
                
            }

        });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
        
    async function getupcpmingDetail(songID) {
        songkickDetail_url = "https://api.songkick.com/api/3.0/venues/"+songID+"/calendar.json?apikey=nhqZYZqS9GKwGa9r";
        https.get(songkickDetail_url, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                upcomingDetail= JSON.parse(data);
                //Status should be "OK"
                var songDetail_status = upcomingDetail.resultsPage.status;

                if(songDetail_status == "ok"){
                    var upcomingEvents = upcomingDetail.resultsPage.results.event;
                    console.log(data);
                    if(upcomingEvents === undefined){
                        res4.send({res:0});
                    }
                    else if(upcomingEvents.length > 0){
                        res4.send(upcomingEvents);
                    }
                    else{
                        res4.send("Zero_result");
                    }   
                }
                else{
                    res4.send("error");
                }
                
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
 
 
     
     
    }



    

 })
 


 apiRouter.get('/nonmusic_Pictures',function (req5,res5) {
    var picArray = [];
    var picNameArray = [];
    picNameArray = req5.query.names.split('@');

    var i;
    for (i = 0; i < Number(req5.query.size)+1; i++) {
        var name = picNameArray[i];
        if(name === ''){

        }
        else{
            var nomusic_url = "https://www.googleapis.com/customsearch/v1?q=" + name+"&cx=000746235431720826753:riow47rp68w&imgSize=huge&num=8&searchType=image&key=AIzaSyCCFUnuQQ9ub2hRx4QYg6c4G1TfpxA8beU";
            https.get(nomusic_url, (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    var picPack = [];
                    picPack[0] = JSON.parse(data).queries.request[0].searchTerms;
                    picPack[1] = JSON.parse(data).items;
                    picArray.push(picPack);


                    if(picArray.length==req5.query.size){

                        res5.send(picArray);
                    }
                });

                }).on("error", (err) => {
                    console.log("Error: " + err.message);
                });
        }
        
    }



 })

 apiRouter.get('/auto',function (req7,res7) {
    console.log("/////////");
   console.log(req7.query.term);
   var term = req7.query.term;
   var auto_url = "https://app.ticketmaster.com/discovery/v2/suggest?apikey=PlOuJLEb8XdeMgz9EiDPe0CyVGSLCG9W&keyword="
   + term;
   https.get(auto_url, (resp) => {
       let data = '';
       // A chunk of data has been recieved.
       resp.on('data', (chunk) => {
           data += chunk;
       });

       // The whole response has been received. Print out the result.
       resp.on('end', () => {
           console.log(data);
           res7.send(JSON.parse(data));
       });

       }).on("error", (err) => {
       console.log("Error: " + err.message);
       });
})

 apiRouter.get('/music_Pictures',function (req6,res6) {
    var picNameArray = [];
    picNameArray = req6.query.names.split('@');
    var picArray = [];
    // Retrieve an access token.
    spotifyApi.clientCredentialsGrant().then(
        function(data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
    
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            for (let index = 0; index < Number(req6.query.size)+1; index++) {
                var name = picNameArray[index];
                if(name != ''){
                    spotifyApi.searchArtists(name)
                    .then(function(data) {
                        console.log("I am 383");
                        console.log(data.body.artists.items[0]);

                        var picPack = [];

                        picPack[0] = picNameArray[index];
                        picPack[1] = data.body.artists.items[0];

                        for (let index1 = 0; index1 < data.body.artists.items.length; index1++) {
                            if(data.body.artists.items[index1].name == picNameArray[index]){
                                picPack[0] = data.body.artists.items[index1].name;
                                picPack[1] = data.body.artists.items[index1];
                            }
                            
                        }
                        

                        if(picPack[0] != ""){
                            var nomusic_url = "https://www.googleapis.com/customsearch/v1?q=" + picPack[0]+"&cx=000746235431720826753:riow47rp68w&imgSize=huge&num=8&searchType=image&key=AIzaSyCCFUnuQQ9ub2hRx4QYg6c4G1TfpxA8beU";
                            https.get(nomusic_url, (resp) => {
                                let data = '';

                                resp.on('data', (chunk) => {
                                    data += chunk;
                                });
                                resp.on('end', () => {
                                    //picPack[0] = JSON.parse(data).queries.request[0].searchTerms;
                                    picPack[2] = JSON.parse(data).items;
                                    picArray.push(picPack);


                                    if(picArray.length==req6.query.size){

                                        res6.send(picArray);
                                    }
                                });

                                }).on("error", (err) => {
                                    console.log("Error: " + err.message);
                                });

                        }
                            








                        

                    }, function(err) {
                        console.error(err);
                    });
                }
            }
        },
        function(err) {
            console.log('Something went wrong when retrieving an access token', err);
        }
    );

 
    




    

 })

 



app.use('/apiRouter',apiRouter);

// app.listen(3000);
app.listen(8081);











/////////////////////////////////////////
    /*
    var event_url = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=PlOuJLEb8XdeMgz9EiDPe0CyVGSLCG9W"
    + "&keyword=" + keyword 
    + "&segmentId=" + segmentId
    + "&radius=" + distance
    + "&unit=" + unit 
    + "&geoPoint=" + geoPoint;

    console.log("HI I am 105");
    console.log(event_url);

    https.get(event_url, (resp) => {
    let data = '';
    console.log(event_url);

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        console.log("I am line 115 in serv.js");
        myevents= JSON.parse(data);

        res.send(JSON.parse(data));
        //res.json(data);

    });

    }).on("error", (err) => {
    console.log("Error: " + err.message);
    });
    */
    ///////////////////////////////////////