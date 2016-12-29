var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');

var ratings = 0;
var total = 0;

var findRecord = function(db, query, callback) {
   var cursor = db.collection('referrer').find( query );
   cursor.each(function(err, doc) {
      //assert.equal(err, null);
      if (doc != null) {
          ratings = (Number(doc.ratings));
          total = (Number(doc.total));
        } else {
          callback();
      }
   });
};

var updateRecord = function(db, query, callback) {
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
    MongoClient.connect(mongodbaddress, function(err, db) {
        //assert.equal(null, err);
        findRecord(db, {'_id': ObjectId(req.query.id)}, function() {
            if (isNaN(total)==false && isNaN(ratings)==false) {
                ratings = (ratings + (Number(req.body.rating)));
                ++total;
                updateRecord(db, {'_id': ObjectId(req.query.id)}, function() {
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