var filename = require('path').basename(__filename);

describe(filename, function () {

  var spawn = require('child_process').spawn;
  var path = require('path');
  var tunnelServer;
  var tunnelClient;
  var Mesh = require('happner');
  var mesh;

  var eventClientConfig = {
    name: 'event-client',
    port: 6666,
    endpoints: {
      tunnelServer: {  // remote mesh node
        config: {
          port: 5000,
          host: 'localhost',
          username: '_ADMIN',
          password: 'tunnel'
        }
      }
    }
  };

  this.timeout(40000);

  before('Starts up services', function (done) {

    // spawn tunnelServer mesh in another process
    tunnelServer = spawn('node', [path.join(__dirname, '../bin/fieldpop_tunnel_server')]);

    tunnelServer.stdout.on('data', function (data) {

      //console.log('SERV: ' + data.toString());

      if (data.toString().match(/READY/)) {

        console.log('\nstarted fieldpop_tunnel_server');

        // subscribe to tunnel events on server
        mesh = new Mesh();
        mesh.initialize(eventClientConfig, function (err) {

            if (err) {
              console.log('\nEVENT-CLIENT error :' + err);
              done(err);
            }

            console.log('\nREADY');

            done();

          }
        );
      }
    });

  });

  it('should run a test system method on the mesh', function (done) {

    mesh.exchange.tunnelServer ['system'].getStats(function (e, data) {
      //console.log(e, data);
      done();
    })

  });

  it('should propagate events to remote client mesh', function (done) {

    // THIS IS THE DECISIVE SUBSCRIPTION
    // SEE ALSO fieldpop_tunnel_server line 9
    mesh.event.tunnelServer ['tunnel-service'].on('*', tunnelEventHandler, tunnelSubComplete);

    function tunnelSubComplete(err) {
      if (err) {
        console.log('\ntunnelSubComplete err: ', err);
        return;
      }
      console.log('\ntunnelSubComplete subscribed');

      // when done subscribing start tunnel client
      tunnelClient = spawn('node', [path.join(__dirname, '../bin/tunnel-client')]);
      tunnelClient.stdout.on('data', function (data) {
        //console.log('CLIENT: ' + data.toString());
        if (data.toString().match(/READY/)) {
          console.log('\nstarted tunnel-client');
        }
      });
    }

    function tunnelEventHandler(data, meta) {
      if (meta.path.match(/tunnel\/create$/)) {
        console.log('\nCreated tunnel with id ' + data.id + ' to device ' + data.name + '\n');
        mesh.stop(done);
      }
    }

  });

  after(function (done) {
    if (tunnelServer) tunnelServer.kill();
    if (tunnelClient) tunnelClient.kill();
    done();
  });

});