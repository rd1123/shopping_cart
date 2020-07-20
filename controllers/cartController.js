const db = require('../models')
const Cart = db.Cart
const CartItem = db.CartItem
const PAGE_LIMIT = 10
const PAGE_OFFSET = 0

let cartController = {
  getCart: async (req, res) => {
    try {
      let cart = await Cart.findByPk(req.session.cartId, {
        include: 'items'
      }) || { items: [] }

      const cartJson = (cart.items.length > 0) ? cart.toJSON() : cart
      let totalPrice = cart.items.length > 0 ? cart.items.map(d => d.price * d.CartItem.quantity).reduce((a, b) => a + b) : 0
      return res.render('cart', { cart: cartJson, totalPrice })
    } catch (err) {
      return res.json(err)
    }
  },
  postCart: async (req, res) => {
    try {
      let [cart, created] = await Cart.findOrCreate({ where: { id: req.session.cartId || 0 } })
      let [cartItem, itemcreated] = await CartItem.findOrCreate({
        where: { CartId: cart.id, ProductId: req.body.productId },
        default: { CartId: cart.id, ProductId: req.body.productId }
      })
      cartItem.update({
        quantity: (cartItem.quantity || 0) + 1
      }).then(cartitem => {
        req.session.cartId = cart.id
        return req.session.save(() => {
          return res.redirect('back')
        })
      })
    } catch (err) {
      return res.json({ status: 'error', message: 'not working yo' })
    }
  },
  addCartItem: async (req, res) => {
    let cartItem = await CartItem.findByPk(req.params.id)
    cartItem.update({
      quantity: Number(cartItem.quantity) + 1
    }).then(cartItem => {
      return res.redirect('back')
    })
  },
  subCartItem: async (req, res) => {
    let cartItem = await CartItem.findByPk(req.params.id)
    cartItem.update({
      quantity: Number(cartItem.quantity) - 1 >= 1 ? Number(cartItem.quantity) - 1 : 1
    }).then(cartItem => {
      return res.redirect('back')
    })
  },
  deleteCartItem: async (req, res) => {
    let cartItem = await CartItem.findByPk(req.params.id)
    cartItem.destroy().then(cartItem => {
      return res.redirect('back')
    })
  }
}

module.exports = cartController