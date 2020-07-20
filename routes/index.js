var express = require('express');
var router = express.Router();

const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/products', productController.getProducts)
router.get('/cart', cartController.getCart)
router.post('/cartItem/:id/add', cartController.addCartItem)
router.post('/cartItem/:id/sub', cartController.subCartItem)
router.delete('/cartItem/:id', cartController.deleteCartItem)
router.post('/cart', cartController.postCart)

module.exports = router;
