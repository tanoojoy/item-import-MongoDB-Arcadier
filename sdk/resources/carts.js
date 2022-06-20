'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Carts() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Carts, ArctickClient);

Carts.prototype.addCart = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const quantity = options.quantity;
    const discount = options.discount;
    const itemId = options.itemId;
    const force = options.force;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + userId + '/carts?force=' + force,
            data: {
                ID: null,
                Quantity: quantity,
                DiscountAmount: discount,
                ItemDetail: {
                    ID: itemId
                }
            }
        }, callback);
    });
};

Carts.prototype.editCart = function(options, callback) {
    const self = this;

    const itemID = options.itemID;
    const userID = options.userID;
    const cartID = options.cartID;
    const quantity = options.quantity || null;
    const discount = options.discount || null;
    const cartItemType = options.cartItemType || null;
    const shippingMethodId = options.shippingMethodId || null;
    const pickupAddressId = options.pickupAddressId || null;
    const forComparison = options.forComparison || false;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'PUT',
            path: '/api/v2/users/' + userID + '/carts/' + cartID + "?forComparison=" + forComparison,
            data: {
                Quantity: quantity,
                DiscountAmount: discount,
                CartItemType: cartItemType,
                ShippingMethod: {
                    ID: shippingMethodId
                },
                PickupAddress: {
                    ID: pickupAddressId
                },
                ItemDetail: {
                    ID: itemID
                }
            }
        }, callback);
    });
};

Carts.prototype.deleteCartItem = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'DELETE',
            path: `/api/v2/users/${options.userId}/carts/${options.cartId}`
        }, callback);
    });
}


Carts.prototype.getCarts = function(options, callback) {
    const self = this;
    const { userId, pageSize, pageNumber, includes } = options;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: `/api/v2/users/${userId}/carts`,
            params: {
                pageSize: options.pageSize,
                pageNumber: options.pageNumber,
                includes: options.includes
            }
        }, callback);
    });
}

Carts.prototype.addCartFeedback = function(options, callback) {
    const self = this;
    const { userId, cartId, ItemRating, Message } = options;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: `/api/v2/users/${userId}/carts/${cartId}/feedback`,
            data: {
                ItemRating,
                Message
            }
        }, callback);
    });
}

Carts.prototype.getCartFeedback = function(options, callback) {
    const self = this;
    const { userId, cartId } = options;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: `/api/v2/users/${userId}/carts/${cartId}/feedback`
        }, callback);
    });
}

module.exports = Carts;
