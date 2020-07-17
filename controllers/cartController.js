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
      // let cartItem = await CartItem.findOrCreate({
      // where: { CartId: cart[0].id, ProductId: req.body.productId },
      // default: { CartId: cart[0].id, ProductId: req.body.productId }
      // })
      console.log('cart', cart)
      console.log('created', created)
      // console.log('cartItem', cartItem)
    } catch (err) {
      return res.json({ status: 'error', message: 'not working yo' })
    }
    // .then((cart) => {
    //   return CartItem.findOrCreate({
    //     where: {
    //       CartId: cart[0].id,
    //       ProductId: req.body.productId
    //     },
    //     default: {
    //       CartId: cart[0].id,
    //       ProductId: req.body.productId,
    //     },
    //   }).then((cartItem) => {
    //     return cartItem[0].update({
    //       quantity: (cartItem[0].quantity || 0) + 1,
    //     })
    //       .then((cartItem) => {
    //         req.session.cartId = cart[0].id
    //         return req.session.save(() => {
    //           return res.redirect('back')
    //         })
    //       })
    //   })
    // });
  },
  // postCart: (req, res) => {
  //   return Cart.findOrCreate({
  //     where: {
  //       id: req.session.cartId || 0,
  //     },
  //   }).then((cart) => {
  //     return CartItem.findOrCreate({
  //       where: {
  //         CartId: cart[0].id,
  //         ProductId: req.body.productId
  //       },
  //       default: {
  //         CartId: cart[0].id,
  //         ProductId: req.body.productId,
  //       },
  //     }).then((cartItem) => {
  //       return cartItem[0].update({
  //         quantity: (cartItem[0].quantity || 0) + 1,
  //       })
  //         .then((cartItem) => {
  //           req.session.cartId = cart[0].id
  //           return req.session.save(() => {
  //             return res.redirect('back')
  //           })
  //         })
  //     })
  //   });
  // },
}

module.exports = cartController