function wait(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

export async function runSequentialDemo() {
  const start = performance.now();
  try {
    await wait(1000, 'A');
    await wait(1000, 'B');
    return performance.now() - start;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function runParallelDemo() {
  const start = performance.now();
  try {
    await Promise.all([
      wait(1000, 'A'),
      wait(1000, 'B')
    ]);
    return performance.now() - start;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
