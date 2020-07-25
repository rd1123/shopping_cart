const db = require('../models')
const Order = db.Order
const orderItem = db.OrderItem



let orderController = {
  getOrders: async (req, res) => {
    let orders = await Order.findAll({ include: 'items' })
    orders = orders.map(d => ({ ...d.dataValues }))

    return res.render('orders', { orders })
  }
}

module.exports = orderController