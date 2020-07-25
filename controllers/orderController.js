const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const Product = db.Product



let orderController = {
  getOrders: async (req, res) => {
    try {
      let orders = await Order.findAll({ include: 'items' })
      orders = orders.map(d => ({ ...d.dataValues }))
      return res.render('orders', { orders })
    } catch {
      return res.json('error')
    }
  },
  postOrder: async (req, res) => {
    console.log('y')
  },
  cancelOrder: async (req, res) => {
    console.log('n')
  }
}

module.exports = orderController