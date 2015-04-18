'use strict';

/* jshint mocha:true, expr:true */

var _ = require('lodash');
var expect = require('chai').expect;

var Data = require('./data');
var Script = require('./script');
var Img = require('./image');
var Style = require('./style');

var util = require('../');


describe.only('asset/List', function () {
  var List = require('./list');
  var Asset = require('./asset');
  var EventEmitter = require('eventemitter2').EventEmitter2;

  it('is accessible', function () {
    expect(List).to.be.defined;
  });

  it('is a function', function () {
    expect(List).to.be.a('function');
  });

  it('implements the same methods as an Asset');

  describe('instance', function () {
    var list;
    var assets;

    function notLoaded(asset) {
      return !asset.isLoaded();
    }

    function loaded(asset) {
      return asset.isLoaded();
    }

    function notInstalled(asset) {
      return !asset.isInstalled();
    }

    function installed(asset) {
      return asset.isInstalled();
    }

    // Simulates a successful call
    function runCallbackSuccess(r, cb) {
      if (arguments.length === 1) {
        cb = r;
      }

      cb(null, true);
    }

    // Simulates a failed call
    function runCallbackError(r, cb) {
      if (arguments.length === 1) {
        cb = r;
      }

      cb(new Error('TEST ERROR'));
    }

    beforeEach(function () {
      list = new List();

      assets = [];
      assets.push(new Asset('./test1'));
      assets.push(new Asset('./test2'));
      assets.push(new Asset('./test3'));

      _.each(assets, function (a) {
        a._load = runCallbackSuccess;
        a._install = runCallbackSuccess;
        a._uninstall = runCallbackSuccess;
        a._unload = runCallbackSuccess;

        list.add(a);
      });
    });

    afterEach(function (done) {
      list.unload(done);
    });

    it('is an object', function () {
      expect(list).to.be.an('object');
    });

    it('is an EventEmitter', function () {
      expect(list).to.be.instanceof(EventEmitter);
    });

    it('is a List', function () {
      expect(list).to.be.instanceof(List);
    });


    describe('#add()', function () {
      it('is accessible', function () {
        expect(list.add).to.be.defined;
      });

      it('is a function', function () {
        expect(list.add).to.be.a('function');
      });

      it('allows chaining', function () {
        expect(list.add(new Asset('./test'))).to.equal(list);
      });

      it('adds an asset to the end of the list', function () {
        var asset4 = new Asset('./test4');

        expect(list).to.have.length(3);
        list.add(asset4);
        expect(list).to.have.length(4);
        expect(list[0]).to.equal(assets[0]);
        expect(list[1]).to.equal(assets[1]);
        expect(list[2]).to.equal(assets[2]);
        expect(list[3]).to.equal(asset4);
      });

      it('converts strings to assets', function () {
        var list = new List();

        list
          .add('./foo.js')
          .add('./foo.css')
          .add('./foo.png')
          .add('./foo.json');

        expect(list[0]).to.be.instanceof(Script);
        expect(list[1]).to.be.instanceof(Style);
        expect(list[2]).to.be.instanceof(Img);
        expect(list[3]).to.be.instanceof(Data);
      });

      it('works with an array of assets', function () {
        var list = new List();
        var asset = new Asset('./foo');

        list.add([
          './foo.js',
          './foo.css',
          './foo.png',
          './foo.json',
          asset
        ]);

        expect(list[0]).to.be.instanceof(Script);
        expect(list[1]).to.be.instanceof(Style);
        expect(list[2]).to.be.instanceof(Img);
        expect(list[3]).to.be.instanceof(Data);
        expect(list[4]).to.equal(asset);
      });

      it('inserts at specific position if an index is given', function () {
        var asset = new Asset('./foo');

        expect(list).to.have.length(3);
        expect(list[1]).to.equal(assets[1]);

        list.add(asset, 1);
        expect(list).to.have.length(4);
        expect(list[1]).to.equal(asset);
        expect(list[2]).to.equal(assets[1]);
      });

      it('does not allow duplicate assets', function () {
        expect(list).to.have.length(3);
        expect(list[0]).to.equal(assets[0]);
        expect(list[1]).to.equal(assets[1]);
        expect(list[2]).to.equal(assets[2]);

        list.add(assets[0]);
        expect(list).to.have.length(3);
        expect(list[0]).to.equal(assets[0]);
        expect(list[1]).to.equal(assets[1]);
        expect(list[2]).to.equal(assets[2]);
      });

      it('loads assets added after the list has been loaded', function (done) {
        var list = new List();
        var asset = assets[0];

        asset.on('load', function () {
          done();
        });

        list.load(function (err) {
          if (err) { return done(err); }

          expect(asset.isLoaded()).to.be.false;

          list.add(asset);
        });
      });


      it('installs assets added after the list has been installed',
        function (done) {
          var list = new List();
          var asset = assets[0];

          asset.on('install', function () {
            expect(asset.isLoaded()).to.be.true;
            expect(asset.isInstalled()).to.be.true;
            done();
          });

          list.install(function (err) {
            if (err) { return done(err); }

            expect(asset.isLoaded()).to.be.false;
            expect(asset.isInstalled()).to.be.false;

            list.add(asset);
          });
        });
    });


    describe('#load()', function () {
      it('is accessible', function () {
        expect(list.load).to.be.defined;
      });

      it('is a function', function () {
        expect(list.load).to.be.a('function');
      });

      it('loads all assets in the list', function (done) {
        expect(_.every(list, notLoaded)).to.be.true;

        list.load(function (err) {
          if (err) { return done(err); }
          expect(_.every(list, loaded)).to.be.true;
          done();
        });
      });

      it('fails if any of the assets fail to load', function (done) {
        assets[1]._load = runCallbackError;

        // Just to prevent the special 'error' event case
        assets[1].on('error', util.noop);
        list.on('error', util.noop);

        list.load(function (err) {
          expect(err).not.to.be.null;
          expect(err).to.be.instanceof(Error);
          expect(err.message).to.equal('TEST ERROR');
          done();
        });
      });

      it('loads assets in parallel', function (done) {
        list.load(done);

        expect(list[0].isLoading()).to.be.true;
        expect(list[1].isLoading()).to.be.true;
        expect(list[2].isLoading()).to.be.true;
      });

      it('respects `options.maxDownloads`', function (done) {
        var list = new List({
          maxDownloads: 1
        });

        list.add(assets);

        list.load(done);

        expect(list[0].isLoading()).to.be.true;
        expect(list[1].isLoading()).to.be.false;
        expect(list[2].isLoading()).to.be.false;
      });
    });


    describe('#install()', function () {
      it('is accessible', function () {
        expect(list.install).to.defined;
      });

      it('is a function', function () {
        expect(list.install).to.be.a('function');
      });

      it('loads all unloaded assets in the list', function (done) {
        expect(_.every(list, notLoaded)).to.be.true;

        list.install(function (err) {
          if (err) { return done(err); }

          expect(_.every(list, loaded)).to.be.true;
          done();
        });
      });

      it('installs all assets in the list', function (done) {
        expect(_.every(list, notInstalled)).to.be.true;

        list.install(function (err) {
          if (err) { return done(err); }

          expect(_.every(list, installed)).to.be.true;
          done();
        });
      });

      it('respects `options.maxDownloads` (with not-loaded assets)',
        function (done) {
          var list = new List({
            maxDownloads: 1
          });

          list.add(assets);

          list.install(function (err) {
            if (err) { return done(err); }
            done();
          });

          expect(list[0].isLoading(), 'asset 0 is loading').to.be.true;
          expect(list[1].isLoading(), 'asset 1 is loading').to.be.false;
          expect(list[2].isLoading(), 'asset 2 is loading').to.be.false;
        });
    });
  });
});