var express = require('express');
var router = express.Router();

var url = require('url');

var sanitizeHtml = require('sanitize-html');

var mongoclient = require('mongodb').MongoClient;
var assert = require('assert');

var id = '';
var referrer = '';
var total = 0;
var ratings = 0;
var results = '';

var findReferrer = function(db, query, callback) {
   //Create index on referrer to ensure no duplicates and allowed, needed for upsert
   db.collection('referrer').createIndex( {'referrer': 1}, { unique: true } )
   var cursor = db.collection('referrer').find( query );
   cursor.each(function(err, doc) {
      //assert.equal(err, null);
      if (doc != null) {
          console.log ('Poll referrer found in database - Passing ratings to view');
          console.dir(doc);
          ratings = (Number(doc.ratings));
          total = (Number(doc.total));
          id = doc._id;
        } else {
          console.log ('Finished searching database for referrer - Exiting');
          callback();
      }
   });
};
var insertRecord = function(db, req, callback) {
    console.log ('Creating empty record using updateOne to make sure no duplicates are created');
    db.collection('referrer').update(
        { referrer: referrer },
        {
            //Only update if a new document is inserted
            $setOnInsert: { total: 0, ratings: 0, referrer: referrer }
        },
            //Inserts a single document if non exists
        { upsert: true },
        function(err, result) {
            //assert.equal(err, null);
            callback();
    }); 
};

var getFormattedUrl = function(req) {
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });
}

router.get('/', function(req, res, next) {
    var mongodbaddress = req.app.get('mongodbaddress');
    id = '';
    total = 0;
    ratings = 0;
    results='';
    referrer = (sanitizeHtml(getFormattedUrl(req))).replace(/[^A-Za-z0-9]/g, '');
    console.log ('Instance referrer: ' + referrer);
    mongoclient.connect(mongodbaddress, function(err, db) {
        //assert.equal(null, err);
        findReferrer(db, {'referrer': referrer}, function() {
            if (id!='') {
                db.close();
                if (isNaN(total)==false && isNaN(ratings)==false) {
                    if (total!=0) {
                        results = ('Average ' + (ratings/total).toFixed(2) + '.  Total votes: ' + (total));
                        console.log (results);
                    }
                }
                res.render('index', { title: 'EasyPoll', description: 'Rate this', id: id, results: results});
            } else {                    
                insertRecord(db, req, function() {
                    findReferrer(db, {'referrer': referrer}, function() {
                        db.close();
                        res.render('index', { title: 'EasyPoll', description: 'Rate this', id: id, results: results});
                    });
                });
            }
        });
    });
});

module.exports = router;
