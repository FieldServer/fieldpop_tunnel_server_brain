/**
 * Created by C Calitz on 10/14/2015.
 */


var MESH_PORT = 8080;
var MESH_SECRET = "smc_data_mesh";

var TUNNEL_COMPONENT = "websocket-tunnel";
var TUNNEL_PATH = "/websocket-tunnel/tunnel-info";

var TEST_DATA = {
  "abcdefg": {
    deviceName: "My Device 1",
    tunnelUrl: "192.168.100.118:2020",
    proxyUrl: "abcdefg.192.168.100.118.xip.io",
    status: "Online"
  },
  "xyzqwe": {
    deviceName: "My Device 2",
    tunnelUrl: "192.168.100.224:2020",
    proxyUrl: "xyzqwe.192.168.100.224.xip.io",
    status: "Offline"
  }
};


function error_log(x, y, z) {
  if(z) return console.error(x,y,z);
  if(y) return console.error(x,y);
  console.error(x);
}


var app = angular.module('app', []);
app.controller('myController', ['$scope', function ($scope) {
  $scope.meshClient = null;
  $scope.tunnel_info = {};

  $scope.subscribeToMesh = function (mesh_path, done) {
    // subscribe to data changes
    $scope.meshClient.data.on(mesh_path, {event_type: 'set', count: 0}, done,
        function (err) {
          if (err) error_log("Subscribe mesh data error", err, mesh_path);
        });

    // get initial data value
    $scope.meshClient.data.get(mesh_path, {}, function (err, message) {
      if (err) {
        error_log("Get mesh data error", err, mesh_path);
        return;
      }
      done(message);
    });
  };

  $scope.handleTunnelData = function (message) {
    console_log("Tunnel Info", message);
    if (_.has(message, "payload") === false) {
      console_log("No Tunnel Info");
      return;
    }

    if (_.isArray(message.payload) === false) {
      var payload_array = [message.payload];
      message.payload = payload_array;
    }

    $scope.$apply(function () {
      $scope.tunnel_info = message.payload[0].data;
    });
  };

  $scope.handleTunnelEvents = function (message, metadata) {

    console.log("Tunnel Event", message);

    if(message._meta.path.indexOf("/tunnel/") < 1){
      return;
    }

    $scope.$apply(function(){

      if(message.name){
        $scope.tunnel_info[message.id] = {
          deviceName: message.name,
          tunnelUrl: message.gateway + ":" + message.defaultForwardingPort,
          proxyUrl: message.id +"." + window.location.hostname + ".xip.io",
          status: "Online"
        };
      }
      console.log($scope.tunnel_info);
    });

  };

  $scope.instantiateMeshClient = function () {
    MeshClient(window.location.hostname, MESH_PORT, MESH_SECRET, function (err, client) {
      if (err) {
        error_log("Create Mesh error", err);
        return;
      }
      $scope.$apply(function () {
        $scope.meshClient = client;

        //$scope.subscribeToMesh(TUNNEL_PATH, $scope.handleTunnelData);

        $scope.meshClient.event[TUNNEL_COMPONENT].on("*", $scope.handleTunnelEvents);
      });
    });
  };

  $scope.stopMeshClient = function () {
    if (!$scope.meshClient) {
      return;
    }
    $scope.meshClient.event[TUNNEL_COMPONENT].off("*", function (err) {
      if (err) {
        error_log(err);
      }
    });
  };


  $scope.$on("$destroy", function () {
    $scope.stopMeshClient();
  });


  //$scope.tunnel_info = TEST_DATA;
  $scope.instantiateMeshClient();
  //$scope.tunnel_info = TEST_DATA;



}]);