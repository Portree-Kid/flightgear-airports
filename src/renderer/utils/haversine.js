var earthRadius = 6371008.8;


function distance(point1, point2) {
    var dLat = degrees_to_radians((point2[1] - point1[1]));
    var dLon = degrees_to_radians((point2[0] - point1[0]));
    var lat1 = degrees_to_radians(point1[1]);
    var lat2 = degrees_to_radians(point2[1]);

    var a = Math.pow(Math.sin(dLat / 2), 2) +
          Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);

    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));    
}

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

