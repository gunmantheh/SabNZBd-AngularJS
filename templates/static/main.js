var app = angular.module("sabnzbdApp", ['ui.bootstrap', 'ngAnimate', 'ui.sortable']);
app.controller("PostsCtrl", function($scope, $http, $timeout) {
  $scope.refresh = 1;
  $scope.maxSize = 5;
  $scope.noOfRows = 10;
  $scope.refreshing = true;
  $scope.deleteNZB = function(id, event) {
    console.log("Removing queue item", id);
    $http.get('tapi', {
      params: {
        mode: "queue",
        name: "delete",
        value: id,
        output: "json",
        apikey: $scope.sessionkey
      }
    });
  };

  $scope.changeCategory = function(id, category, event) {
    console.log("Changing category ", id, category);
    $http.get('tapi', {
      params: {
        mode: "change_cat",
        value: id,
        value2: category,
        output: "json",
        apikey: $scope.sessionkey
      }
    }).success(function(data, status, headers, config) {});
  };

  $scope.speedLimit = function(speed, event) {
    console.log("Changing speedlimit ", speed);
    $http.get('tapi', {
      params: {
        mode: "config",
        name: "speedlimit",
        value: speed,
        output: "json",
        apikey: $scope.sessionkey
      }
    }).success(function(data, status, headers, config) {});
  };

  $scope.pause = function(id, isPaused, event) {
    var actionType = isPaused ? "resume" : "pause";
    console.log(isPaused ? "Resuming" : "Pausing" + " queue item ", id, actionType);
    $http.get('tapi', {
      params: {
        mode: "queue",
        name: actionType,
        value: id,
        output: "json",
        apikey: $scope.sessionkey
      }
    }).success(function(data, status, headers, config) {});
  };

  $scope.pauseAll = function(isPaused, event) {
    var actionType = isPaused ? "resume" : "pause";
    console.log(isPaused ? "Resuming" : "Pausing" + " queue item ", actionType);
    $http.get('tapi', {
      params: {
        mode: actionType,
        output: "json",
        apikey: $scope.sessionkey
      }
    }).success(function(data, status, headers, config) {
      $scope.pausedAll = !isPaused;
    });
  };

  $scope.counter = 0;
  $scope.getQueue = function() {
    console.log('Called getQueue, using API: ' + $scope.sessionkey);
    $http.get('tapi', {
      params: {
        start: $scope.currentPage == 1 ? 0 : $scope.currentPage * $scope.noOfRows,
        limit: $scope.noOfRows,
        mode: "queue",
        output: "json",
        apikey: $scope.sessionkey
      }
    }).success(function(data, status, headers, config) {
      $scope.queue = data.queue;
      //$scope.counter++;
      //console.log('response ' + $scope.counter);
      $scope.queuetimeout = $timeout($scope.getQueue, $scope.refresh * 1000);
    });
  };
  $scope.queuetimeout = $timeout($scope.getQueue, $scope.refresh * 1000);

  $scope.getQueueChange = function(status) {
    if (status) {
      $scope.queuetimeout = $timeout($scope.getQueue, $scope.refresh * 1000);
    } else {
      $timeout.cancel($scope.queuetimeout);
    }
    $scope.refreshing = status;

  };


  $scope.changeOrder = function(id, toIndex) {
    console.log("Moving queue item", id, toIndex);
    $http.get('tapi', {
      params: {
        mode: "switch",
        value: id,
        value2: toIndex,
        output: "json",
        apikey: $scope.sessionkey
      }
    }).success(function(data, status, headers, config) {});
  };

  var fixHelper = function(e, ui) {
    ui.children().each(function() {
      $(this).width($(this).width());
    });
    return ui;
  };

  $scope.sortableOptions = {
    helper: fixHelper,
    connectWith: ".list > tbody",
    items: '.repeat-item',
    stop: function(e, ui) {
      // var logEntry = tmpList.map(function(i){
      //   return i.value;
      // }).join(', ');
      var fromIndex = ui.item.sortable.index;
      var toIndex = ui.item.sortable.dropindex;
      var id = ui.item.scope().slot.nzo_id;
      if (_.isUndefined(toIndex)) {
        console.log('invalid target', id, fromIndex, toIndex);
        return false;
      }
      console.log('moved', id, fromIndex, toIndex);

      $scope.changeOrder(id, toIndex);

      return true;
    },
    update: function(e, ui) {
      var dropTarget = ui.item.sortable.droptarget;
      var actualTarget = dropTarget[0].parentElement;
      if ($(actualTarget).hasClass("queueTable")) {
        return true;
      }
      ui.item.sortable.cancel();
      return false;
    },
  };
});
