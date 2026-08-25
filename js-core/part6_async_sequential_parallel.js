
const getUser = () => new Promise(resolve => setTimeout(() => resolve({ id: 1, name: "An" }), 1000));
const getPosts = () => new Promise(resolve => setTimeout(() => resolve(["Post 1", "Post 2"]), 1500));

async function runSequential() {
  console.log("--- Bắt đầu chạy tuần tự ---");
  const start = Date.now();

  const user = await getUser();
  const posts = await getPosts();

  const end = Date.now();
  console.log("Kết quả tuần tự:", { user, posts });
  console.log(`Thời gian chạy tuần tự: ${end - start}ms`);
}

async function runParallel() {
  console.log("--- Bắt đầu chạy song song ---");
  const start = Date.now();

  const [user, posts] = await Promise.all([
    getUser(),
    getPosts(),
  ]);

  const end = Date.now();
  console.log("Kết quả song song:", { user, posts });
  console.log(`Thời gian chạy song song: ${end - start}ms`);
}

async function runAll() {
  await runSequential();
  console.log("\n");
  await runParallel();
}

runAll();
