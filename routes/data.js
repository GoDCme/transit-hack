var rq = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var u = require('underscore');

var yourLat = 38.960744;
var yourLon = -77.086258;

var bikeshare = {};
var utility = {};

utility.toRadian = function(a) {
  return (a * (Math.PI / 180));
}

utility.minsFromStation = function(lat1, lon1, lat2, lon2) {
  var dLat = utility.toRadian(lat2-lat1);
  var dLon = utility.toRadian(lon2-lon1);
  var lat1 = utility.toRadian(lat1);
  var lat2 = utility.toRadian(lat2);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  return (20 * (3963.17 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))))); 
}

bikeshare.fetcher = function (req, res, from) {
  rq('http://capitalbikeshare.com/data/stations/bikeStations.xml', function(error, response, body) {
    if (body) {
      parser.parseString(body, function(err, result){
        switch(from) {
          case "all":
            res.json(result); break;
          case "nearest":
            res.json(bikeshare.getNearest(req, result)); break;
          case "station":
            res.json(bikeshare.getStationById(req, result)); break;
          default:
            break;
        }
      });
    }
    else {
      res.json("unable to access Capital Bikeshare");
    }
  });
};

bikeshare.getNearest = function(req, result) {
  var stations = result.stations.station;
  for (var i = 0; i < stations.length; i++) {
    stations[i].minsFromStation = utility.minsFromStation(stations[i].lat[0], stations[i].long[0], yourLat, yourLon);
  }
  stations = u.sortBy(stations, function(s){ return s.minsFromStation });
  return u.first(stations, 3);
};

bikeshare.getStationById = function (req, result) {
  var stations = result.stations.station;
  for (var i = 0; i < stations.length; i++) {
    if (stations[i].id == req.params.id) {
      stations[i].minsFromStation = utility.minsFromStation(stations[i].lat[0], stations[i].long[0], yourLat, yourLon);
      return (stations[i]);
    }
  }
};

bikeshare.station = function(req, res) {
  bikeshare.fetcher(req, res, "station");
};

bikeshare.all = function(req, res){
  bikeshare.fetcher(req, res, "all");
};

bikeshare.nearest = function(req, res) {
  bikeshare.fetcher(req, res, "nearest");
};

exports.bikeshare = bikeshare;

var sampleData = {  
  metro: { stations: [
    { station: "Friendship Heights", 
      colors: [ "R" ], 
      distance: 0.53,
      coordinates: { lat: 32.534, lon: -76.035 },
      lines: [
        { to: "Shady Grove", color: "R", time: [2, 18] },
        { to: "Glenmont", color: "R", time: [11] }       
      ] }
  ] },
  bus: { stops: [
      { location: "Wisconsin Ave and Western Ave",
        distance: 0.24,
        coordinates: { lat: 32.586, lon: -76.103 },
        lines: [
          { route: "H2", direction: "WEST", time: [ 9, 39 ] },
          { route: "H2", direction: "EAST", time: [ 15, 40 ] },
        ] }
  ] },
  bikeshare: { stations: [
      { location: "Tenley Circle",
        distance: 1.06,
        coordinates: { lat: 32.954, lon: -76.100 },
        bikes: 19,
        docks: 4
      }
    ]
  } 
};

exports.sample = function(req, res){
  res.json(sampleData);
};

exports.compress = function(req, res){
  
}