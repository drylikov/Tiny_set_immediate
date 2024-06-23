/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-nested-ternary */
let nextHandle = 1;
const tasksByHandle = new Map<
  number,
  [callback: (...args: any[]) => void, args: any[]]
>();
let currentlyRunningATask = false;
let registerImmediate: (handle: number) => any;

let setImmediate = (callback: (...args: any[]) => void, ...args: any[]) => {
  tasksByHandle.set(nextHandle, [callback, args]);
  registerImmediate(nextHandle);
  return nextHandle++;
};

let clearImmediate = (handle: number | null) => {
  tasksByHandle.delete(handle!);
};

function runIfPresent(handle: number) {
  if (currentlyRunningATask) {
    setTimeout(runIfPresent, 0, handle);
  } else {
    const task = tasksByHandle.get(handle);
    if (task) {
      currentlyRunningATask = true;
      try {
        task[0](...task[1]);
      } finally {
        clearImmediate(handle);
        currentlyRunningATask = false;
      }
    }
  }
}

function installMessageChannelImplementation() {
  const channel = new MessageChannel();
  channel.port1.onmessage = (event) => {
    runIfPresent(event.data);
  };
  registerImmediate = (handle: number) => {
    channel.port2.postMessage(handle);
  };
}

function installPostMessageImplementation() {
  const messagePrefix = `setImmediate$${Math.random()}$`;

  window.addEventListener('message', (event) => {
    if (
      typeof event.data === 'string' &&
      event.data.startsWith(messagePrefix)
    ) {
      runIfPresent(+event.data.slice(messagePrefix.length));
    }
  });

  registerImmediate = (handle: number) => {
    window.postMessage(messagePrefix + handle, '*');
  };
}

const context =
  typeof self === 'undefined'
    ? typeof global === 'undefined'
      ? this
      : global
    : self;

// @ts-ignore
if (context!.setImmediate) {
  setImmediate = context!.setImmediate as any;
  clearImmediate = context!.clearImmediate as any;
  // @ts-ignore
} else if (!context.importScripts) {
  installPostMessageImplementation();
} else {
  installMessageChannelImplementation();
}

export { setImmediate, clearImmediate };
