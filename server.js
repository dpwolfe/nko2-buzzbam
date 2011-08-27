
/**
 * Module dependencies.
 */

require('nko')('SVvsNwr4CEZy0EzQ');

var express = require('express');
var https = require('https');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var config = require('./config');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret:"foo"}));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

function jsonGet(options, callback) {
  console.log(options);
  https.get(options, function(response) {
    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      callback(JSON.parse(body));
    });
  });
}

app.get('/party', function(req, res) {
  var id = req.param('id');
  var fake = {
    'X1': {
      id: 'X1',
      public: true,
      owner: 'USER1',
      title: 'voting party',
      description: 'Vote for a great app!',
      users: [{
        id: 'USER1',
        name: 'Bill',
        email: 'bill@bar.com',
        role: 'admin',
        rsvp: 'yes'
      }, {
        id: 'USER2',
        name: 'Fred',
        email: 'fred@bar.com',
        role: 'contrib',
        rsvp: 'maybe'
      }],
      items: [
      ],
      where: {},
      when: {}
    },
    'X2': {
      id: 'X2',
      public: false,
      owner: 'USER2',
      title: 'fred\'s birfday',
      description: 'I\'m not that old, come and celebrate with me!',
      users: [{
        id: 'USER1',
        name: 'Bill',
        email: 'bill@bar.com',
        role: 'contrib',
        rsvp: 'yes'
      }, {
        id: 'USER2',
        name: 'Fred',
        email: 'fred@bar.com',
        role: 'admin',
        rsvp: 'yes'
      }],
      items: [
      ],
      where: {},
      when: {}
    }
  };
  res.send(JSON.stringify(fake[id]));
});

app.get('/parties', function(req, res) {
  var fake = [
    { title: 'voting party',
      id: 'X1',
      public: true,
      owner: 'USER1'
    } ,
    { title: 'fred\'s birfday',
      id: 'X2',
      public: false,
      owner: 'USER2'
    } 
  ];
  res.send(JSON.stringify(fake));
});

app.get('/summary', function(req, res) {
  jsonGet({host: 'graph.facebook.com', port: 443, path: '/me?access_token=' + req.session.user.access_token}, function(result) {
    res.send(JSON.stringify(result));
  });
});

app.get('/getuser', function(req, res) {
  var response = {};
  if (req.session.user) {
    response.user = req.session.user;
  }
  res.send(JSON.stringify(response));
});

app.get('/logout', function(req, res) {
  var request = http.request({
    host: 'www.facebook.com',
    port: 80,
    path: '/logout.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function (result) {
    console.log(result);
    result.on('data', function(chunk){
      console.log('logout: ' + chunk);
    });
    delete req.session.user;
    res.send('{}', 200);
  });
  request.write('confirm=1');
  request.end();
});

app.get('/login', function(req, res) {

  var error = req.param('error');
  if (error) {
    // XXX TODO
    console.log(error);
    res.send(500);
    return;
  }

  var code = req.param('code');
  console.log({cody:code});

  https.get({
    host: 'graph.facebook.com',
    port: 443,
    path: '/oauth/access_token?client_id='+config.fb.key+'&redirect_uri=http://partyplanner.no.de/login&client_secret='+config.fb.secret+'&code='+code
  }, function(result) {
    var body = '';
    result.on('data', function (chunk) {
      body += chunk;
    });
    result.on('end', function() {
      if (result.statusCode != 200) {
        res.send(body, 500);
        return;
      }
      var parsed = qs.parse(body);
      console.log(parsed);
      req.session.user = {
        access_token: parsed.access_token
      };
      jsonGet({host: 'graph.facebook.com', port: 443, path: '/me?access_token=' + req.session.user.access_token}, function(result) {
        req.session.user.name = result.name;
        req.session.user.id = result.id;
        res.redirect('/index.html');
      });
    });
  });
  
});

app.get('/*', function(req, res){
  res.redirect('/index.html');
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
