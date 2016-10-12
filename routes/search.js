var express = require('express');
var imgRouter = express.Router();

var Search = require('bing.search');
var search = new Search(process.env.KEY);

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

imgRouter.route('/api/imagesearch/:query').get(function(req, res){
    
     function makeList(list){
       return{
           'url': list.url,
           'snippet': list.title,
           'thumbnail': list.thumbnail.url,
           'context': list.displayUrl
       };
   }
   
   function getLatest(link){
    MongoClient.connect(process.env.DB_DATA, function(err, db){
    if(err){
        throw err;
    } else {
        var collection = db.collection('links');
        var date = new Date();
        var timeStamp = date.toISOString();
        var latestSearch = { term: link, when: timeStamp };
        collection.insert([latestSearch]);
        }
    });
}
    
    var getImage = req.params.query;
    getLatest(getImage);
    var getTop = req.query.offset;
    search.images(getImage, {top: getTop}, function(err, body) {
     if(err) console.log(err);
   else res.json(body.map(makeList));
    });   
});

imgRouter.route('/api/latest/imagesearch').get(function(req, res){
   MongoClient.connect(process.env.DB_DATA, function(err, db){
    if(err){
        throw err;
    } else {
        var collection = db.collection('links');
        collection.find({}, { _id: 0 }).sort({ when: -1 }).limit(10).toArray(function(err, doc){
              if(err) console.log('cannot get data from collection');
              else {
                  res.json(doc);
              }
          });
        }
    });
});

module.exports = imgRouter;
