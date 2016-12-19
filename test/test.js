var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var db;

describe('EasyPoll asynchronous tests', function(){
    console.log('Scheduling EasyPoll tests');
    var connection;
    before(function(done) {
    // Setup
        console.log('Establishing MongoDB connection');
        var mongodbaddress = 'mongodb://localhost:27017/easypoll_development';
        MongoClient.connect(mongodbaddress, function(err, db) {
            connection = db;
            assert.equal(null, err);
            console.log ('Successfully Connected - Proceed to tests');
            done(); 
        });
    });
    describe('Confirming connection', function() {
        it('should be connected', function(done){
            assert.notEqual(null, connection);
            done();
        });
    });
    describe('Querying collection for test document', function() {
        it('should not be found', function(done){
            connection.collection('referrer').createIndex( {'referrer': 1}, { unique: true } )
            var cursor = connection.collection('referrer').find( {'referrer': 'test'} );
            cursor.each(function(err, doc) {
                assert.equal(null, doc);
                done();
            });
        });
    });
    describe('Inserting test document into collection', function() {
        it('should be inserted', function(done){
            connection.collection('referrer').update(
                { referrer: 'test' },
                {
                $setOnInsert: { total: 0, ratings: 0, referrer: 'test' }
                },
                { upsert: true },
                function(err, result) {
                    assert.equal(err, null);
                    done();
            }); 
        });
    });
    describe('Querying collection for test document', function() {
        it('should be found', function(done){
            var cursor = connection.collection('referrer').find( {'referrer': 'test'} );
            cursor.each(function(err, doc) {
                //assert.equal(err, null);
                assert.notEqual(null, doc);
                done();
            });
        });
    });
    describe('Removing test document from collection', function() {
        it('should be found and removed', function(done){
            connection.collection('referrer').deleteOne(
            { referrer: 'test' },
            function(err, results) {
                assert.equal(err, null);
                done();
            });
        });
    });
    describe('Querying collection for test document', function() {
        it('should not be found', function(done){
            var cursor = connection.collection('referrer').find( {'referrer': 'test'} );
            cursor.each(function(err, doc) {
                assert.equal(null, doc);
                console.log ('Closing connection');
                connection.close();
                done();
            });
        });
    });
})