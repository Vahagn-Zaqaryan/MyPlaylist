'use strict';

const config = {
    port: 8080,
    koaSecret: '123',
    database: {
        name: '',
        username: '',
        password: '',
        host: "localhost",
        port: 3307,
        dialect: 'mysql'
    },
    payment: {
        url: '',
        address: ''
    },
    google: {
        clientID: '',
        clientSecret: '',
        callbackURL: 'http://play.am:8080/auth/google/callback',
        accessType: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/youtube'],
        approvalPrompt: 'force'
    }
};

module.exports = config;
