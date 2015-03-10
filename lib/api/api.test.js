
/* jshint mocha:true, expr:true */

describe('config/api.API', function () {
  'use strict';

  var expect = require('chai').expect;

  var HttpMethod = require('../enum/http-method');
  var Call = require('./call');
  var API = require('./api');

  var api;

  var BASE_URI = 'http://api.host.dlt';

  beforeEach(function () {
    api = new API(BASE_URI);
    api.endpoint('foobar', '/foo/bar');
  });

  it('is accessible', function () {
    expect(API).to.be.defined;
  });

  it('is a constructor', function () {
    expect(api).to.be.instanceOf(API);
  });

  it('normalizes the base url', function () {
    var api = new API('http://foo.bar/');
    expect(api.base).to.equal('http://foo.bar');
  });

  describe('#get()', function () {
    it('is accessible', function () {
      expect(api.get).to.be.defined;
    });

    it('is a function', function () {
      expect(api.get).to.be.a('function');
    });

    it('returns a Call instance with GET method', function () {
      var call = api.get('foobar');
      expect(call).to.be.instanceOf(Call);
      expect(call.method).to.equal(HttpMethod.GET);
    });

    it('passes the "endpoint" URL to the call', function () {
      var call = api.get('foobar');
      expect(call.uri).to.equal('http://api.host.dlt/foo/bar');
    });
  }); // #get()



  describe('#post()', function () {
    it('is accessible', function () {
      expect(api.post).to.be.defined;
    });

    it('is a function', function () {
      expect(api.post).to.be.a('function');
    });

    it('returns a Call instance with POST method', function () {
      var call = api.post('foobar');
      expect(call).to.be.instanceOf(Call);
      expect(call.method).to.equal(HttpMethod.POST);
    });

    it('passes the "endpoint" URL to the call', function () {
      var call = api.post('foobar');
      expect(call.uri).to.equal('http://api.host.dlt/foo/bar');
    });
  }); // #post()



  describe('#delete()', function () {
    it('is accessible', function () {
      expect(api.delete).to.be.defined;
    });

    it('is a function', function () {
      expect(api.delete).to.be.a('function');
    });

    it('returns a Call instance with DELETE method', function () {
      var call = api.delete('foobar');
      expect(call).to.be.instanceOf(Call);
      expect(call.method).to.equal(HttpMethod.DELETE);
    });

    it('passes the "endpoint" URL to the call', function () {
      var call = api.delete('foobar');
      expect(call.uri).to.equal('http://api.host.dlt/foo/bar');
    });
  }); // #delete()



  describe('#head()', function () {
    it('is accessible', function () {
      expect(api.head).to.be.defined;
    });

    it('is a function', function () {
      expect(api.head).to.be.a('function');
    });

    it('returns a Call instance with HEAD method', function () {
      var call = api.head('foobar');
      expect(call).to.be.instanceOf(Call);
      expect(call.method).to.equal(HttpMethod.HEAD);
    });

    it('passes the "endpoint" URL to the call', function () {
      var call = api.head('foobar');
      expect(call.uri).to.equal('http://api.host.dlt/foo/bar');
    });
  }); // #head()



  describe('#put()', function () {
    it('is accessible', function () {
      expect(api.put).to.be.defined;
    });

    it('is a function', function () {
      expect(api.put).to.be.a('function');
    });

    it('returns a Call instance with PUT method', function () {
      var call = api.put('foobar');
      expect(call).to.be.instanceOf(Call);
      expect(call.method).to.equal(HttpMethod.PUT);
    });

    it('passes the "endpoint" URL to the call', function () {
      var call = api.put('foobar');
      expect(call.uri).to.equal('http://api.host.dlt/foo/bar');
    });
  }); // #put()


  describe('#create()', function () {
    it('is accessible', function () {
      expect(api.create).to.be.defined;
    });

    it('aliases #post()', function () {
      expect(api.create).to.equal(api.post);
    });
  });

  describe('#update()', function () {
    it('is accessible', function () {
      expect(api.update).to.be.defined;
    });

    it('aliases #put()', function () {
      expect(api.update).to.equal(api.put);
    });
  });





  describe('#buildUri()', function () {
    it('is accessible', function () {
      expect(api.buildUri).to.be.defined;
    });

    it('is a function', function () {
      expect(api.buildUri).to.be.a('function');
    });

    it('concatenates the given path to the API\'s base', function () {
      var expected = BASE_URI + '/foo/bar/baz';
      expect(api.buildUri('/foo/bar/baz')).to.equal(expected);
    });
  });



  describe('#endpoint()', function () {
    it('is accessible', function () {
      expect(api.endpoint).to.be.defined;
    });

    it('is a function', function () {
      expect(api.endpoint).to.be.a('function');
    });

    it('registers an endpoint in the API', function () {
      function callEndpoint() {
        api.get('foo');
      }

      expect(callEndpoint).to.throw;
      api.endpoint('foo', '/foo');
      expect(callEndpoint).not.to.throw;
    });

    it('allows chaining', function () {
      expect(api.endpoint('foo', '/foo')).to.equal(api);
    });
  });
});