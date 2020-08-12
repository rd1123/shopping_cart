const db = require('../models');

const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;
const Cart = db.Cart;
const encryptService = require('../service/encrypt');

let orderController = {
  getOrders: async (req, res) => {
    try {
      let orders = await Order.findAll({ include: 'items' });
      orders = orders.map(d => (d.get({ plain: true })));
      return res.render('orders', { orders });
    } catch {
      return res.json('error');
    }
  },
  postOrder: async (req, res) => {
    try {
      let cart = await Cart.findByPk(req.body.cartId, { include: 'items' });
      Order.create({
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        shipping_status: req.body.shipping_status,
        payment_status: req.body.payment_status,
        amount: req.body.amount
      }).then(order => {
        let results = [];
        for (let i = 0; i < cart.items.length; i++) {
          results.push(
            OrderItem.create({
              OrderId: order.id,
              ProductId: cart.items[i].id,
              price: cart.items[i].price,
              quantity: cart.items[i].CartItem.quantity
            })
          );
        };
        cart.destroy();

        return Promise.all(results).then(() => {
          res.redirect('/orders');
        });
      });
    } catch {
      return res.json('error');
    }
  },
  cancelOrder: async (req, res) => {
    try {
      let order = await Order.findByPk(req.params.id);
      order.destroy();

      return res.redirect('back');
    } catch {
      return res.json('error');
    }
  },
  getPayment: async (req, res) => {
    try {
      let order = await Order.findByPk(req.params.id);
      const tradeInfo = await encryptService.getTradeInfo(order.amount, '產品名稱', 'rdding1123@gmail.com');

      order.update({
        ...req.body,
        sn: tradeInfo.MerchantOrderNo
      });
      return res.render('payment', { order: order.get({ plain: true }), tradeInfo });
    } catch {
      return res.json({ 'error': '' });
    }

  },
  newebpayCallback: async (req, res) => {
    console.log('===== newebpayCallback =====');
    console.log(req.method);
    console.log(req.query);
    console.log(req.body);
    console.log('==========');

    const data = JSON.parse(encryptService.create_mpg_aes_decrypt(req.body.TradeInfo));
    console.log('===== newebpayCallback: create_mpg_aes_decrypt、data =====');
    console.log(data);

    let orders = await Order.findAll({ where: { sn: data['Result']['MerchantOrderNo'] } });

    orders[0].update({
      ...req.body,
      payment_status: 1
    });

    return res.redirect('/orders');
  }
}

module.exports = orderController;