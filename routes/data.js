var data = {  
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
  res.json(data);
};