'use strict';

const config = {
    port: 8080,
    koaSecret: '123',
    database: {
        name: 'dry',
        username: 'root',
        password: 'usbw',
        host: "localhost",
        port: 3307,
        dialect: 'mysql'
    },
    payment: {
        url: 'https://ilp.tumo.org/ledger/accounts/',
        address: '@ilp.tumo.org'
    },
    google: {
        clientID: '728411791817-djh38vuj0v2i9cofacrskdp39rc5tgh7.apps.googleusercontent.com',
        clientSecret: 'DODTR958FXDRMdqRAmToXVsi',
        callbackURL: 'http://play.am:8080/auth/google/callback',
        accessType: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/youtube'],
        approvalPrompt: 'force'
    }
};

module.exports = config;
