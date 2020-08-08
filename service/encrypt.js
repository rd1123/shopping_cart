const URL = 'https://77a3e9e97f10.ngrok.io'
const MerchantID = 'MS313593478'
const HashKey = 'nEOoEbDGjGovRn1m4DgxtDCM0zpPXeH7'
const HashIV = 'CP9oYrpu3jaEfx8P'
const PayGateWay = "https://ccore.newebpay.com/MPG/mpg_gateway"
const ReturnURL = URL + "/newebpay/callback?from=ReturnURL"
const NotifyURL = URL + "/newebpay/callback?from=NotifyURL"
const ClientBackURL = URL + "/orders"

let encryptService = {
  genDataChain: (TradeInfo) => {
    let results = []
    for (let kv of Object.entries(TradeInfo)) {
      results.push(`${kv[0]}=${kv[1]}`)
    }
    return results.join('&')
  },
  create_mpg_aes_encrypt: (TradeInfo) => {
    let encrypt = crypto.createCipheriv('aes256', HashKey, HashIV)
    let enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex')
    return enc + encrypt.final('hex')
  },
  create_mpg_sha_encrypt: (TradeInfo) => {
    let sha = crypto.createHash('sha256')
    let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`
    return sha.update(plainText).digest('hex').toUpperCase()
  }
getTradeInfo: (Amt, Desc, email) => {

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
}
module.exports = encryptService