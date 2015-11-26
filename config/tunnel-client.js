var tunnelClientOpts1 = {
  name: 'tunnelClient',
  description: 'description at leaf',
  defaultForwardingPort: 0,
  forwardingService: 'ws://localhost:10000',
  forwardTo: '192.168.2.24:80',
  healthInterval: 1000
};

module.exports = {
  name: 'leaf',
  port: 11011,
  modules: {
    'tunnel-service': {
      path: '@smc/tunnel-service'
    }
  },
  components: {
    'websocket-tunnel': {
      moduleName: 'tunnel-service',
      startMethod: 'createClient',
      schema: {
        methods: {
          'createClient': {
            parameters: [
              {name: 'opts', value: tunnelClientOpts1}
            ]
          }
        }
      }
    }
  }
};
