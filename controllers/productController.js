const db = require('../models')
const Cart = db.Cart
const Product = db.Product
const PAGE_LIMIT = 3
const PAGE_OFFSET = 0;

let productController = {
  getProducts: async (req, res) => {
    const { count, rows } = await Product.findAndCountAll({ offset: PAGE_OFFSET, limit: PAGE_LIMIT, raw: true, nest: true })
    const cart = await Cart.findByPk(req.session.cartId, { include: 'items' }) || { items: [] }
    const cartJson = (cart.items.length > 0) ? cart.toJSON() : cart
    let totalPrice = (cartJson.items.length > 0) ? cartJson.items.map(d => d.price * d.CartItem.quantity).reduce((a, b) => a + b) : 0

    return res.render('products', {
      products: rows,
      totalPrice,
      cart: cartJson
    })
  }
}

module.exports = productController