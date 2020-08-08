const db = require('../models')
const crypto = require('crypto')
const Order = db.Order
const OrderItem = db.OrderItem
const Product = db.Product
const Cart = db.Cart

const URL = 'https://77a3e9e97f10.ngrok.io'
const MerchantID = 'MS313593478'
const HashKey = 'nEOoEbDGjGovRn1m4DgxtDCM0zpPXeH7'
const HashIV = 'CP9oYrpu3jaEfx8P'
const PayGateWay = "https://ccore.spgateway.com/MPG/mpg_gateway"
const ReturnURL = URL + "/spgateway/callback?from=ReturnURL"
const NotifyURL = URL + "/spgateway/callback?from=NotifyURL"
const ClientBackURL = URL + "/orders"

function genDataChain(TradeInfo) {
  let results = []
  for (let kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`)
  }
  return results.join('&')
}

function create_mpg_aes_encrypt(TradeInfo) {
  let encrypt = crypto.createCipheriv('aes256', HashKey, HashIV)
  let enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex')
  return enc + encrypt.final('hex')
}

function create_mpg_sha_encrypt(TradeInfo) {
  let sha = crypto.createHash('sha256')
  let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`
  return sha.update(plainText).digest('hex').toUpperCase()
}

function getTradeInfo(Amt, Desc, email) {

  data = {
    'MerchantID': MerchantID, // 商店代號
    'RespondType': 'JSON', // 回傳格式
    'TimeStamp': Date.now(), // 時間戳記
    'Version': 1.5, // 串接程式版本
    'MerchantOrderNo': Date.now(), // 商店訂單編號
    'LoginType': 0, // 智付通會員
    'OrderComment': 'OrderComment', // 商店備註
    'Amt': Amt, // 訂單金額
    'ItemDesc': Desc, // 產品名稱
    'Email': email, // 付款人電子信箱
    'ReturnURL': ReturnURL, // 支付完成返回商店網址
    'NotifyURL': NotifyURL, // 支付通知網址/每期授權結果通知
    'ClientBackURL': ClientBackURL, // 支付取消返回商店網址
  }

  mpg_aes_encrypt = create_mpg_aes_encrypt(data)
  mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

  tradeInfo = {
    'MerchantID': MerchantID, // 商店代號
    'TradeInfo': mpg_aes_encrypt, // 加密後參數
    'TradeSha': mpg_sha_encrypt,
    'Version': 1.5, // 串接程式版本
    'PayGateWay': PayGateWay,
    'MerchantOrderNo': data.MerchantOrderNo,
  }

  return tradeInfo
}

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
  },
  getPayment: async (req, res) => {

    const order = (await Order.findByPk(req.params.id)).get({ plain: true })
    const tradeInfo = getTradeInfo(order.amount, '產品名稱', 'rdding1123@gmail.com')
    return res.render('payment', { order, tradeInfo })
  },
  newebpayCallback: async (req, res) => {
    console.log('===== newebpayCallback =====')
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    console.log('==========')
    return res.redirect('/orders')
  }
}

module.exports = orderController