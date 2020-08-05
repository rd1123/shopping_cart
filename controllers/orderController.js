const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const Product = db.Product
const Cart = db.Cart

let orderController = {
  getOrders: async (req, res) => {
    try {
      let orders = await Order.findAll({ include: 'items' })
      orders = orders.map(d => (d.get({ plain: true })))
      return res.render('orders', { orders })
    } catch {
      return res.json('error')
    }
  },
  postOrder: async (req, res) => {
    try {
      let cart = await Cart.findByPk(req.body.cartId, { include: 'items' })
      Order.create({
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        shipping_status: req.body.shipping_status,
        payment_status: req.body.payment_status,
        amount: req.body.amount
      }).then(order => {
        let results = []
        for (let i = 0; i < cart.items.length; i++) {
          results.push(
            OrderItem.create({
              OrderId: order.id,
              ProductId: cart.items[i].id,
              price: cart.items[i].price,
              quantity: cart.items[i].CartItem.quantity
            })
          )
        }
        cart.destroy()

        return Promise.all(results).then(() => {
          res.redirect('/orders')
        })
      })
    } catch {
      return res.json('error')
    }
  },
  cancelOrder: async (req, res) => {
    try {
      let order = await Order.findByPk(req.params.id)
      order.update({
        ...req.body,
        shipping_status: '-1',
        payment_status: '-1'
      })
      return res.redirect('back')
    } catch {
      return res.json('error')
    }
  }
}

module.exports = orderController