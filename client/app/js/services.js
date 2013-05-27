'use strict';

/* Services */


angular.module('nsa.services', []).
    factory('socket', function ($rootScope) {
        var socket = io.connect('http://localhost:8888');
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });

angular.module('nsa.data', ['nsa.services']).
    factory('chat', function (socket) {
        var Chat = function() {
            this.messages = [];
            this.logged = false;

            var instance = this;

            socket.on('message', function(data) {
                instance.messages = instance.messages.concat(data);
            });

            this.login = function(username) {
                socket.emit('login', username, function(success) {
                    instance.logged = success;
                })
            }

            this.sendMessage = function(message) {
                socket.emit('message', message);
            };

        };

        return new Chat();
    });
