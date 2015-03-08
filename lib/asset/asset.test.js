'use strict';

/* jshint mocha:true, expr:true */

var expect = require('chai').expect;

describe('Asset', function () {

  var Asset = require('./asset');

  function noop() {
    // Do nothing...
  }

  it('is accessible', function () {
    expect(Asset).to.be.defined;
  });

  it('is a constructor', function () {
    expect(Asset).to.be.a('function');
    expect (new Asset('foo/bar/baz.ext')).to.be.instanceOf(Asset);
  });

  describe('constructor', function () {
    it('throws if no path is provided', function () {
      function initWithoutPath() {
        return new Asset();
      }

      expect(initWithoutPath).to.throw;
    });
  });


  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  describe('instance', function () {
    var asset;

    function runCallbackSuccess(r, cb) {
      if (arguments.length === 1) {
        cb = r;
      }

      cb(null, true);
    }

    function runCallbackError(r, cb) {
      if (arguments.length === 1) {
        cb = r;
      }

      cb(new Error('FAIL'));
    }

    beforeEach(function () {
      asset = new Asset('some/path.ext');
      asset._load = runCallbackSuccess;
      asset._install = runCallbackSuccess;
      asset._uninstall = runCallbackSuccess;
      asset._unload = runCallbackSuccess;
    });

    it('is an Asset', function () {
      expect(asset).to.be.instanceOf(Asset);
    });

    it('is an EventEmitter', function () {
      var EventEmitter = require('eventemitter2').EventEmitter2;
      expect(asset).to.be.instanceOf(EventEmitter);
    });


    ////////////////////////////////////////////////////////////////////////////
    describe('#isLoaded()', function () {
      it('is a function', function () {
        expect(asset.isLoaded).to.be.a('function');
      });

      it('returns false if not loaded', function () {
        expect(asset.isLoaded()).to.be.false;
      });

      it('returns true if loaded', function (done) {
        expect(asset.isLoaded()).to.be.false;

        asset.load(function (err) {
          if (!err) {
            expect(asset.isLoaded()).to.be.true;
          }

          done(err);
        });
      });


      it('returns false if failed to load', function (done) {
        asset._load = runCallbackError;

        // Just to prevent the 'error' event special case
        asset.on('error', noop);

        expect(asset.isLoaded()).to.be.false;

        asset.load(function (err) {
          expect(err).to.be.defined;
          expect(err.message).to.equal('FAIL');
          done();
        });
      });

      it('returns false while loading', function (done) {
        expect(asset.isLoaded(), 'Not loaded at start').to.be.false;
        asset.load(done);
        expect(asset.isLoading(), 'Loading').to.be.true;
        expect(asset.isLoaded(), 'Not loaded while loading').to.be.false;
      });
    }); // #isLoaded()

    ////////////////////////////////////////////////////////////////////////////
    describe('#isLoading()', function () {
      it('is a function', function () {
        expect(asset.isLoading).to.be.a('function');
      });

      it('returns true while loading', function (done) {
        expect(asset.isLoading()).to.be.false;
        asset.load(done);
        expect(asset.isLoading()).to.be.true;
      });

      it('returns false before load starts', function () {
        expect(asset.isLoaded()).to.be.false;
        expect(asset.isLoading()).to.be.false;
      });

      it('returns false after the asset is loaded', function (done) {
        expect(asset.isLoading()).to.be.false;
        asset.load(function () {
          expect(asset.isLoaded()).to.be.true;
          expect(asset.isLoading()).to.be.false;
          done();
        });
      });

      it('returns false after failing to load', function (done) {
        asset._load = runCallbackError;

        asset.on('error', noop);

        expect(asset.isLoading()).to.be.false;
        asset.load(function (err) {
          expect(err).to.not.be.null;
          expect(asset.isLoading()).to.be.false;
          done();
        });
      });
    }); // #isLoading()

    ////////////////////////////////////////////////////////////////////////////
    describe('#isUnloading()', function () {
      beforeEach(function (done) {
        asset.load(done);
      });

      it('is a function', function () {
        expect(asset.isUnloading).to.be.a('function');
      });

      it('returns true while unloading', function (done) {
        expect(asset.isUnloading()).to.be.false;
        asset.unload(done);
        expect(asset.isUnloading()).to.be.true;
      });

      it('returns false before unload starts');
      it('returns false if content is not loaded');
      it('returns false when unloaded');
    }); // #isUnloading()

    ////////////////////////////////////////////////////////////////////////////
    describe('#isInstalling()', function () {
      it('is a function');
      it('returns true while installing');
      it('returns false before installation starts');
      it('returns false when installed');
      it('returns false if not installed');
    }); // #isInstalling()

    ////////////////////////////////////////////////////////////////////////////
    describe('#isInstalled()', function () {
      it('is a function');
      it('returns true if installed');
      it('returns false if not installed');
    }); // #isInstalled()

    ////////////////////////////////////////////////////////////////////////////
    describe('#isUninstalling()', function () {
      it('is a function');
      it('returns true while uninstalling');
      it('returns false before uninstall starts');
      it('returns false when uninstalled');
    }); // #isUninstalling()

    ////////////////////////////////////////////////////////////////////////////
    describe('#load()', function () {
      it('is a function');
    }); // #load()

    ////////////////////////////////////////////////////////////////////////////
    describe('#unload()', function () {
      it('is a function');
    }); // #unload()

    ////////////////////////////////////////////////////////////////////////////
    describe('#install()', function () {
      it('is a function');
    }); // #install()

    ////////////////////////////////////////////////////////////////////////////
    describe('#uninstall()', function () {
      it('is a function');
    }); // #uninstall()

    ////////////////////////////////////////////////////////////////////////////
    describe('#unload()', function () {
      it('is a function');
    }); // #unload()
  });
});