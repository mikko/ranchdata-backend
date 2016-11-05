'use strict';

// Load modules

const Boom = require('boom');
const Hoek = require('hoek');

const implementation = function (server, options) {

    Hoek.assert(options, 'Missing apikey auth strategy options');
    Hoek.assert(typeof options.validate === 'function', 'options.validateFunc must be a valid function in basic scheme');

    const settings = Hoek.clone(options);

    const scheme = {
        authenticate: function (request, reply) {
            const queryParams = request.query;
            const token = queryParams.token;

            if (!token) {
                return reply(Boom.unauthorized('Request missing token'));
            }

            settings.validate(request, token, (err, isValid, credentials) => {

                credentials = credentials || null;

                if (err || !isValid) {
                    return reply(Boom.unauthorized('Bad apikey'));
                }

                if (!credentials || typeof credentials !== 'object') {
                    return reply(Boom.badImplementation('Bad credentials object received for apikey auth validation'));
                }

                // Authenticated
                return reply.continue({ credentials: credentials });
            });
        }
    };

    return scheme;
};

exports.register = function (plugin, options, next) {

    plugin.auth.scheme('queryToken', implementation);
    next();
};

exports.register.attributes = {
    pkg: require('../../package.json')
};
