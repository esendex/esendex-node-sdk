var assert = require('assert'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire').noCallThru();

describe('Accounts', function () {

  describe('constructor', function () {

    var esendex;
    var accounts;

    before(function () {
      esendex = {};
      var Accounts = proxyquire('../lib/accounts', { './xmlparser': sinon.stub().returns(sinon.spy()) });
      accounts = Accounts(esendex);
    });

    it('should create an instance of the accounts api', function () {
      assert.notEqual(accounts, null);
      assert.equal(typeof accounts, 'object');
    });

    it('should expose the esendex api', function () {
      assert.equal(accounts.esendex, esendex);
    });

  });

  describe('get all', function () {

    var responseXml;
    var requestStub;
    var options;
    var callbackSpy;
    var responseObject;
    var parserStub;

    before(function () {
      responseXml = 'not actually xml here';
      requestStub = sinon.stub().callsArgWith(5, null, responseXml);
      var esendexFake = {
        requesthandler: {
          request: requestStub
        }
      };
      options = { dog: 'cat' };
      callbackSpy = sinon.spy();
      responseObject = { accounts: { account: ['accounts'] } };
      parserStub = sinon.stub().callsArgWith(1, null, responseObject);

      var Accounts = proxyquire('../lib/accounts', {'./xmlparser': sinon.stub().returns(parserStub) });
      var accounts = Accounts(esendexFake);
      accounts.get(options, callbackSpy);
    });

    it('should call the accounts endpoint', function () {
      sinon.assert.calledWith(requestStub, 'GET', '/v1.0/accounts', options, null, 200, sinon.match.func);
    });

    it('should parse the xml response', function () {
      sinon.assert.calledWith(parserStub, responseXml, sinon.match.func);
    });

    it('should call the callback with the parsed accounts response', function () {
      sinon.assert.calledWith(callbackSpy, null, responseObject.accounts);
    });

  });

  describe('get all with one account returned', function () {

    var callbackSpy;

    before(function () {
      var esendexFake = {
        requesthandler: {
          request: sinon.stub().callsArgWith(5, null, 'not actually xml here')
        }
      };
      callbackSpy = sinon.spy();
      var responseObject = { accounts: { account: 'not an array' } };
      var parserStub = sinon.stub().callsArgWith(1, null, responseObject);

      var Accounts = proxyquire('../lib/accounts', {'./xmlparser': sinon.stub().returns(parserStub) });
      var accounts = Accounts(esendexFake);
      accounts.get({}, callbackSpy);
    });

    it('should return an array of a single account', function () {
      sinon.assert.calledWith(callbackSpy, null, { account: sinon.match.array.and(sinon.match.has("length", 1)) });
    });

  });

  describe('get specific account', function () {

    var responseXml;
    var requestStub;
    var expectedPath;
    var callbackSpy;
    var responseObject;
    var parserStub;

    before(function () {
      responseXml = 'not actually xml here';
      requestStub = sinon.stub().callsArgWith(5, null, responseXml);
      var esendexFake = {
        requesthandler: {
          request: requestStub
        }
      };
      var options = { id: '1fecafcf-0c33-481c-bec8-7ca272ba71c3', crab: 'lobster' };
      expectedPath = '/v1.0/accounts/' + options.id;
      callbackSpy = sinon.spy();
      responseObject = { accounts: 'accounts' };
      parserStub = sinon.stub().callsArgWith(1, null, responseObject);

      var Accounts = proxyquire('../lib/accounts', { './xmlparser': sinon.stub().returns(parserStub) });
      var accounts = Accounts(esendexFake);
      accounts.get(options, callbackSpy);
    });

    it('should call the accounts endpoint with the specific message id', function () {
      sinon.assert.calledWith(requestStub, 'GET', expectedPath, sinon.match({ id: undefined }), null, 200, sinon.match.func);
    });

    it('should parse the xml response', function () {
      sinon.assert.calledWith(parserStub, responseXml, sinon.match.func);
    });

    it('should call the callback with the parsed account response', function () {
      sinon.assert.calledWith(callbackSpy, null, responseObject.account);
    });

  });

  describe('get when request error', function () {

    var requestError;
    var callbackSpy;

    before(function () {
      requestError = new Error('some request error');
      var esendexFake = {
        requesthandler: {
          request: sinon.stub().callsArgWith(5, requestError)
        }
      };
      callbackSpy = sinon.spy();

      var Accounts = proxyquire('../lib/accounts', {'./xmlparser': sinon.stub() });
      var accounts = Accounts(esendexFake);
      accounts.get(null, callbackSpy);
    });

    it('should call the callback with the error', function () {
      sinon.assert.calledWith(callbackSpy, requestError);
    });

  });

  describe('get when parser error', function () {

    var parserError;
    var callbackSpy;

    before(function () {
      parserError = new Error('some parser error');
      var esendexFake = {
        requesthandler: {
          request: sinon.stub().callsArgWith(5, null, 'some response data')
        }
      };
      callbackSpy = sinon.spy();

      var parserStub = sinon.stub().callsArgWith(1, parserError);

      var Accounts = proxyquire('../lib/accounts', {'./xmlparser': sinon.stub().returns(parserStub) });
      var accounts = Accounts(esendexFake);
      accounts.get(null, callbackSpy);
    });

    it('should call the callback with the error', function () {
      sinon.assert.calledWith(callbackSpy, parserError);
    });

  });

});