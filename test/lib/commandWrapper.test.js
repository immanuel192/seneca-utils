'use strict';
const commandWrapper = require('../../lib/commandWrapper');
const sinon = require('sinon');
const assert = require('assert');

const testLogger = {
    info: sinon.spy(),
    error: sinon.spy()
};
const commandFunc = function (inp, done) {
    if (inp.returnError) {
        return done('returnError as requested');
    }

    if (inp.returnException) {
        return done(new Error('returnException as requested'));
    }

    if (inp.resolvePromise) {
        return Promise.resolve('123');
    }

    if (inp.rejectPromise) {
        return Promise.reject('123');
    }

    if (inp.resolveValue) {
        return '123';
    }

    if (inp.throwException) {
        throw new Error('fake error');
    }

    return done(null, {});
};
let testCommand;

describe('Seneca - commandWrapper', () => {
    before(() => {
        commandWrapper.setDependencies(testLogger);
        testCommand = commandWrapper('test-command', commandFunc);
    });

    it('should run the command sucessfully', (done) => {
        testCommand({}, (err, data) => {
            assert.equal(data.success, true);
            done();
        });
    });

    it('should log error when received callback error', (done) => {
        testLogger.error.reset();
        testCommand({
            returnError: true
        }, () => {
            assert.equal(testLogger.error.called, true);
            done();
        });
    });

    it('should log info when function execution', (done) => {
        testLogger.info.reset();
        testCommand({
        }, () => {
            assert.equal(testLogger.info.called, true);
            done();
        });
    });

    it('should return success = false when the command function return error', (done) => {
        testCommand({
            returnError: true
        }, (err, data) => {
            assert.equal(data.success, false);
            assert.equal(data.data, 'returnError as requested');
            done();
        });
    });

    it('should return success = false and exception message when command return instance of Error', (done) => {
        testCommand({
            returnException: true
        }, (err, data) => {
            assert.equal(data.success, false);
            assert.equal(data.data, 'returnException as requested');
            done();
        });
    });

    it('should resolve if function return a value directly', (done) => {
        const expectResult = '123';
        testCommand({
            resolveValue: true
        }, (err, data) => {
            assert.equal(data.success, true);
            assert.equal(data.data, expectResult);
            done();

            return 123;
        });
    });

    it('should resolve if function return a promise', (done) => {
        const expectResult = '123';
        testCommand({
            resolvePromise: true
        }, (err, data) => {
            assert.equal(data.success, true);
            assert.equal(data.data, expectResult);
            done();
        });
    });

    it('should reject if function return a rejected promise', (done) => {
        const expectResult = '123';
        testCommand({
            rejectPromise: true
        }, (err, data) => {
            assert.equal(data.success, false);
            assert.equal(data.data, expectResult);
            done();
        });
    });

    it('should auto catch error in case of exception', (done) => {
        const expectResult = 'fake error';
        testCommand({
            throwException: true
        }, (err, data) => {
            assert.equal(data.success, false);
            assert.equal(data.data, expectResult);
            done();
        });
    });
});