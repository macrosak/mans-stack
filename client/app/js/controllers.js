'use strict';

/* Controllers */

angular.module('nsa.controllers', []).
    controller('Home', function ($scope, chat) {
        $scope.chat = chat;
        $scope.newMessage = '';
        $scope.username = '';

        $scope.send = function() {
            chat.sendMessage($scope.newMessage);
            $scope.newMessage = '';
        };

        $scope.login = function() {
            chat.login($scope.username);
        }
    });