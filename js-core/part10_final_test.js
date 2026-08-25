
const fetchProducts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: "Laptop", price: 1000, category: "Electronics" },
        { id: 2, name: "Mouse", price: 50, category: "Electronics" },
        { id: 3, name: "Desk", price: 200, category: "Furniture" }
      ]);
    }, 500);
  });
};

const fetchExchangeRate = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(24000);
    }, 300);
  });
};

function createCategoryFilter(category) {
  return function (products) {
    return products.filter(product => product.category === category);
  };
}

async function main() {
  console.log("Đang lấy dữ liệu...");

  try {
    const [products, exchangeRate] = await Promise.all([
      fetchProducts(),
      fetchExchangeRate()
    ]);

    console.log("Dữ liệu gốc (USD):", products);

    const productsVND = products.map(product => ({
      ...product,
      priceVND: product.price * exchangeRate
    }));

    console.log("\nSản phẩm sau khi đổi giá (VND):", productsVND);

    const filterElectronics = createCategoryFilter("Electronics");
    const electronics = filterElectronics(productsVND);

    console.log("\nCác thiết bị điện tử:", electronics);

    const totalElectronicsCost = electronics.reduce((sum, item) => sum + item.priceVND, 0);
    console.log(`\nTổng tiền Electronics: ${totalElectronicsCost.toLocaleString()} VND`);

  } catch (error) {
    console.error("Có lỗi xảy ra:", error.message);
  }
}

main();
