const url = "https://jsonplaceholder.typicode.com/users/1";

async function loadData() {
  try {
    console.log("Đang tải dữ liệu...");
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Dữ liệu tải thành công:", data);
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error.message);
  } finally {
    console.log("Hoàn thành thao tác loadData.");
  }
}

loadData();
