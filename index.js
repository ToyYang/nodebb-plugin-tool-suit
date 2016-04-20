'use strict';

var winston = module.parent.require('winston'),
    meta = module.parent.require('./meta'),
    db   = module.parent.require('./database'),
    user = module.parent.require('./user'),

    nodemailer = require('nodemailer'),
    API = {};

var DEFAULT_PUB = 'ToolSuit:Default:ListPub';
var DEFAULT_SUB = 'ToolSuit:Default:ListSub';

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
    if (!hash || hash.plugin === 'k68_tool_suit') {
        meta.settings.get('k68_tool_suit', function(err, sts) {
            if (err) {
                return winston.error(err);
            }
            settings = sts;

            var rate = settings['toolSuit:ratePubSub'] ? settings['toolSuit:ratePubSub'] : 2000;
            try {
                rate = Number.parseInt(rate);
                if (API.subscribeHandler) {
                    clearTimeout(API.subscribeHandler);
                }
                if (settings['toolSuit:openPubSub'] === 'on') {
                    API.subscribeHandler = setInterval(API.subscribe, rate);
                }
            } catch(e) {
                console.log('ReloadSettings failed: ', e);
            }
        });
    }
};

API.actionUserCreate = function(userData) {
    if (settings['toolSuit:openPubSub'] !== 'on') {
        return;
    }
    //console.log('actionUserCreate:', userData);
    user.getUserField(userData.uid, 'password', function(err, value) {
        if (value) {
            userData.password = value;
        }
        var pubChannel = settings['toolSuit:listPub'] ? settings['toolSuit:listPub'] : DEFAULT_PUB;
        db.listPrepend(pubChannel, JSON.stringify({k: 1, v: userData}), function(err) {
            if (err) {
                console.log('ActionUserCreate failed: ', err);
            }
        });
    });
};

API.actionUserUpdateProfile = function(userData) { // {data: data, uid: uid}
    if (settings['toolSuit:openPubSub'] !== 'on') {
        return;
    }
    //console.log('actionUserUpdateProfile:', userData);
    var pubChannel = settings['toolSuit:listPub'] ? settings['toolSuit:listPub'] : DEFAULT_PUB;
    db.listPrepend(pubChannel, JSON.stringify({k: 2, v: userData}), function(err) {
        if (err) {
            console.log('ActionUserUpdateProfile failed: ', err);
        }
    });
};

API.subscribe = function() {
    var subChannel = settings['toolSuit:listSub'] ? settings['toolSuit:listSub'] : DEFAULT_SUB;
    db.listRemoveLast(subChannel, function(err, data) {
        if (err) {
            console.log('ToolSuit subscribe err: ', err);
        } else if (data) {
            try {
                /**
                 * {k:101, v: {}, code: *, msgId: *, appId: *}
                 * {k:102, uid: *, v: {}, code: *, msgId: *, appId: *}
                 */
                var msg = JSON.parse(data);
                switch(msg.k) {
                    case 101:
                        user.create(msg.v, function(err, data) {
                            //console.log('API.subscribe 101: err', err, 'data', data);
                            dbPub(msg, err, data);
                        });
                        break;
                    case 102:
                        user.updateProfile(msg.uid, msg.v, function(err, data) {
                            //console.log('API.subscribe 102: err', err, 'data', data);
                            dbPub(msg, err, data);
                        });
                        break;
                }
            } catch(e) {
                console.log('ToolSuit subscribe err: ', e);
            }
        }
    });

    function dbPub(msg, err, data) {
        msg.v = undefined;
        if (err) {
            msg.err = '' + err;
        } else {
            msg.err = null;
        }
        msg.data = data;
        var pubChannel = settings['toolSuit:listPub'] ? settings['toolSuit:listPub'] : DEFAULT_PUB;
        db.listPrepend(pubChannel, JSON.stringify(msg), function(err) {
            if (err) {
                console.log('Subscribe dbPub failed: ', err);
            }
        });
    }
};

module.exports = API;
