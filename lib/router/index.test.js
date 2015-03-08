// FIXME Write proper tests for Router()
// I've written very quickly just to test some basic
// functionalities. I'm sure they can be improved/complemented.
'use strict';

/* jshint mocha:true, expr:true */

var sinon = require('sinon');
var expect = require('chai').expect;


describe.only('Router', function () {
  var Router = require('./index');

  var syncAction = sinon.stub();

  var asyncAction = sinon.spy(function (req, cb) {
    cb(null);
  });

  var router;

  beforeEach(function () {
    syncAction.reset();
    asyncAction.reset();
    router = new Router();
  });

  it('is accessible', function () {
    expect(Router).to.be.defined;
  });

  it('is a constructor', function () {
    expect(router).to.be.an('object');
    expect(router).to.be.instanceOf(Router);
  });

  describe('instance', function () {

    describe('#set()', function () {
      it('is available', function () {
        expect(router.set).to.be.defined;
      });

      it('is a function', function () {
        expect(router.set).to.be.a('function');
      });

      it('adds a route to the router', function () {
        var routes = router._routes;
        expect(routes).to.be.empty;
        var route = router.set('/foo', syncAction);
        expect(routes).to.have.length(1);
        expect(routes[0]).to.equal(route);
      });

      it('returns the created route', function () {
        var routes = router._routes;
        var route = router.set('/foo', syncAction);
        expect(routes[0]).to.equal(route);
      });
    });


    describe('#process()', function () {
      var route;

      beforeEach(function () {
        route = router.set('/test', syncAction);
      });

      it('is available', function () {
        expect(router.process).to.be.defined;
      });

      it('is a function', function () {
        expect(router.process).to.be.a('function');
      });

      it('returns the matched route', function () {
        expect(router.process('/test')).to.equal(route);
      });

      it('runs the matched route\'s action', function () {
        expect(syncAction).to.not.have.beenCalled;
        router.process('/test');
        expect(syncAction).to.have.been.calledOnce;
        expect(syncAction).to.have.been.calledWith('/test', '/test');
      });

      it('returns null if no route matches the given path', function () {
        expect(router.process('/nomatch')).to.be.null;
      });

      describe('options.stopAtFirstMatch', function () {
        var router2, routes;

        beforeEach(function () {
          router2 = new Router({
            stopAtFirstMatch: false
          });

          routes = [
            router2.set('/test/path', syncAction),
            router2.set('/another/test', syncAction),
            router2.set('/test', syncAction)
          ];
        });

        it('defaults to true', function () {
          expect(router.options.stopAtFirstMatch).to.be.true;
        });

        it('runs only the first matched route when set to true', function () {
          expect(syncAction).to.not.have.been.called;
          router.process('/test');
          expect(syncAction).to.have.been.calledOnce;
        });

        it('runs all matched routes when set to false', function () {
          expect(syncAction).to.not.have.been.called;
          router2.process('/test');
          expect(syncAction).to.have.been.calledTwice;
        });

        it('returns an array of matched routes when set to false', function () {
          var matches = router2.process('/test');
          expect(matches[0]).to.equal(routes[0]);
          expect(matches[1]).to.equal(routes[2]);
        });

        it('returns null if no route is matched when set to false',
          function () {
            expect(router2.process('/nomatch')).to.be.null;
          });
      });
    });
  });

});