'use strict';

var path = require('path');
var java = require('java');
java.classpath.push(path.join(__dirname, "../lucene/lucene-core-4.0.0.jar"));
java.classpath.push(path.join(__dirname, "../lucene/lucene-analyzers-common-4.0.0.jar"));
java.classpath.push(path.join(__dirname, "../lucene/lucene-queryparser-4.0.0.jar"));
var async = require('async');

var Document = java.import('org.apache.lucene.document.Document');
var Version = java.import('org.apache.lucene.util.Version');
var OpenMode = java.import('org.apache.lucene.index.IndexWriterConfig$OpenMode');
var StandardAnalyzer = java.import('org.apache.lucene.analysis.standard.StandardAnalyzer');
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
var File = java.import('java.io.File');
var Thread = java.import('java.lang.Thread');

var luceneIndexPath = path.join(__dirname, '../luceneIndex');
var luceneIndexFile = new File(luceneIndexPath);

exports.index = function(id, text, callback) {
  FSDirectory.open(luceneIndexFile, function(err, dir) {
    if (err) {
      return callback(err);
    }

    var analyzer = new StandardAnalyzer(Version.LUCENE_40);
    var iwc = new IndexWriterConfig(Version.LUCENE_40, analyzer);
    iwc.setOpenModeSync(OpenMode.CREATE_OR_APPEND);

    var writer = new IndexWriter(dir, iwc);

    var doc = new Document();
    doc.addSync(new StringField('id', '' + id, FieldStore.YES));
    doc.addSync(new TextField('contents', text, FieldStore.NO));

    //writer.addDocumentSync(doc);
    return writer.updateDocument(new Term('id', '' + id), doc, function(err) {
      if (err) {
        return callback(err);
      }

      return writer.close(callback);
    });
  });
};

exports.query = function(q, opts, callback) {
  opts = opts || {};
  opts.maxResults = opts.maxResults || 10;

  return FSDirectory.open(luceneIndexFile, function(err, dir) {
    if (err) {
      return callback(err);
    }

    return DirectoryReader.open(dir, function(err, reader) {
      if (err) {
        return callback(err);
      }

      var searcher = new IndexSearcher(reader);
      var analyzer = new StandardAnalyzer(Version.LUCENE_40);
      var parser = new QueryParser(Version.LUCENE_40, 'contents', analyzer);
      return parser.parse(q, function(err, luceneQuery) {
        if (err) {
          return callback(err);
        }

        return searcher.search(luceneQuery, opts.maxResults, function(err, results) {
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
            reader.closeSync();
            return callback(null, hits);
          });
        });
      });
    });
  });
};

