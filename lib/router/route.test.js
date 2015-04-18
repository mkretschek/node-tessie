// FIXME Write proper tests for Route()
// I've written very quickly just to test some basic
// functionalities. I'm sure they can be improved/complemented.
'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

/* jshint mocha:true, expr:true */

describe.skip('Route', function () {

  var Route = require('./route');
  var syncRoute, asyncRoute;

  var syncAction = sinon.stub();
  var asyncAction = sinon.spy(function (req, cb) {
    cb(null);
  });

  beforeEach(function () {
    syncAction.reset();
    asyncAction.reset();
    syncRoute = new Route('/test', syncAction);
    asyncRoute = new Route('/test', asyncAction);
  });

  it('is accessible', function () {
    expect(Route).to.be.defined;
  });

  it('is a constructor', function () {
    expect(Route).to.be.a('function');
    expect(syncRoute).to.be.instanceOf(Route);
  });

  describe('instance', function () {
    it('has a path', function () {
      expect(syncRoute.path).to.be.defined;
      expect(syncRoute.path).to.equal('/test');
    });

    it('has an action', function () {
      expect(syncRoute.action).to.be.defined;
      expect(syncRoute.action).to.equal(syncAction);
    });

    describe('#match()', function () {
      it('is accessible', function () {
        expect(syncRoute.match).to.be.defined;
      });

      it('is a function', function () {
        expect(syncRoute.match).to.be.a('function');
      });


      describe('with strings', function () {
        it('returns the full path and the matched path', function () {
          var match = syncRoute.match('/test/path');

          expect(match[0]).to.equal('/test/path');
          expect(match[1]).to.equal('/test');
        });

        it('matches only at the beginning of the path', function () {
          var match = syncRoute.match('/path/test');
          expect(match).to.be.null;
        });

        it('returns null if match fails', function () {
          expect(syncRoute.match('/nomatch')).to.be.null;
        });
      });


      describe('with regex', function () {
        beforeEach(function () {
          syncRoute = new Route(/^\/test/, syncAction);
        });

        it('returns an array on success', function () {
          var match = syncRoute.match('/test/path');
          expect(Array.isArray(match)).to.be.true;
        });

        it('returns null on failure', function () {
          expect(syncRoute.match('/nomatch')).to.be.null;
        });

        it('returns the given path as the first element', function () {
          var match = syncRoute.match('/test/foo');
          expect(match[0]).to.equal('/test/foo');
        });

        it('returns the matched path as the second element', function () {
          var match = syncRoute.match('/test/foo');
          expect(match[1]).to.equal('/test');
        });

        it('returns matched groups as subsequent elements', function () {
          var syncRoute = new Route(/^\/test\/(\d{3})\/(\d{4})/, syncAction);
          var match = syncRoute.match('/test/123/4567/nondigit');
          expect(match[0]).to.equal('/test/123/4567/nondigit');
          expect(match[1]).to.equal('/test/123/4567');
          expect(match[2]).to.equal('123');
          expect(match[3]).to.equal('4567');
        });
      });
    });


    describe('#run()', function () {
      it('is accessible');
      it('is a function');
    });

    describe('#isAsync()', function () {
      it('returns true if the action expects a callback', function () {
        expect(asyncRoute.isAsync()).to.be.true;
      });

      it('returns false if the action does not expect a callback',
        function () {
          expect(syncRoute.isAsync()).to.be.false;
        });
    });

    describe('#process()', function () {
      it('is accessible', function () {
        expect(syncRoute.process).to.be.defined;
      });

      it('is a function', function () {
        expect(syncRoute.process).to.be.a('function');
      });

      it('executes the route action if it matches the given path',
        function () {
          expect(syncAction).to.not.have.beenCalled;
          syncRoute.process('/test');
          expect(syncAction).to.have.been.calledOnce;
        });

      it('passes a request object to the action', function () {
        syncRoute.process('/test');
        var req = syncAction.lastCall.args[0];

        expect(req).to.be.defined;
        expect(req).to.have.property('path');
        expect(req).to.have.property('match');
        expect(req).to.have.property('args');
      });

      it('returns a request object when it matches the given path',
        function () {
          var req = syncRoute.process('/test');

          expect(req).to.be.defined;
          expect(req).to.have.property('path');
          expect(req).to.have.property('match');
          expect(req).to.have.property('args');
        });

      it('returns null when it does not match the given path', function () {
        expect(syncRoute.process('/nomatch')).to.be.null;
      });

      it('is async if a callback is provided', function (done) {
        asyncRoute.process('/test', done);
      });

      it('passes the request object to the callback on match', function (done) {
        asyncRoute.process('/test', function (err, req) {
          if (err) { return err; }
          expect(req).to.be.an('object');
          expect(req).to.have.property('path');
          expect(req).to.have.property('match');
          done();
        });
      });

      it('passes `null` to the callback if no match is found', function (done) {
        asyncRoute.process('/nomatch', function (err, req) {
          expect(req).to.be.null;
          done();
        });
      });

    });
  });
});