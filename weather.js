const request = require('request');

exports.weather = function(loc, callback){
    let woeid;
    if (loc.woeid) {
        woeid = `="${loc.woeid}"`;
    } else if (loc.location) {
        woeid = ` in (SELECT woeid FROM geo.places WHERE text="${loc.location}")`;
    } else if (loc.latlong) {
        woeid = ` in (SELECT woeid FROM geo.places WHERE text="(${loc.latlong[0]},${loc.latlong[1]})")`;
    } else {
        callback("No location given", {});
    }

    const query = 'q=select * from weather.forecast where woeid',
        url = `http://query.yahooapis.com/v1/public/yql?${query}${woeid}&format=json`;

    request({url: url, json: true, timeout: 2000}, function(err, response, body){
        if (!err && response.statusCode === 200) {
            let results = body.query.results.channel,
                wind = results.wind,
                speed = wind.speed,
                today = results.item.condition;

            let description = 'Hurricane';
            if (speed < 1){
                description = 'Calm';
            } else if (speed < 4) {
                description = 'Light air';
            } else if (speed < 7){
                description = 'Light breeze';
            } else if (speed < 11){
                description = 'Gentle breeze';
            } else if (speed < 16){
                description = 'Moderate breeze';
            } else if (speed < 22){
                description = 'Fresh breeze';
            } else if (speed < 28){
                description = 'Strong breeze';
            } else if (speed < 34){
                description = 'Near gale';
            } else if (speed < 41){
                description = 'Gale'
            } else if (speed < 48){
                description = 'Strong gale';
            } else if (speed < 56){
                description = 'Storm';
            } else if (speed < 64){
                description = 'Violent storm';
            }

            callback(null, {
                temperature: today.temp,
                humidity: results.atmosphere.humidity,
                description: description,
                wind_speed: wind.speed,
                wind_direction: wind.direction
            });
        } else {
            callback('Weather Lookup Fail', {});
        }
    })
};
