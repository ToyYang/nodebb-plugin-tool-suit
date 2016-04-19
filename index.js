'use strict';

var winston = module.parent.require('winston'),
    meta = module.parent.require('./meta'),

    nodemailer = require('nodemailer'),
    API = {};


var settings = {};

API.init = function(data, callback) {
    function renderAdminPage(req, res) {
        res.render('admin/toolSuit/local', {});
    }

    data.router.get('/admin/toolSuit/local', data.middleware.admin.buildHeader, renderAdminPage);
    data.router.get('/api/admin/toolSuit/local', renderAdminPage);

    API.reloadSettings();

    callback();
};

API.send = function(data, callback) {

    var username = settings['emailer:local:username'];
    var pass = settings['emailer:local:password'];

    var transportOptions = {
		pool:true,
        host: settings['emailer:local:host'],
        port: settings['emailer:local:port'],
        secure: settings['emailer:local:secure'] === 'on'
    };
    if( username || pass ) {
        transportOptions.auth = {
            user: username,
            pass: pass
        };
    }
    var transport = nodemailer.createTransport(transportOptions);

    transport.sendMail({
        from: {
            name: data.from_name,
            address: data.from
        },
        to: data.to,
        html: data.html,
        text: data.plaintext,
        subject: data.subject
    },function(err) {
        if ( !err ) {
            winston.verbose('[emailer.smtp] Sent `' + data.template + '` email to uid ' + data.uid);
        } else {
            winston.warn('[emailer.smtp] Unable to send `' + data.template + '` email to uid ' + data.uid + '!!');
          }
        callback(err, data);
    });
};

API.admin = {
    menu: function(custom_header, callback) {
        custom_header.plugins.push({
            "route": '/toolSuit/local',
            "icon": 'fa-envelope-o',
            "name": 'ToolSuit'
        });

        callback(null, custom_header);
    }
};

API.reloadSettings = function(hash) {
    if (!hash || hash === 'settings:writeapi') {
        meta.settings.get('k68_tool_suit', function(err, sts) {
            if (err) {
                return winston.error(err);
            }
            settings = sts;
        });
    }
};

module.exports = API;
