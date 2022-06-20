'use strict';

var ArctickClient = require('../apiClient');
var util = require('util');

function SSO() {
    ArctickClient.apply(this, arguments);
}

util.inherits(SSO, ArctickClient);

SSO.prototype.login = function(externalUserId, email, callback){
    const self = this;
    self._acquireAdminAccessToken(function(){  //authrnticate this API call with admin token
        self._makeRequest({
            method: 'POST',
            path: '/api/v2/sso',
            data:{
                ExternalUserId: externalUserId,
                Email: email
            }
        }, callback);
    });
}

module.exports = SSO;