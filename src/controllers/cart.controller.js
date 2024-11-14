import mongoose from "mongoose";

import GioHangModel from "../models/gioHang.model.js";
import SanPhamModel from "../models/sanPham.model.js";
import KichCoModel from "../models/kichCo.model.js";
import { formatVNCurrency } from "../utils/format.js";

const VIEW_OPTIONS = {
    CART_LIST: {
        layout: "./layouts/main",
        title: "Giỏ hàng của bạn",
    },
};

// export async function renderCartPage(req, res) {
//     const customer = req.session.customer;
//     const maKhachHang = customer?.maKhachHang;

//     if (!customer || !customer?.maKhachHang) {
//         // Get from cookie

//         let cartItems = req?.cookies?.cartItems ? JSON.parse(req.cookies.cartItems) : [];
//         console.log("cartItems: ", cartItems);
//     }

//     // const { maKhachHang } = customer;

//     // Get the customer's cart
//     const cart = await GioHangModel.findOne({
//         maKhachHang: new mongoose.Types.ObjectId(maKhachHang),
//     })
//         .populate("maKhachHang")
//         .populate("danhSachSanPham.maSanPham")
//         .populate("danhSachSanPham.maKichCoSanPham")
//         .lean();

//     if (!cart) {
//         return res.render("cart/index", {
//             ...VIEW_OPTIONS.CART_LIST,
//             cart: null,
//             formatVNCurrency: formatVNCurrency,
//         });
//     }

//     const productsWithStock = await Promise.all(
//         cart.danhSachSanPham.map(async (item) => {
//             const sanPham = await SanPhamModel.findOne({ maSanPham: item.maSanPham });

//             // Tìm kích cỡ sản phẩm phù hợp
//             const kichCo = sanPham.danhSachKichCo.find(
//                 (kc) => kc.maKichCo.toString() === item.maKichCoSanPham.maKichCo.toString()
//             );

//             // Thêm soLuongTon từ kích cỡ sản phẩm vào đối tượng giỏ hàng
//             return {
//                 ...item,
//                 soLuongTon: kichCo ? kichCo.soLuongKichCo : 0, // Nếu không tìm thấy thì trả về 0
//             };
//         })
//     );

//     cart.danhSachSanPham = productsWithStock;

//     return res.render("cart/index", {
//         ...VIEW_OPTIONS.CART_LIST,
//         cart: cart,
//         formatVNCurrency: formatVNCurrency,
//     });
// }
export async function renderCartPage(req, res) {
    const customer = req.session.customer;

    let cart = null;
    let productsWithStock = [];

    if (customer && customer.maKhachHang) {
        // Nếu người dùng đã đăng nhập, lấy giỏ hàng từ cơ sở dữ liệu
        const { maKhachHang } = customer;

        // Tìm giỏ hàng của người dùng từ cơ sở dữ liệu
        cart = await GioHangModel.findOne({
            maKhachHang: new mongoose.Types.ObjectId(maKhachHang),
        })
            .populate("maKhachHang")
            .populate("danhSachSanPham.maSanPham")
            .populate("danhSachSanPham.maKichCoSanPham")
            .lean();

        if (!cart) {
            return res.render("cart/index", {
                ...VIEW_OPTIONS.CART_LIST,
                cart: null,
                formatVNCurrency: formatVNCurrency,
            });
        }

        // Lấy thông tin chi tiết sản phẩm và số lượng tồn kho cho mỗi sản phẩm trong giỏ hàng
        productsWithStock = await Promise.all(
            cart.danhSachSanPham.map(async (item) => {
                const sanPham = await SanPhamModel.findOne({ maSanPham: item.maSanPham });

                // Kiểm tra xem maKichCoSanPham có tồn tại hay không
                const maKichCo = item.maKichCoSanPham ? item.maKichCoSanPham.maKichCo : null;

                if (!maKichCo) {
                    console.log("Missing maKichCo for item", item);
                    return { ...item, soLuongTon: 0 }; // Trả về 0 nếu không có maKichCo
                }

                // Tìm kích cỡ sản phẩm phù hợp
                const kichCo = sanPham.danhSachKichCo.find(
                    (kc) => kc.maKichCo.toString() === new mongoose.Types.ObjectId(maKichCo).toString()
                );

                return {
                    ...item,
                    soLuongTon: kichCo ? kichCo.soLuongKichCo : 0, // Nếu không tìm thấy thì trả về 0
                };
            })
        );
    } else {
        // Nếu người dùng chưa đăng nhập, lấy giỏ hàng từ cookie
        let cartItems = req?.cookies?.cartItems ? JSON.parse(req.cookies.cartItems) : [];

        if (cartItems.length > 0) {
            // Tạo giỏ hàng giả lập từ cookie
            cart = { danhSachSanPham: cartItems };

            // Chuyển đổi maSanPham trong cartItems từ chuỗi thành ObjectId
            cartItems = cartItems.map((item) => ({
                ...item,
                maSanPham: new mongoose.Types.ObjectId(item.maSanPham),
                maKichCoSanPham: new mongoose.Types.ObjectId(item.maKichCoSanPham),
            }));

            // Lấy thông tin chi tiết sản phẩm và số lượng tồn kho cho mỗi sản phẩm trong giỏ hàng
            productsWithStock = await Promise.all(
                cartItems.map(async (item) => {
                    const sanPham = await SanPhamModel.findOne({ maSanPham: item.maSanPham });

                    // Kiểm tra xem maKichCoSanPham có tồn tại hay không
                    const maKichCo = item.maKichCoSanPham;

                    if (!maKichCo) {
                        console.log("Missing maKichCo for item", item);
                        return { ...item, soLuongTon: 0 }; // Trả về 0 nếu không có maKichCo
                    }

                    // Chuyển maKichCoSanPham thành ObjectId khi tìm kiếm
                    const kichCo = sanPham.danhSachKichCo.find(
                        (kc) => kc.maKichCo.toString() === new mongoose.Types.ObjectId(maKichCo).toString()
                    );

                    return {
                        ...item,
                        maSanPham: sanPham,
                        soLuongTon: kichCo ? kichCo.soLuongKichCo : 0, // Nếu không tìm thấy thì trả về 0
                    };
                })
            );
        }
    }

    if (cart) {
        cart.danhSachSanPham = productsWithStock;
    }

    return res.render("cart/index", {
        ...VIEW_OPTIONS.CART_LIST,
        cart: cart,
        formatVNCurrency: formatVNCurrency,
    });
}

export async function getTotalCartItemsRequest(req, res) {
    try {
        const customer = req.session.customer;

        if (!customer || !customer.maKhachHang) {
            let cartItems = req?.cookies?.cartItems ? JSON.parse(req.cookies.cartItems) : [];

            return res.json({ totalItems: cartItems.length });
        }

        const { maKhachHang } = customer;

        const cart = await GioHangModel.findOne({ maKhachHang: new mongoose.Types.ObjectId(maKhachHang) });

        if (!cart) {
            return res.json({ totalItems: 0 });
        }

        return res.json({ totalItems: cart.danhSachSanPham.length });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function addToCartHandlerRequest(req, res) {
    try {
        const customer = req.session.customer;

        const userId = customer?.maKhachHang;
        const { productId, sizeId, quantity, selectedPrice } = req.body;

        if (!userId) {
            // Save to cookie
            let cartItems = req.cookies?.cartItems ? JSON.parse(req.cookies.cartItems) : [];

            // Check if the product with the specific size is already in the cart
            const existingProductIndex = cartItems.findIndex(
                (item) => item.maSanPham === productId && item.maKichCoSanPham === sizeId
            );

            if (existingProductIndex >= 0) {
                cartItems[existingProductIndex].soLuongSanPham += quantity;
                cartItems[existingProductIndex].giaSanPham = selectedPrice;
            } else {
                cartItems.push({
                    maSanPham: productId,
                    maKichCoSanPham: sizeId,
                    soLuongSanPham: quantity,
                    giaSanPham: selectedPrice,
                });
            }

            // Save to cookie and do not have expiration time
            res.cookie("cartItems", JSON.stringify(cartItems), { httpOnly: true });

            return res.status(200).json({ message: "Product added to cart successfully", cartItems });
        }

        // If user authenticated, save to database

        const product = await SanPhamModel.findOne({ maSanPham: new mongoose.Types.ObjectId(productId) });
        const size = await KichCoModel.findOne({ maKichCo: new mongoose.Types.ObjectId(sizeId) });

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        if (!size) {
            return res.status(404).json({ message: "Size not found." });
        }

        // Find the customer's cart
        let cart = await GioHangModel.findOne({ maKhachHang: userId });

        // If cart doesn't exist, create a new one
        if (!cart) {
            cart = new GioHangModel({
                maKhachHang: userId,
                danhSachSanPham: [],
                tongTien: 0,
            });
        }

        // Check if the product with the specific size is already in the cart
        const existingProductIndex = cart.danhSachSanPham.findIndex(
            (item) => item.maSanPham.equals(productId) && item.maKichCoSanPham.equals(sizeId)
        );

        if (existingProductIndex >= 0) {
            // Update the existing product's quantity and price
            cart.danhSachSanPham[existingProductIndex].soLuongSanPham += quantity;
            cart.danhSachSanPham[existingProductIndex].giaSanPham = selectedPrice;
        } else {
            // Add the new product to the cart
            cart.danhSachSanPham.push({
                maSanPham: productId,
                maKichCoSanPham: sizeId,
                soLuongSanPham: quantity,
                giaSanPham: selectedPrice, // Assuming you store the price on the product
            });
        }

        // Recalculate the total price of the cart
        cart.tongTien = cart.danhSachSanPham.reduce((total, item) => {
            return total + item.soLuongSanPham * item.giaSanPham;
        }, 0);

        // Save the updated cart
        await cart.save();

        // Update maGioHang
        await GioHangModel.updateOne(
            { _id: cart._id },
            {
                $set: {
                    maGioHang: cart._id,
                },
            }
        );

        return res.status(200).json({ message: "Product added to cart successfully", cart });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteCartItemHandlerRequest(req, res) {
    try {
        // const { maKhachHang: userId } = req.session.customer;

        // if (!userId) {
        //     return res.redirect("/auth/login");
        // }
        const customer = req.session?.customer;
        const userId = customer?.maKhachHang;

        const { productId } = req.params;

        if (!userId) {
            // Get from cookie
            let cartItems = req?.cookies?.cartItems ? JSON.parse(req.cookies.cartItems) : [];

            // Tìm sản phẩm trong giỏ hàng
            const productIndex = cartItems.findIndex((item) => item.maSanPham === productId);

            if (productIndex < 0) {
                return res.status(404).json({ message: "Product not found in cart." });
            }

            // Xóa sản phẩm khỏi giỏ hàng
            cartItems.splice(productIndex, 1);

            // Lưu lại giỏ hàng mới vào cookie
            res.cookie("cartItems", JSON.stringify(cartItems), { httpOnly: true });

            return res.status(200).json({ message: "Cart item deleted successfully", cartItems });
        }

        const cart = await GioHangModel.findOne({ maKhachHang: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        const productIndex = cart.danhSachSanPham.findIndex((item) => item.maSanPham.equals(productId));

        if (productIndex < 0) {
            return res.status(404).json({ message: "Product not found in cart." });
        }

        cart.danhSachSanPham.splice(productIndex, 1);

        // Recalculate the total price of the cart

        cart.tongTien = cart.danhSachSanPham.reduce((total, item) => {
            return total + item.soLuongSanPham * item.giaSanPham;
        }, 0);

        await cart.save();

        return res.status(200).json({ message: "Cart item deleted successfully", cart });
    } catch (error) {
        console.error("Error deleting cart item:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateCartItemQuantityHandlerRequest(req, res) {
    try {
        const customer = req.session.customer;
        const userId = customer?.maKhachHang;

        const { quantity, productId } = req.body;

        if (!userId) {
            // Get from cookies
            let cartItems = req.cookies.cartItems ? JSON.parse(req.cookies.cartItems) : [];

            const productIndex = cartItems.findIndex((item) => item.maSanPham === productId);

            if (productIndex < 0) {
                return res.status(404).json({ message: "Product not found in cart." });
            }

            cartItems[productIndex].soLuongSanPham = quantity;

            res.cookie("cartItems", JSON.stringify(cartItems), { httpOnly: true });

            return res.status(200).json({ message: "Cart item quantity updated successfully", cart: cartItems });
        }

        const cart = await GioHangModel.findOne({ maKhachHang: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        const productIndex = cart.danhSachSanPham.findIndex((item) => item.maSanPham.equals(productId));

        if (productIndex < 0) {
            return res.status(404).json({ message: "Product not found in cart." });
        }

        cart.danhSachSanPham[productIndex].soLuongSanPham = quantity;

        // Recalculate the total price of the cart
        cart.tongTien = cart.danhSachSanPham.reduce((total, item) => {
            return total + item.soLuongSanPham * item.giaSanPham;
        }, 0);

        await cart.save();

        return res.status(200).json({ message: "Cart item quantity updated successfully", cart });
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function setSelectedItemsHandlerRequest(req, res) {
    try {
        const { selectedProductIds } = req.body;

        const customer = req.session.customer;

        if (!customer || !customer.maKhachHang) {
            throw new Error("User is not authenticated.");
        }

        const { maKhachHang } = customer;

        const cart = await GioHangModel.findOne({
            maKhachHang: new mongoose.Types.ObjectId(maKhachHang),
        })
            .populate("maKhachHang")
            .populate("danhSachSanPham.maSanPham")
            .populate("danhSachSanPham.maKichCoSanPham");

        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        // Lọc ra các sản phẩm đã chọn từ selectedProductIds
        const selectedItems = cart.danhSachSanPham.filter((item) =>
            selectedProductIds.includes(item.maSanPham.maSanPham.toString())
        );

        req.session.selectedItems = selectedItems;
        req.session.save((err) => {
            if (err) {
                throw new Error("Không thể lưu session.");
            }
        });

        return res.status(200).json({ message: "Set selected items successfully", selectedItems });
    } catch (error) {
        console.error("Error going to checkout:", error);
        return res.status(500).json({ message: error.message });
    }
}

export async function syncCartItemsAfterLogin(req) {
    try {
        const customer = req.session.customer;
        const userId = customer?.maKhachHang;

        // Retrieve cartItems from cookies
        let cartItems = req.cookies.cartItems ? JSON.parse(req.cookies.cartItems) : [];

        let cart = await GioHangModel.findOne({ maKhachHang: userId });

        if (!cart) {
            // Create a new cart for the user if it doesn't exist
            cart = new GioHangModel({
                maKhachHang: userId,
                danhSachSanPham: [],
                tongTien: 0,
            });
        }

        cartItems.forEach((cartItem) => {
            const existingItemIndex = cart.danhSachSanPham.findIndex(
                (dbItem) =>
                    dbItem.maSanPham.toString() === cartItem.maSanPham &&
                    dbItem.maKichCoSanPham.toString() === cartItem.maKichCoSanPham
            );

            if (existingItemIndex > -1) {
                // Update quantity if the item already exists in the cart
                cart.danhSachSanPham[existingItemIndex].soLuongSanPham += cartItem.soLuongSanPham;
            } else {
                // Add the item if it doesn't exist in the cart
                cart.danhSachSanPham.push({
                    maSanPham: cartItem.maSanPham,
                    maKichCoSanPham: cartItem.maKichCoSanPham,
                    soLuongSanPham: cartItem.soLuongSanPham,
                    giaSanPham: cartItem.giaSanPham,
                });
            }
        });

        cart.tongTien = cart.danhSachSanPham.reduce((total, item) => {
            return total + item.soLuongSanPham * item.giaSanPham;
        }, 0);

        // Save the updated cart
        await cart.save();

        // Update maGioHang
        await GioHangModel.updateOne(
            { _id: cart._id },
            {
                $set: {
                    maGioHang: cart._id,
                },
            }
        );

        return true;
    } catch (error) {
        throw new Error("Error syncing cart items after login: " + error.message);
    }
}
