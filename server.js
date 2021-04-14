
const tracer = require('signalfx-tracing').init({
  // Optional Smart Agent or Gateway target.  Default is http://localhost:9080/v1/trace
  url: 'https://ingest.signalfx.com/v2/trace',
  accessToken: 'xxx',
  tags: {environment: 'SimpleWeather'},
  debug: true
});

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

const apiKey = 'xxx';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.setHeader('x-request-id', req.sfx.traceId)
  res.render('index', {weather: null, error: null, traceID: req.sfx.traceId});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`

  request(url, function (err, response, body) {
    if(err){
      res.setHeader('x-request-id', req.sfx.traceId)
      res.render('index', {weather: null, error: 'Error, please try again', traceID: req.sfx.traceId});
    } else {
      let weather = JSON.parse(body)
      if(weather.main == undefined){
        res.setHeader('x-request-id', req.sfx.traceId)
        res.render('index', {weather: null, error: 'Error, please try again', traceID: req.sfx.traceId});
      } else {
        res.setHeader('x-request-id', req.sfx.traceId)
        let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
        res.render('index', {weather: weatherText, error: null, traceID: req.sfx.traceId});
      }
    }
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
