const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function playEventLoopDemo(update) {
  update('1');
  await sleep(250);
  update('1 → 4');
  await sleep(300);
  update('1 → 4 → 3');
  await sleep(350);
  update('1 → 4 → 3 → 2');
}
