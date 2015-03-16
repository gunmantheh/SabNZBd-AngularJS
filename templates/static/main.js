var app = angular.module("sabnzbdApp", ['ui.bootstrap', 'ngAnimate']);
app.controller("PostsCtrl", function($scope, $http, $timeout, queueRefresh) {
  $scope.refresh = 5;

  $scope.deleteNZB = function(id, event) {
    console.log("Removing queue item", id);
    $http.get('tapi', {
      params: {
        mode: "queue",
        name: "delete",
        value: id,
        output: "json",
        apikey: "$scope.sessionkey"
      }
    })
  };

  $scope.changeCategory = function(id, category, event) {
    console.log("Changing category ", id, category);
    $http.get('tapi', {
      params: {
        mode: "change_cat",
        value: id,
        value2: category,
        output: "json",
        apikey: "$scope.sessionkey"
      }
    }).success(function(data, status, headers, config) {})
  };

  $scope.pause = function(id, isPaused, event) {
    var actionType = isPaused ? "resume" : "pause";
    console.log("Pausing/Resuming queue item", id, actionType);
    $http.get('tapi', {
      params: {
        mode: "queue",
        name: actionType,
        value: id,
        output: "json",
        apikey: "$scope.sessionkey"
      }
    }).success(function(data, status, headers, config) {})
  };
  pollQueue();

  function pollQueue() {
    queueRefresh.poll().then(function(data) {
      $scope.queueData = data;
      $scope.data = data.queue;
      $timeout(pollQueue, $scope.refresh * 1000);
    })
  }
});
app.factory('queueRefresh', function($http, $timeout) {
  $http.defaults.cache = false;
  var poller = function() {
    return $http.get('tapi', {
      params: {
        start: 0,
        limit: 10,
        mode: "queue",
        output: "json",
        apikey: "$scope.sessionkey"
      }
    }).then(function(responseData) {
      return responseData;
    });
  };

  return {
    poll: poller
  }
});