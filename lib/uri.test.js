
describe('util/uri', function () {
  'use strict';

  var expect = require('chai').expect;

  var URI = require('./uri');

  it('is accessible', function () {
    expect(URI).to.be.defined;
  });

  it('is an object', function () {
    expect(URI).to.be.an('object');
  });

  describe('.toFunction()', function () {
    it('is accessible', function () {
      expect(URI.toFunction).to.be.defined;
    });

    it('is a function', function () {
      expect(URI.toFunction).to.be.a('function');
    });

    it('returns a function', function () {
      var uri = URI.toFunction('/foo/bar');
      expect(uri).to.be.a('function');
    });

    describe('returned function', function () {
      it('is a function', function () {
        expect(URI.toFunction('/foo')).to.be.a('function');
      });

      it('works with simple URIs (w/o placeholders', function () {
        var foo = URI.toFunction('/foo/bar');
        expect(foo()).to.equal('/foo/bar');
      });

      it('replaces URI placeholders with the function arguments',
        function () {
          var foo = URI.toFunction('/foo/{bar}');
          expect(foo('123')).to.equal('/foo/123');
        });

      it('appends the query (object)', function () {
        var foo = URI.toFunction('/foo/{bar}');
        var query = {baz : '321'};
        expect(foo(123, query)).to.equal('/foo/123?baz=321');
      });

      it('appends the query (string)', function () {
        var foo = URI.toFunction('/foo');
        var query = 'baz=456';
        expect(foo(query)).to.equal('/foo?baz=456');
      });
    });
  });


  describe('.querystring()', function () {
    it('is accessible', function () {
      expect(URI.querystring).to.be.defined;
    });

    it('is a function', function () {
      expect(URI.querystring).to.be.a('function');
    });

    it('transforms the given object into a querystring', function () {
      expect(URI.querystring({
        foo: 'bar',
        bar: 456
      })).to.equal('foo=bar&bar=456');
    });

    it('strips question mark from the beginning of the given string',
      function () {
        expect(URI.querystring('?bar=123')).to.equal('bar=123');
      });

    it('returns the given string if no normalization is needed',
      function () {
        expect(URI.querystring('bar=123')).to.equal('bar=123');
      });
  });


  describe('.normalizePath()', function () {
    it('is accessible', function () {
      expect(URI.normalizePath).to.be.defined;
    });

    it('is a function', function () {
      expect(URI.normalizePath).to.be.a('function');
    });

    it('returns a string', function () {
      expect(URI.normalizePath('/foo')).to.equal('/foo');
    });

    it('prepends a backslash to the path', function () {
      expect(URI.normalizePath('foo/bar')).to.equal('/foo/bar');
    });

    it('does not prepend a backslash if the path starts with a backslash',
      function () {
        expect(URI.normalizePath('/foo/bar')).to.equal('/foo/bar');
      });

    it('does not prepend if the path is relative to the current dir',
      function () {
        expect(URI.normalizePath('./foo/bar')).to.equal('./foo/bar');
      });

    it('does not prepend if the path is relative to the parent dir',
      function () {
        expect(URI.normalizePath('../foo/bar')).to.equal('../foo/bar');
      });
  });
});
