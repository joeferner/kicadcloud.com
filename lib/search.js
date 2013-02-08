'use strict';

var path = require('path');
var java = require('java');
java.classpath.push(path.join(__dirname, "../lucene/lucene-core-4.0.0.jar"));
java.classpath.push(path.join(__dirname, "../lucene/lucene-analyzers-common-4.0.0.jar"));
java.classpath.push(path.join(__dirname, "../lucene/lucene-queryparser-4.0.0.jar"));
var async = require('async');
var Warning = require('./warning');
var log = require('./log');

var Document = java.import('org.apache.lucene.document.Document');
var Version = java.import('org.apache.lucene.util.Version');
var OpenMode = java.import('org.apache.lucene.index.IndexWriterConfig$OpenMode');
var StandardAnalyzer = java.import('org.apache.lucene.analysis.standard.StandardAnalyzer');
var KeywordAnalyzer = java.import('org.apache.lucene.analysis.core.KeywordAnalyzer');
var WhitespaceAnalyzer = java.import('org.apache.lucene.analysis.core.WhitespaceAnalyzer');
var IndexWriterConfig = java.import('org.apache.lucene.index.IndexWriterConfig');
var IndexWriter = java.import('org.apache.lucene.index.IndexWriter');
var FieldStore = java.import('org.apache.lucene.document.Field$Store');
var StringField = java.import('org.apache.lucene.document.StringField');
var LongField = java.import('org.apache.lucene.document.LongField');
var TextField = java.import('org.apache.lucene.document.TextField');
var Term = java.import('org.apache.lucene.index.Term');
var FSDirectory = java.import('org.apache.lucene.store.FSDirectory');
var IndexSearcher = java.import('org.apache.lucene.search.IndexSearcher');
var DirectoryReader = java.import('org.apache.lucene.index.DirectoryReader');
var QueryParser = java.import('org.apache.lucene.queryparser.classic.QueryParser');
var QueryParserBase = java.import('org.apache.lucene.queryparser.classic.QueryParserBase');
var File = java.import('java.io.File');
var Thread = java.import('java.lang.Thread');

var luceneIndexPath = path.join(__dirname, '../luceneIndex');
var luceneIndexFile = new File(luceneIndexPath);

exports.indexEdaItem = function(item, callback) {
  var text = item.title + ' ' + item.description + ' ' + item.keywords;
  text = text.toLowerCase().trim();
  return exports.index(item.id, text, callback);
};

function getAnalyzer() {
  //return new StandardAnalyzer(Version.LUCENE_40);
  //return new KeywordAnalyzer();
  return new WhitespaceAnalyzer(Version.LUCENE_40);
}

exports.index = function(id, text, callback) {
  FSDirectory.open(luceneIndexFile, function(err, dir) {
    if (err) {
      return callback(err);
    }

    var analyzer = getAnalyzer();
    var iwc = new IndexWriterConfig(Version.LUCENE_40, analyzer);
    iwc.setOpenModeSync(OpenMode.CREATE_OR_APPEND);

    var writer = new IndexWriter(dir, iwc);

    var doc = new Document();
    doc.addSync(new StringField('id', '' + id, FieldStore.YES));
    doc.addSync(new TextField('contents', text, FieldStore.NO));

//    var ts = new TextField('contents', text, FieldStore.NO).tokenStreamSync(analyzer);
//    ts.resetSync();
//    console.log(text);
//    do {
//      console.log('----');
//      console.log(ts.reflectAsStringSync(true));
//    } while (ts.incrementTokenSync());
    return writer.updateDocument(new Term('id', '' + id), doc, function(err) {
      if (err) {
        return callback(err);
      }

      return writer.close(callback);
    });
  });
};

exports.query = function(q, callback) {
  var maxResults = 10000;

  return FSDirectory.open(luceneIndexFile, function(err, dir) {
    if (err) {
      return callback(err);
    }

    return DirectoryReader.open(dir, function(err, reader) {
      if (err) {
        return callback(err);
      }

      var searcher = new IndexSearcher(reader);
      var analyzer = getAnalyzer();
      var parser = new QueryParser(Version.LUCENE_40, 'contents', analyzer);
      parser.setAllowLeadingWildcardSync(true);
      //q = q.replace('-', ' ');
      q = '*' + QueryParserBase.escapeSync(q) + '*';
      log.info('query for: ' + q);
      return parser.parse(q, function(err, luceneQuery) {
        if (err) {
          var m = err.toString().match(/ParseException:(.*)/);
          if (m) {
            return callback(new Warning(m[1].trim()));
          }
          return callback(err);
        }

        return searcher.search(luceneQuery, maxResults, function(err, results) {
          if (err) {
            return callback(err);
          }

          return async.map(results.scoreDocs, function(scoreDoc, callback) {
            return searcher.doc(scoreDoc.doc, function(err, doc) {
              if (err) {
                return callback(err);
              }
              return callback(null, {
                id: parseInt(doc.getSync('id')),
                score: scoreDoc.score
              });
            });
          }, function(err, hits) {
            hits = hits.sort(function(a, b) {
              if (a.score = b.score) {
                return 0;
              }
              return a.score > b.score ? 1 : -1;
            });
            reader.closeSync();
            return callback(null, hits);
          });
        });
      });
    });
  });
};

