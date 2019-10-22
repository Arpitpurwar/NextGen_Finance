const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('../config');
const routes = require('../api/routes/crud');
const path = require('path');


module.exports ={ 
    load: (obj) => {
    let app = obj.app;

  app.get('/status', (req, res) => {
    res.status(200).end();
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  app.use(require('method-override')());

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json({limit: '50mb'}));

  // --------- Swagger Documentation --------
if (!config.documentation.hidden) {
  // Documentation is enabled for this environment
  const swaggerJSDoc = require('swagger-jsdoc')
  const swaggerDefinition = {
    info: {
      title: 'REST API Ledger for BP Finance Tool',
      version: '1.0.0',
      description: `All Rest API are listed below with their endpoint name. We can hit any listed API and see their response and request parameters.`
    },
    host: `${config.HOST}:${config.PORT}`,
    basePath: config.api.prefix,
    tags: [config.tags]
  }
  // options for the swagger docs
  const swaggerOptions = {
    swaggerDefinition: swaggerDefinition,
    apis: [path.join(__dirname,'../api','/routes/**/*.js')]
  }
  // initialize swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(swaggerOptions)
  // Mount swagger json endpoint
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
  // Mount swagger ui endpoint
  app.use('/docs', express.static(path.join(__dirname, '../api_docs')))
}
  // Load API routes
 app.use(config.api.prefix, routes);

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
  });

  /// error handlers
  app.use((err, req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === 'UnauthorizedError') {
      return res
        .status(err.status)
        .send({ message: err.message })
        .end();
    }
    return next(err);
  });
  
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });
}

}