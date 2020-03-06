const express = require('express');
const { supportedVersions } = require('./config/settings');
const { UnsupportedVersion } = require('./utils/errors');

function configureRoutes(expressInstance) {
    // application routes
    const applicationRouter = express.Router({ mergeParams: true });
    applicationRouter.use('/' , (req, res, next) => {
        const version = req.params.apiVersion;
        if (supportedVersions.indexOf(version) === -1) {
            next(new UnsupportedVersion(version));
        } else {
            next();
        }
    });
     // application routes
    applicationRouter.use('/account', require('./modules/account'));

    // application base route
    expressInstance.use('/api/:apiVersion', applicationRouter);
    
    // handle all application errors
    expressInstance.use((error, req, res, next) => {
        console.log(error);
        if(error) {
            res.status(error.errorCode || 400);
            res.send({
                errors: {
                    errorCode: error.errorCode || '',
                    errorType: error.errorType || '',
                    message: error.message || '',
                    errors: error.errors || []
                }
            });
        }
    });

    expressInstance.use('/', (req, res) => {
        res.send('CI/CD Chat application service!!!');
    });
}

module.exports = configureRoutes;