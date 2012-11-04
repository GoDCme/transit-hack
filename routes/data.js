var rq = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var u = require('underscore');
var async = require('async');
var jsdom = require("jsdom");

var yourLat = 38.960744;
var yourLon = -77.086258; //Microsoft Friendship Heights coordinates

var bikeshare = {};
var metro = {};
var bus = {};
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

/************************/

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
  
  return {stations: stations};
};

bikeshare.getNearest = function(result) {
  var stations = result.stations.station;
  for (var i = 0; i < stations.length; i++) {
    stations[i].minsFromStation = utility.minsFromStation(stations[i].lat[0], stations[i].long[0], yourLat, yourLon);
  }
  stations = u.sortBy(stations, function(s){ return s.minsFromStation });
  return u.first(stations, 5);
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

/************************/

metro.stations = {"A03":{"station":"Dupont Circle","colors":["RD"],"coordinates":{"lat":38.9095980575,"lon":-77.0434143597}},"A02":{"station":"Farragut North","colors":["RD"],"coordinates":{"lat":38.9032019462,"lon":-77.0397008272}},"A01":{"station":"Metro Center","colors":["RD","BL","OR"],"coordinates":{"lat":38.8983144732,"lon":-77.0280779971},"alias":"C01"},"A07":{"station":"Tenleytown","colors":["RD"],"coordinates":{"lat":38.9488514351,"lon":-77.0795873255}},"A06":{"station":"Van Ness UDC","colors":["RD"],"coordinates":{"lat":38.9432652883,"lon":-77.0629861805}},"A05":{"station":"Cleveland Park","colors":["RD"],"coordinates":{"lat":38.9347628908,"lon":-77.0580425191}},"A04":{"station":"Woodley Park Zoo","colors":["RD"],"coordinates":{"lat":38.9250851371,"lon":-77.0524180207}},"B02":{"station":"Judiciary Square","colors":["RD"],"coordinates":{"lat":38.8960903176,"lon":-77.0166389566}},"C10":{"station":"National Arpt","colors":["BL","YL"],"coordinates":{"lat":38.8534163859,"lon":-77.0440422943}},"E10":{"station":"Greenbelt","colors":["GR"],"coordinates":{"lat":39.0111458605,"lon":-76.9110575731}},"D08":{"station":"Stadium Armory","colors":["BL","OR"],"coordinates":{"lat":38.8867090898,"lon":-76.9770889014}},"B08":{"station":"Silver Spring","colors":["RD"],"coordinates":{"lat":38.9939493747,"lon":-77.0310178268}},"B09":{"station":"Forest Glen","colors":["RD"],"coordinates":{"lat":39.0149542752,"lon":-77.0429165548}},"D09":{"station":"Minnesota Avenue","colors":["OR"],"coordinates":{"lat":38.899191223,"lon":-76.9467477336}},"D06":{"station":"Eastern Market","colors":["BL","OR"],"coordinates":{"lat":38.8846222608,"lon":-76.9960011267}},"D07":{"station":"Potomac Avenue","colors":["BL","OR"],"coordinates":{"lat":38.8812632736,"lon":-76.9854953196}},"D04":{"station":"Federal Center SW","colors":["BL","OR"],"coordinates":{"lat":38.8850723551,"lon":-77.0158682169}},"D05":{"station":"Capitol South","colors":["BL","OR"],"coordinates":{"lat":38.8850625009,"lon":-77.0051394199}},"D02":{"station":"Smithsonian","colors":["BL","OR"],"coordinates":{"lat":38.888018702,"lon":-77.0280662342}},"D03":{"station":"L'Enfant Plaza","colors":["BL","OR","GR","YL"],"coordinates":{"lat":38.8848377279,"lon":-77.021908484},"alias":"F03"},"B01":{"station":"Gallery Place","colors":["RD","GR","YL"],"coordinates":{"lat":38.8983168097,"lon":-77.0219153904},"alias":"F01"},"D01":{"station":"Federal Triangle","colors":["BL","OR"],"coordinates":{"lat":38.8931808718,"lon":-77.0281319984}},"B03":{"station":"Union Station","colors":["RD"],"coordinates":{"lat":38.8977660392,"lon":-77.0074142921}},"B04":{"station":"Rhode Island Avenue","colors":["RD"],"coordinates":{"lat":38.9210596891,"lon":-76.9959369166}},"B05":{"station":"Brookland","colors":["RD"],"coordinates":{"lat":38.9332109913,"lon":-76.9945342851}},"B06":{"station":"Fort Totten","colors":["RD","GR","YL"],"coordinates":{"lat":38.9518467675,"lon":-77.0022030768},"alias":"E06"},"B07":{"station":"Takoma","colors":["RD"],"coordinates":{"lat":38.976078531,"lon":-77.0181766987}},"K03":{"station":"Virginia Square","colors":["OR"],"coordinates":{"lat":38.8833661518,"lon":-77.1029772942}},"K05":{"station":"E Falls Church","colors":["OR"],"coordinates":{"lat":38.8859531663,"lon":-77.1568830199}},"K04":{"station":"Ballston","colors":["OR"],"coordinates":{"lat":38.8821828738,"lon":-77.113168835}},"F11":{"station":"Branch Avenue","colors":["GR"],"coordinates":{"lat":38.8264463483,"lon":-76.9114642177}},"F10":{"station":"Suitland","colors":["GR"],"coordinates":{"lat":38.8439645544,"lon":-76.9318701589}},"D12":{"station":"Landover","colors":["OR"],"coordinates":{"lat":38.9335062344,"lon":-76.8911979676}},"G05":{"station":"Largo Town Center","colors":["BL"],"coordinates":{"lat":38.9050688072,"lon":-76.8420375202}},"G04":{"station":"Morgan Blvd","colors":["BL"],"coordinates":{"lat":38.8938349282,"lon":-76.8680747681}},"K01":{"station":"Court House","colors":["OR"],"coordinates":{"lat":38.8901755312,"lon":-77.087131231}},"G01":{"station":"Benning Road","colors":["BL"],"coordinates":{"lat":38.890975676,"lon":-76.9383648681}},"K02":{"station":"Clarendon","colors":["OR"],"coordinates":{"lat":38.886704839,"lon":-77.0953940983}},"G03":{"station":"Addison Road","colors":["BL"],"coordinates":{"lat":38.8867478168,"lon":-76.89410791}},"G02":{"station":"Capitol Heights","colors":["BL"],"coordinates":{"lat":38.8894658568,"lon":-76.9118081145}},"K07":{"station":"Dunn Loring","colors":["OR"],"coordinates":{"lat":38.8836251359,"lon":-77.2271606721}},"K06":{"station":"W Falls Church","colors":["OR"],"coordinates":{"lat":38.900780551,"lon":-77.1890948225}},"K08":{"station":"Vienna","colors":["OR"],"coordinates":{"lat":38.8776011238,"lon":-77.2726222569}},"A13":{"station":"Twinbrook","colors":["RD"],"coordinates":{"lat":39.0624676517,"lon":-77.1208179517}},"A12":{"station":"White Flint","colors":["RD"],"coordinates":{"lat":39.0481513573,"lon":-77.112829859}},"A11":{"station":"Grosvenor","colors":["RD"],"coordinates":{"lat":39.02926895,"lon":-77.10384972}},"A10":{"station":"Medical Center","colors":["RD"],"coordinates":{"lat":39.0000564843,"lon":-77.0969522905}},"C15":{"station":"Huntington","colors":["YL"],"coordinates":{"lat":38.7939158529,"lon":-77.0752057891}},"C14":{"station":"Eisenhower Avenue","colors":["YL"],"coordinates":{"lat":38.8004254497,"lon":-77.0708743893}},"A15":{"station":"Shady Grove","colors":["RD"],"coordinates":{"lat":39.1199273249,"lon":-77.1646273343}},"A14":{"station":"Rockville","colors":["RD"],"coordinates":{"lat":39.0843216075,"lon":-77.1461253392}},"B35":{"station":"New York Avenue","colors":["RD"],"coordinates":{"lat":38.9070162121,"lon":-77.0030204472}},"C07":{"station":"Pentagon","colors":["BL","YL"],"coordinates":{"lat":38.8694627012,"lon":-77.0537156734}},"C09":{"station":"Crystal City","colors":["BL","YL"],"coordinates":{"lat":38.8579043204,"lon":-77.0502898097}},"C08":{"station":"Pentagon City","colors":["BL","YL"],"coordinates":{"lat":38.8618823867,"lon":-77.0595389215}},"E08":{"station":"Prince Georges Plaza","colors":["GR"],"coordinates":{"lat":38.9653854458,"lon":-76.9558815078}},"E07":{"station":"West Hyattsville","colors":["GR"],"coordinates":{"lat":38.9550401707,"lon":-76.9695766751}},"E05":{"station":"Georgia Avenue","colors":["GR","YL"],"coordinates":{"lat":38.9374346301,"lon":-77.023460904}},"E04":{"station":"Columbia Heights","colors":["GR","YL"],"coordinates":{"lat":38.9278379675,"lon":-77.0325521177}},"E03":{"station":"U Street","colors":["GR","YL"],"coordinates":{"lat":38.9170023992,"lon":-77.0274958929}},"E01":{"station":"Mt Vernon Sq","colors":["GR","YL"],"coordinates":{"lat":38.9064368149,"lon":-77.0219143803}},"C03":{"station":"Farragut West","colors":["BL","OR"],"coordinates":{"lat":38.9013128941,"lon":-77.0406954151}},"C02":{"station":"McPherson Square","colors":["BL","OR"],"coordinates":{"lat":38.9013327968,"lon":-77.0336341721}},"C05":{"station":"Rosslyn","colors":["BL","OR"],"coordinates":{"lat":38.8959790962,"lon":-77.0709086853}},"C04":{"station":"Foggy Bottom","colors":["BL","OR"],"coordinates":{"lat":38.9006980092,"lon":-77.050277739}},"E02":{"station":"Shaw","colors":["GR","YL"],"coordinates":{"lat":38.9134768711,"lon":-77.0219117007}},"C06":{"station":"Arlington Cemetery","colors":["BL"],"coordinates":{"lat":38.8846868585,"lon":-77.0628101291}},"E09":{"station":"College Park","colors":["GR"],"coordinates":{"lat":38.9786336339,"lon":-76.9281249818}},"J03":{"station":"Franconia-Springf'ld","colors":["BL"],"coordinates":{"lat":38.7665218926,"lon":-77.1679701804}},"C13":{"station":"King Street","colors":["BL","YL"],"coordinates":{"lat":38.8065861172,"lon":-77.0608112085}},"C12":{"station":"Braddock Road","colors":["BL","YL"],"coordinates":{"lat":38.8141436672,"lon":-77.053667574}},"F08":{"station":"Southern Ave","colors":["GR"],"coordinates":{"lat":38.8410857803,"lon":-76.9750541388}},"F09":{"station":"Naylor Road","colors":["GR"],"coordinates":{"lat":38.8513013835,"lon":-76.9562627094}},"F04":{"station":"Waterfront","colors":["GR"],"coordinates":{"lat":38.8764618668,"lon":-77.0175052088}},"F05":{"station":"Navy Yard","colors":["GR"],"coordinates":{"lat":38.8764810849,"lon":-77.0050856513}},"F06":{"station":"Anacostia","colors":["GR"],"coordinates":{"lat":38.8629631168,"lon":-76.9953707387}},"F07":{"station":"Congress Height","colors":["GR"],"coordinates":{"lat":38.8456577028,"lon":-76.9885119326}},"J02":{"station":"Van Dorn St","colors":["BL"],"coordinates":{"lat":38.799307672,"lon":-77.1291115237}},"F02":{"station":"Archives","colors":["GR","YL"],"coordinates":{"lat":38.8936652235,"lon":-77.0219143879}},"B10":{"station":"Wheaton","colors":["RD"],"coordinates":{"lat":39.0375271436,"lon":-77.0501070535}},"B11":{"station":"Glenmont","colors":["RD"],"coordinates":{"lat":39.0617837655,"lon":-77.0535573593}},"A09":{"station":"Bethesda","colors":["RD"],"coordinates":{"lat":38.9843936603,"lon":-77.0941291922}},"A08":{"station":"Friendship Heights","colors":["RD"],"coordinates":{"lat":38.9594838736,"lon":-77.084995805}},"D13":{"station":"New Carrollton","colors":["OR"],"coordinates":{"lat":38.9477848558,"lon":-76.8718412865}},"D10":{"station":"Deanwood","colors":["OR"],"coordinates":{"lat":38.9081784965,"lon":-76.935256783}},"D11":{"station":"Cheverly","colors":["OR"],"coordinates":{"lat":38.9166318546,"lon":-76.916628044}}}

metro.nearest = function() {
  var stations = u.map(metro.stations, function(s, key) {
    s.minutes = utility.minsFromStation(s.coordinates.lat, s.coordinates.lon, yourLat, yourLon);
    s.code = key;
    s.trains = [];
    return s;
  });
  return u.first(u.sortBy(stations, function(s) { return s.minutes; }), 5);
}

metro.fetcher = function(callback) {
  var nearest = metro.nearest();
  var keys = u.flatten(u.map(nearest, function(s) { return (s.alias ? [s.code, s.alias] : s.code )})).join(',');
  rq('http://api.wmata.com/StationPrediction.svc/json/GetPrediction/' + keys + '?api_key=qrc78gh5rrfhccxn3az498fa', function(error, response, body) {
    if (body) {
      var trains = JSON.parse(body).Trains;
      for (var i = 0; i < nearest.length; i++) {
        for (var t = 0; t < trains.length; t++) {
          if ((nearest[i].code === trains[t].LocationCode) || (nearest[i].alias === trains[t].LocationCode)) {
            if (trains[t].DestinationCode) {
              nearest[i].trains.push({
                to: trains[t].DestinationName,
                line: trains[t].Line,
                time: trains[t].Min
              }); 
            }
          }
        }
      }
      callback(null, nearest)
    }
    else {
      callback(null, "unable to access Metro data");
    }
  });
}

exports.metro = metro;

/************************/

bus.fetcher = function(callback) {
  rq("http://api.wmata.com/Bus.svc/json/JStops?lat=" + yourLat + "&lon=" + yourLon + "&radius=500&api_key=qrc78gh5rrfhccxn3az498fa", function(error, response, body){
    if (body) {
      var stops = u.first(JSON.parse(body).Stops, 5);
      stops = u.map(stops, function(s){
        return {
          coordinates: {
            lat: s.Lat,
            lon: s.Lon,
          },
          id: s.StopID,
          minutes: utility.minsFromStation(s.Lat, s.Lon, yourLat, yourLon),
          location: s.Name,
          routes: u.filter(s.Routes, function(r){
            return u.all(r, function(character){
              return (character === character.toUpperCase());
            })
          })
        }
      });
      
      async.map(stops, bus.stopFetcher, function(err, stops){
        callback(null, stops);
      });      
    }
  });
}

bus.stopFetcher = function(stop, callback) {
  rq("http://api.wmata.com/NextBusService.svc/json/JPredictions?StopID="+ stop.id +"&api_key=kwjwj788vpqyhg7waekp2bum", function(error, response, body){
    if (body) {
      var buses = JSON.parse(body).Predictions;
      stop.buses = [];
      for (var i = 0; i < buses.length; i++) {
        var bus = buses[i];
        stop.buses.push({
          direction: bus.DirectionText.split(" to ")[0],
          destination: bus.DirectionText.split(" to ")[1],
          route: bus.RouteID,
          minutes: bus.Minutes
        });
      }
      callback(null, stop);
    }
  });
}

exports.bus = bus;

exports.compress = function(req, res){
  yourLat = req.query.lat || yourLat;
  yourLon = req.query.lon || yourLon;
  async.auto({
    getMetro: function(callback) {
      metro.fetcher(callback);
    },
    getBus: function(callback) {
      bus.fetcher(callback);
    },
    getBikeshare: function(callback) {
      bikeshare.fetcher(callback, "compressor");
    },
    compressAndSend: ["getMetro", "getBus", "getBikeshare", function(callback, r) {
      var data = {
        metro: r["getMetro"],
        bus: r["getBus"],
        bikeshare: r["getBikeshare"]
      };
      res.json(data);
      callback(null);
    }]
  });
}