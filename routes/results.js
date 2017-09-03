var express = require('express');
var router = express.Router();

var mongoclient = require('mongodb').MongoClient;
var objectid = require('mongodb').ObjectID;
var assert = require('assert');

var findRecord = function(db, query, callback) {
   var cursor = db.collection('referrer').find( query );
   var ratings = 0;
   var total = 0;
   cursor.each(function(err, doc) {
      //assert.equal(err, null);
      if (doc != null) {
          ratings = (Number(doc.ratings));
          total = (Number(doc.total));
        } else {
          callback(ratings, total);
      }
   });
};

var updateRecord = function(db, query, ratings, total, callback) {
    console.log ('Updating record');
    db.collection('referrer').updateOne(
      query,
      {
        $set: { 'ratings': ratings, 'total': total }
      }, function(err, results) {
          //assert.equal(err, null);
          callback();
   });
};

router.post('/', function(req, res, next) {
    var mongodbaddress = req.app.get('mongodbaddress');
    mongoclient.connect(mongodbaddress, function(err, db) {
        //assert.equal(null, err);
        findRecord(db, {'_id': objectid(req.query.id)}, function(ratings, total) {
            if (isNaN(total)==false && isNaN(ratings)==false) {
                ratings = (ratings + (Number(req.body.rating)));
                ++total;
                updateRecord(db, {'_id': objectid(req.query.id)}, ratings, total, function() {
                    db.close();
                    res.redirect (req.headers.referer);
                });  
            } else {
                res.redirect (req.headers.referer);
            }
        });
    });      
});

module.exports = router;