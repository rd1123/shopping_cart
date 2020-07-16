const db = require('../models')
const Cart = db.Sequelize
const CartItem = db.CartItem
const PAGE_LIMIT = 10
const PAGE_OFFSET = 0

let cartController = {
  getCart: (req, res) => {
    return Cart.findByPk(req.session.cartId, { include: 'items' }).then(cart => {
      cart = cart || { items: [] }
      let totalPrice = cart.items.length > 0 ? cart.items.map(d => d.price * d.CartItem.quantity).reduce((a, b) => a + b) : 0
      return res.render('cart', { cart: cart, totalPrice })
    })
  },
  postCart: (req, res) => {
    return Cart.findOrCreate({
      where: {
        id: req.session.cartId
      },
    }).spread(function (cart, created) {
      console.log(cart)
      return CartItem.findOrCreate({
        where: {
          CardId: cart.id,
          ProductId: req.body.productId
        },
        default: {
          CartId: cart.id,
          ProductId: req.body.productId
        }
      }).then((cartItem) => {
        console.log(cartItem)
      })
    })
  }
}

module.exports = cartController