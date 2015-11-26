var proxyListenPort = 8080;

var tunnelServerOpts = {
  name: 'Tunnel Proxy Server',
  wsport: 10000,
  wshostname: '0.0.0.0',
  forwardingHostname: '0.0.0.0',
  healthInterval: 5000,

  emits: {
    'server/create': true,
    'tunnel/create': true,
    'tunnel/open': true,
    'tunnel/close': true,
    'tunnel/error': true,
    'tunnel/health': true,
    'tunnel/destroy': true,
    'tunnel/reset': true,
    'carrier/create': true,
    'carrier/ready': true,
    'carrier/destroy': true,
    'carrier/fail': true,
    'carrier/connect': true,
    'carrier/buzy': true,
    'carrier/close': true,
    'carrier/available': true,
    'session/error': true
  }
};


module.exports = {

  name: 'tunnelServer',
  port: 5000,
  proxyListenPort: proxyListenPort,
  dataLayer:{
    secure: true,
    adminPassword: 'tunnel'
  },

  modules: {
    'tunnel-service': {
      path: '@smc/tunnel-service'
    },
    'tunnel-proxy': {
      path: '@smc/tunnel-proxy'
    }
  },

  components: {
    'tunnel-service': {
      moduleName: 'tunnel-service',
      startMethod: 'createServer',
      schema: {
        methods: {
          'createServer': {
            parameters: [
              {name: 'opts', value: tunnelServerOpts}
            ]
          }
        }
      },
      web: {
        routes: {
          "static": "dashboard"
        }
      }
    },
    'tunnel-proxy': {
      moduleName: 'tunnel-proxy',
      startMethod: 'start',
      schema: {
        methods: {
          'start': {
            parameters: [{
              name: 'opts',
              value: {
                listenPort: proxyListenPort
              }
            }]
          }
        }
      }
    }
  }
};
