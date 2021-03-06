/**
 * Module dependencies.
 */
try {
  var configs = require('./configs');
} catch (error) {
  //ignore 
}
var express = require('express')
  , MailChimpAPI = require('mailchimp').MailChimpAPI;

var bodyParser = require('body-parser');
var multer = require('multer'); 

var mc_api_key = process.env.MC_API_KEY;
var mc_newsletter_id = process.env.MC_NEWSLETTER_ID;

var mc_interest_group = "General All Purpose";

try { 
    var api = new MailChimpAPI(mc_api_key, { version : '1.3', secure : false });
} catch (error) {
    console.log(error.message);
}

/**
 * App.
 */

var port = process.env.PORT || 3000;
var app = express();
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname);
app.listen( port );
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

/**
 * App routes.
 */

app.get('/', function (req, res) {
  res.render('index.html', { layout: false });
});

app.get('/about', function (req, res) {
  res.render('about.html', { layout: false });
});

app.get('/conduct', function (req, res) {
  res.render('conduct.html', { layout: false });
});

app.get('/pokodome', function (req, res) {
  res.render('pokodome.html', { layout: false });
});

app.get('/store', function (req, res) {
  res.render('store.html', { layout: false });
});

app.get('/games', function (req, res) {
  res.render('games.html', { layout: false });
});

app.get('/kolab', function (req, res) {
  res.render('kolab.html', { layout: false });
});

app.get('/workshops', function (req, res) {
  res.render('workshops.html', { layout: false });
});

app.get('/gardenarium', function (req, res) {
  res.render('gardenarium.html', { layout: false });
});

app.get('/orchids', function (req, res) {
  res.render('orchids.html', { layout: false });
});

app.get('/jobs', function (req, res) {
  res.render('jobs.html', { layout: false });
});

app.get('/behindplay', function (req, res) {
  res.render('lbp.html', { layout: false });
});

app.post('/mailing_list/subscribe', function (req, res) {
  var email = req.body.email;
  subscribe(email, mc_interest_group, res);
});

app.post('/mailing_list/subscribe_general', function (req, res) {
  var email = req.body.email;
  subscribe(email, "General All Purpose", res);
});


/**
 * App listen.
 */


// Subscribe to our mailing list
function subscribe(email, groups, res) {
  api.listSubscribe({ id: mc_newsletter_id, 
                      email_address: email,
                      merge_vars: {EMAIL: email,
                                  FNAME: '',
                                  LNAME: '',
                                  GROUPINGS: [{id: 8953, groups: groups}]}},
    function(error, data) {
      if (error) {
        var error_message = "";
        console.log(error.code);

        // Invalid Email Error
        if ( error.code == 502 ) {
            error_message = "Subscription failed.  Please verify that your email address is correct.";
        }
        // Already a Member, so we update his interests
        else if ( error.code == 214 ) {
           error_message = "You've been added to the " + groups + " group.";
           api.listUpdateMember({ id: mc_newsletter_id, 
                                  email_address: email,
                                  merge_vars: {EMAIL: email,
                                               GROUPINGS: [{id: 8953, groups: groups}]},
                                  replace_interests: false},
                                  function(error, data) {
                                      if (error) {
                                          console.log(error.message);
                                      }
                                      else {
                                          console.log(JSON.stringify(data));
                                      }
                                  });

        }

        res.send("<p>" + error_message + "</p>");
      }
      else {
        console.log(JSON.stringify(data)); // Do something with your data! 
        res.send("<p>You are subscribed.  Please check your email for a confirmation.</p>");
      }
    });
};

