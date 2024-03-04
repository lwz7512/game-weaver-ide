const myArray = [1, 2, 3, 4, 5, 6];

const sleep = (ms) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });

const waitFor = (duration, tester) =>
  sleep(duration).then(() => {
    const result = tester();
    return result;
  });

const forEachSeries = async (iterable, lazyExec) => {
  if (!iterable.length) return;
  // TODO: to get test case parameter ...
  const it = iterable.shift();
  // TODO: to create a validator function
  await lazyExec(undefined, it);
  await forEachSeries(iterable, lazyExec);
};

forEachSeries(myArray, waitFor)
  .then(() => {
    console.log('all done!');
    return true;
  })
  .catch((reason) => console.log('got error!'));
