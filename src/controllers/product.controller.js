// Fake product data
const products = [
    {
        id: "1",
        name: "Product 1",
        price: 100,
        description: "This is a product description",
        quantity: 10,
    },
    {
        id: "2",
        name: "Product 2",
        price: 200,
        description: "This is a product description",
        quantity: 20,
    },
];

export function renderProductPage(req, res) {
    // Get product data from database here

    return res.render("product/index", {
        layout: "./layouts/main",
        page: "product",
        title: "Product page",
        products: products,
    });
}

export function renderProductDetailPage(req, res) {
    // get product id from request params

    const productId = req.params.id;

    const product = products.find((product) => product.id === productId);

    return res.render("product/detail", {
        layout: "./layouts/main",
        page: "product-detail",
        title: "Product detail",
        product: product,
    });
}
