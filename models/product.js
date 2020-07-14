'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {});
  Product.associate = function (models) {
    Product.belongsToMany(models.Cart, {
      as: 'carts',
      through: {
        model: models.CartItem,
        unique: false
      }
    })
    Product.belongsToMany(models.Order, {
      as: 'orders',
      through: {
        model: models.OrderItem,
        unique: false
      }
    })
  };
  return Product;
}; 