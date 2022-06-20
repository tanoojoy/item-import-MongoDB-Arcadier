'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Orders() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Orders, ArctickClient);

Orders.prototype.getHistory = function (options, callback) {
    const self = this;
    const merchantId = options.userId;
    const keyword = options.keyword;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const status = options.status; // this is for invoice statuses
    const orderStatus = options.orderStatus;
    const merchantIds = options.supplier;
    const startDate = options.startDate;
    const endDate = options.endDate;
    const paymentDues = options.paymentDues && options.paymentDues.length > 0 ? options.paymentDues : undefined;
    const paymentGateways = options.paymentGateways && options.paymentGateways.length > 0 ? options.paymentGateways : undefined;
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/merchants/' + merchantId + '/transactions',
            params: {
                keywords: keyword,
                pageSize: pageSize,
                pageNumber: pageNumber,
                status: status,
                orderStatus: orderStatus,
                merchantIds: merchantIds,
                startDate: startDate,
                endDate: endDate,
                paymentDues: paymentDues,
                paymentGateways: paymentGateways
            }
        }, callback);
    });
};

Orders.prototype.getHistoryB2B = function (options, callback) {
    const self = this;
    const merchantId = options.userId;
    const keywords = options.keyword;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const requisitionStartDate = options.startDate;
    const requisitionEndDate = options.endDate;
    const userIds = options.supplier;
    const orderStatuses = options.status;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/merchants/' + merchantId + '/purchased-orders',
            data: {
                Keywords: keywords,
                PageSize: pageSize,
                PageNumber: pageNumber,
                Sort: "asc",
                RequisitionStartDate: new Date(requisitionStartDate * 1000),
                RequisitionEndDate: new Date(requisitionEndDate * 1000),
                OrderStatuses: orderStatuses,
                UserIds: userIds
            }
        }, callback);
    });
};

Orders.prototype.getHistoryB2BDetail = function (options, callback) {
    const self = this;
    const userId = options.userId;
    const keywords = options.keywords;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/merchants/' + userId + '/purchased-orders',
            params: {
                Keywords: keywords,
                pageSize: pageSize,
                pageNumber: pageNumber
            }
        }, callback);
    });
};

Orders.prototype.postHistoryFiltersB2B = function (options, callback) {
    const self = this;
    const merchantId = options.userId;
    const keyword = options.keyword;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const orderStatus = options.status;
    const merchantIds = options.supplier;
    const buyerIds = options.buyers;
    const startDate = options.startDate;
    const endDate = options.endDate;
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/merchants/' + merchantId + '/purchased-orders',
            params: {
                Keywords: keyword,
                pageSize: pageSize,
                pageNumber: pageNumber
            }
        }, callback);
    });
};

Orders.prototype.getHistoryDetail = function(options, callback) {
    const self = this;

    const merchantId = options.userId;
    const invoiceNo = options.invoiceNo;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/merchants/' + merchantId + '/transactions/' + invoiceNo
        }, callback);
    });
};

Orders.prototype.updateHistoryOrderStatus = function(options, callback) {
    const self = this;

    const merchantId = options.userId;
    const invoices = options.invoices;
    const status = options.status;
    const decrementStock = options.decrementStock ? options.decrementStock: null

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/merchants/' + merchantId + '/transactions/',
            data: {
                Invoices: invoices,
                Status: status,
                decrementStock: decrementStock
            }
        }, callback);
    });
};

Orders.prototype.updateOrderStatus = function(options, callback) {
    const self = this;

    const merchantId = options.userId;
    const invoiceNo = options.invoiceNo;
    const status = options.status;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/merchants/' + merchantId + '/transactions/' + invoiceNo,
            params: {
                status: status
            }
        }, callback);
    });
};

Orders.prototype.updateOrderStatusb2b = function (options, callback) {
    const self = this;
    const orderId = options.orderId;
    const status = options.status;
    //false for now
    self._acquireAdminAccessToken(function (err, admin) {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/admins/' + admin.UserId + '/orders/?autoUpdatePayment=' + false,
            data: 
                [
                    {
                        OrderStatus: status,
                        ID: orderId
                    }
                ]
        }, callback);
    });
};

Orders.prototype.getInvoiceNumberDetails = function(options, callback) {
    const self = this;
    const invoiceNo = options.invoiceNo;
    let includes = 'Transaction.Orders.CartItemDetails.ItemDetail.Media';

    if (options.includes) {
        includes = includes + ',' + options.includes;
    }

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/admins/' + data.UserId + '/transactions/' + invoiceNo,
                params: {
                    includes: includes
                }
            }, callback);
        }
    });
};

Orders.prototype.updateOrderDetailsOnePage = function (options, callback) {
    const self = this;

    const autoUpdatePayment = options.autoUpdatePayment || false;
    const isBankPayment = options.isBankPayment || false;
    const params = options.orders.map(order => {
        return {
            ID: order.orderID,
            Balance: typeof order.balance === 'undefined' ? null : order.balance,
            Freight: order.freight || null,
            DeliveryToAddress: {
                ID: order.addressID || null
            },
            BillingToAddress: {
                ID: order.billingAddressID || null
            },
            FulfilmentStatus: order.fulfilmentStatus,
            PaymentStatus: order.paymentStatus,
            OrderStatus: order.orderStatus
        }
    });

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/admins/' + data.UserId + '/orders/?autoUpdatePayment=' + autoUpdatePayment + "&isBankPayment=" + isBankPayment,
                data: params
            }, callback);
        }
    });
};

Orders.prototype.updateOrderDetails = function (options, callback) {
    const self = this;

    const autoUpdatePayment = options.autoUpdatePayment || false;
    const params = options.orders.map(order => {
        return {
            ID: order.orderId,
            Balance: typeof order.balance === 'undefined' ? null : order.balance,
            Freight: order.freight || null,
            DeliveryToAddress: {
                ID: order.deliveryToAddressId || null
            },
            BillingToAddress: {
                ID: order.billingAddressID || null
            },
            FulfilmentStatus: order.fulfilmentStatus,
            PaymentStatus: order.paymentStatus,
            RequisitionDetail: {
                ID: order.requisitionId || null
            },
            PaymentTerm: { ID: order.paymentTermId || null },
            Surcharge: order.surcharge || null,
            DiscountAmount: order.discountAmount || null,
            Total: order.total || null
        }
    });

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/admins/' + data.UserId + '/orders/?autoUpdatePayment=' + autoUpdatePayment,
                data: params
            }, callback);
        }
    });
};

Orders.prototype.revertPayment = function(options, callback) {
    const self = this;

    const orderId = options.orderId;
    const balance = options.balance;
    const fulfilmentStatus = options.fulfilmentStatus;
    const paymentStatus = options.paymentStatus;

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/admins/' + data.UserId + '/orders/',
                data: [{
                    ID: orderId,
                    Balance: balance,
                    FulfilmentStatus: fulfilmentStatus,
                    PaymentStatus: paymentStatus
                }]
            }, callback);
        }
    });
};

Orders.prototype.updateMerchantOrder = function(options, callback) {
    const self = this;

    const merchantId = options.userId;
    const orderId = options.orderId;
    const balance = options.balance;
    const fulfilmentStatus = options.fulfilmentStatus;
    const paymentStatus = options.paymentStatus;
    const customFields = options.customFields;

    self._acquireAdminAccessToken(function(err, data) {
        if (!err) {
            self._makeRequest({
                method: 'POST',
                path: '/api/v2/merchants/' + merchantId + '/orders/' + orderId,
                data: {
                    Balance: balance,
                    FulfilmentStatus: fulfilmentStatus,
                    PaymentStatus: paymentStatus,
                    CustomFields: customFields
                }
            }, callback);
        }
    });
};

Orders.prototype.getOrderDetails = function (options, callback) {
    const self = this;

    const userId = options.userId;
    const orderId = options.orderId

    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/users/' + userId + '/orders/' + orderId,
                params: {}
            }, callback);
        }
    });
};

Orders.prototype.getStatuses = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/static/order-statuses',
                params: {}
            }, callback);
        }
    });
};

Orders.prototype.getFulfilmentStatuses = function (options, callback) {
    const self = this;
    self._acquireAdminAccessToken(function (err, data) {
        if (!err) {
            self._makeRequest({
                method: 'GET',
                path: '/api/v2/static/fulfilment-statuses',
                params: {}
            }, callback);
        }
    });
};

Orders.prototype.generateOrderFromCartItems = function (options, callback) {
    const self = this;
    let cartIds = options.cartItemIds;
    if (Array.isArray(cartIds) !== true) {
        cartIds = [options.cartItemIds];
    }
    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/users/' + options.userId + '/orders/carts',
            data: cartIds
        }, callback);
    });
};

Orders.prototype.getConsumersFromOrdersB2B = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/merchants/' + options.merchantId + '/orders/consumers',
            params: {}
        }, callback);
    });
}

Orders.prototype.getMerchantsFromOrdersB2B = function (options, callback) {
    const self = this;

    self._acquireAdminAccessToken(function () {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + options.userId + '/orders/merchants',
            params: {}
        }, callback);
    });
}

module.exports = Orders;