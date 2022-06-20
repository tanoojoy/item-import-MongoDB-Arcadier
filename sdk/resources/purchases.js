'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function Purchases() {
    ArctickClient.apply(this, arguments);
}

util.inherits(Purchases, ArctickClient);

Purchases.prototype.getHistory = function(options, callback) {
    const self = this;
    const userId = options.userId;
    const keyword = options.keyword;
    const pageSize = options.pageSize;
    const pageNumber = options.pageNumber;
    const orderStatus = options.status;
    const merchantIds = options.supplier;
    const startDate = options.startDate;
    const endDate = options.endDate;
    const paymentDues = options.paymentDues && options.paymentDues.length > 0 ? options.paymentDues : undefined;
    const paymentGateways = options.paymentGateways && options.paymentGateways.length > 0 ? options.paymentGateways : undefined;
    const status = options.invoiceStatus && options.invoiceStatus.length > 0 ? options.invoiceStatus : undefined;
    const pStatus = options.pStatus;
    //ARC8930
    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/transactions',
            params: {
                keywords: keyword,
                pageSize: pageSize,
                pageNumber: pageNumber,
                orderStatus: orderStatus,
                merchantIds: merchantIds,
                startDate: startDate,
                endDate: endDate,
                paymentDues: paymentDues,
                paymentGateways: paymentGateways,
                status: pStatus
            }
        }, callback);
    });
};

Purchases.prototype.getHistoryDetail = function(options, callback) {
    const self = this;

    const userId = options.userId;
    const invoiceNo = options.invoiceNo;
    const merchantId = options.merchantId;

    self._acquireAdminAccessToken(function() {
        self._makeRequest({
            method: 'GET',
            path: '/api/v2/users/' + userId + '/transactions/' + invoiceNo + '/' + merchantId
        }, callback);
    });
};

Purchases.prototype.getHistoryB2B = function (options, callback) {
    const self = this;
    const userId = options.userId;
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
            path: '/api/v2/users/' + userId + '/purchased-orders',
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

module.exports = Purchases;
