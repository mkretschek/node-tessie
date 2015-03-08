
describe('core/api.Call', function () {
  'use strict';

  var expect = require('chai').expect;
  var sinon = require('sinon');
  var xhr = require('xhr');

  var Call = require('./call');
  var HttpMethod = require('../../util/enum/http-method');

  var call;

  beforeEach(function () {
    call = new Call(HttpMethod.GET, '/foo/bar');
  });

  it('is accessible', function () {
    expect(Call).to.be.defined;
  });

  it('is a constructor', function () {
    expect(Call).to.be.a('function');
    expect(call).to.be.instanceof(Call);
  });

  it('works without the \'new\' keyword', function () {
    /* jshint newcap:false */
    var call = Call(HttpMethod.GET, '/foo/bar');
    expect(call).to.be.instanceof(Call);
  });

  describe('instance', function () {

    describe('#header()', function () {
      it('is accessible', function () {
        expect(call.header).to.be.defined;
      });

      it('is a function', function () {
        expect(call.header).to.be.a('function');
      });

      it('sets the header with the given name to the given value',
        function () {
          var headers = call._headers;
          expect(headers).not.to.have.property('Content-Type');
          call.header('Content-Type', 'application/json');
          expect(headers).to.have.property('Content-Type');
          expect(headers['Content-Type']).to.equal('application/json');
        });

      it('sets multiple headers based on the given object',
        function () {
          var headers = call._headers;
          expect(headers).not.to.have.property('Foo-Header');
          expect(headers).not.to.have.property('Bar-Header');

          call.header({
            'Foo-Header': 'foo',
            'Bar-Header': 'bar'
          });

          expect(headers).to.have.property('Foo-Header');
          expect(headers).to.have.property('Bar-Header');

          expect(headers['Foo-Header']).to.equal('foo');
          expect(headers['Bar-Header']).to.equal('bar');
        });

      it('allows chaining', function () {
        var headers = call._headers;

        expect(headers).not.to.have.property('Foo-Header');
        expect(headers).not.to.have.property('Bar-Header');

        call
          .header('Foo-Header', 'foo')
          .header('Bar-Header', 'bar');

        expect(headers).to.have.property('Foo-Header');
        expect(headers).to.have.property('Bar-Header');
      });
    });


    describe('#data()', function () {
      it('is accessible', function () {
        expect(call.data).to.be.defined;
      });

      it('is a function', function () {
        expect(call.data).to.be.a('function');
      });

      it('sets the call\'s data', function () {
        expect(call._data).not.to.be.defined;
        call.data('loremipsum');
        expect(call._data).to.be.defined;
        expect(call._data).to.equal('loremipsum');
      });

      it('replaces previous data', function () {
        call.data('foobar');
        expect(call._data).to.equal('foobar');
        call.data('barbaz');
        expect(call._data).to.equal('barbaz');
      });

      it('allows chaining', function () {
        expect(call.data('foo')).to.equal(call);
      });
    });


    describe('#json()', function () {
      it('is accessible', function () {
        expect(call.json).to.be.defined;
      });

      it('is a function', function () {
        expect(call.json).to.be.a('function');
      });

      it('aliases #data()', function () {
        expect(call.json).to.equal(call.data);
      });
    });


    describe('#send()', function () {
      var callback = sinon.spy();

      beforeEach(function () {
        callback.reset();
      });

      it('is accessible', function () {
        expect(call.send).to.be.defined;
      });

      it('is a function', function () {
        expect(call.send).to.be.a('function');
      });

      it('sends the data set', function () {
        call.data('foobar');

        expect(xhr).to.not.have.been.called;
        call.send();
        expect(xhr).to.have.been.calledOnce;
        var config = xhr.lastCall.args[0];
        expect(config.body).to.equal(call._data);
      });

      it('sends objects as json', function () {
        call.data({foo: 'bar'});

        expect(xhr).to.not.have.been.called;
        call.send();
        expect(xhr).to.have.been.calledOnce;
        var config = xhr.lastCall.args[0];
        expect(config.body).not.to.be.defined;
        expect(config.json).to.equal(call._data);
      });

      it('sends the headers', function () {
        call.header('Foo-Header', 'foo');

        expect(xhr).to.not.have.been.called;
        call.send();
        expect(xhr).to.have.been.calledOnce;
        var config = xhr.lastCall.args[0];
        expect(config.headers).to.equal(call._headers);
      });

      it('sends the given data', function () {
        call.send('foo');
        var config = xhr.lastCall.args[0];
        expect(config.body).to.equal('foo');
      });

      it('calls the callback on success', function (done) {
        var response = {};

        var callback = sinon.spy(function (err, response) {
          expect(callback).to.have.been.calledOnce;
          // It might seem a little stupid to test if the callback has
          // been called with the arguments we provided to a stub, but
          // keep in mind that we wrap the callback with an internal
          // callback.
          expect(callback).to.have.been.calledWith(null, response, '123');
          done(err);
        });

        xhr.callsArgWith(1, null, response, '123');
        call.send('foo', callback);
      });

      it('calls the callback on error', function (done) {
        var r = {};
        var error = new Error('Test error');
        error.code = 'TEST_ERROR';

        var callback = sinon.spy(function (err, response) {
          expect(callback).to.have.been.calledOnce;
          // It might seem a little stupid to test if the callback has
          // been called with the arguments we provided to a stub, but
          // keep in mind that we wrap the callback with an internal
          // callback.
          expect(err).to.equal(error);
          expect(response).to.equal(r);
          done(err === error ? null : err);
        });

        xhr.callsArgWith(1, error, r);
        call.send('foo', callback);
      });

      it('makes data optional', function (done) {
        xhr.callsArgWith(1, null, {}, '123');
        call.send(done);
      });

      it('passes the response to the callback', function (done) {
        var r = {};

        var callback = sinon.spy(function (err, response) {
          expect(callback).to.have.been.calledOnce;
          // It might seem a little stupid to test if the callback has
          // been called with the arguments we provided to a stub, but
          // keep in mind that we wrap the callback with an internal
          // callback.
          expect(response).to.equal(r);
          done(err);
        });

        xhr.callsArgWith(1, null, r);
        call.send(callback);
      });

      it('passes the response body to the callback', function (done) {
        var r = {};

        var callback = sinon.spy(function (err, response, body) {
          expect(callback).to.have.been.calledOnce;
          // It might seem a little stupid to test if the callback has
          // been called with the arguments we provided to a stub, but
          // keep in mind that we wrap the callback with an internal
          // callback.
          expect(body).to.equal('response body');
          done(err);
        });

        xhr.callsArgWith(1, null, r, 'response body');
        call.send(callback);
      });

      it('returns the xhr object', function (done) {
        var xhrObject = {};
        xhr.returns(xhrObject);
        var result = call.send(done);
        expect(result).to.equal(xhrObject);
      });
    });
  });
});