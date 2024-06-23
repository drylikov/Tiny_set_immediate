import { clearImmediate, setImmediate } from '../src/index';

describe('tests', () => {
  test('Handlers do execute', (done) => {
    setImmediate(() => {
      done();
    });
  });

  test('Handlers do not execute in the same event loop turn as the call to `setImmediate`', (done) => {
    let handlerCalled = false;
    function handler() {
      handlerCalled = true;
      done();
    }

    setImmediate(handler);
    expect(handlerCalled).toEqual(false);
  });

  test('`setImmediate` passes through an argument to the handler', (done) => {
    const expectedArg = { expected: true };

    setImmediate((actualArg: any) => {
      expect(actualArg).toStrictEqual(expectedArg);
      done();
    }, expectedArg);
  });

  test('`setImmediate` passes through two arguments to the handler', (done) => {
    const expectedArg1 = { arg1: true };
    const expectedArg2 = { arg2: true };

    setImmediate(
      (actualArg1, actualArg2) => {
        expect(actualArg1).toStrictEqual(expectedArg1);
        expect(actualArg2).toStrictEqual(expectedArg2);
        done();
      },
      expectedArg1,
      expectedArg2,
    );
  });

  test('`clearImmediate` within the same event loop turn prevents the handler from executing', (done) => {
    let handlerCalled = false;
    function handler() {
      handlerCalled = true;
    }

    const handle = setImmediate(handler);
    clearImmediate(handle);

    setTimeout(() => {
      expect(handlerCalled).toEqual(false);
      done();
    }, 100);
  });

  test('`clearImmediate` does not interfere with handlers other than the one with ID passed to it', (done) => {
    const expectedArgs = ['A', 'D'];
    const recordedArgs = [] as string[];

    function handler(arg: string) {
      recordedArgs.push(arg);
    }

    setImmediate(handler, 'A');
    clearImmediate(setImmediate(handler, 'B'));
    const handle = setImmediate(handler, 'C');
    setImmediate(handler, 'D');
    clearImmediate(handle);

    setTimeout(() => {
      expect(recordedArgs).toEqual(expectedArgs);
      done();
    }, 100);
  });
});
