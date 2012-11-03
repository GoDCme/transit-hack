var rq = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var u = require('underscore');
var async = require('async');

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

bikeshare.fetcher = function (callback, from, id) {
  rq('http://capitalbikeshare.com/data/stations/bikeStations.xml', function(error, response, body) {
    if (body) {
      parser.parseString(body, function(err, result){
        switch(from) {
          case "all":
            callback.json(result); break;
          case "nearest":
            callback.json(bikeshare.getNearest(result)); break;
          case "station":
            callback.json(bikeshare.getStationById(result, id)); break;
          case "compressor":
            callback(null, bikeshare.cleanData(bikeshare.getNearest(result))); break;
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

bikeshare.cleanData = function(data) {
  var stations = [];
  for (var i = 0; i < data.length; i++) {
    var stop = data[i];
    stations.push({ 
      id: stop.id[0],
      location: stop.name[0],
      minutes: stop.minsFromStation,
      bikes: stop.nbBikes[0],
      docks: stop.nbEmptyDocks[0],
      coordinates: {
        lat: stop.lat[0],
        lon: stop.long[0]
      }
    });
  }
  
  return stations;
};

bikeshare.getNearest = function(result) {
  var stations = result.stations.station;
  for (var i = 0; i < stations.length; i++) {
    stations[i].minsFromStation = utility.minsFromStation(stations[i].lat[0], stations[i].long[0], yourLat, yourLon);
  }
  stations = u.sortBy(stations, function(s){ return s.minsFromStation });
  return u.first(stations, 3);
};

bikeshare.getStationById = function (result, id) {
  var stations = result.stations.station;
  for (var i = 0; i < stations.length; i++) {
    if (stations[i].id == id) {
      stations[i].minsFromStation = utility.minsFromStation(stations[i].lat[0], stations[i].long[0], yourLat, yourLon);
      return (stations[i]);
    }
  }
};

bikeshare.station = function(req, res) {
  bikeshare.fetcher(res, "station", req.params.id);
};

bikeshare.all = function(req, res){
  bikeshare.fetcher(res, "all");
};

bikeshare.nearest = function(req, res) {
  bikeshare.fetcher(res, "nearest");
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
        minutes: 22.10,
        coordinates: { lat: 32.954, lon: -76.100 },
        bikes: 19,
        docks: 4,
        id: 44
      }
    ]
  } 
};

exports.sample = function(req, res){
  res.json(sampleData);
};

exports.compress = function(req, res){
  async.auto({
    getMetro: function(callback) {
      callback(null);
    },
    getBus: function(callback) {
      callback(null);
    },
    getBikeshare: function(callback) {
      bikeshare.fetcher(callback, "compressor");
    },
    compressAndSend: ["getMetro", "getBus", "getBikeshare", function(callback, r) {
      var data = {
        metro: r["getMetro"],
        bus: r["getBus"],
        bikeshare: {stations: r["getBikeshare"]}
      };
      res.json(data);
      callback(null);
    }]
  });
}