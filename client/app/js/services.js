'use strict';

/* Services */


angular.module('nsa.services', []).
    factory('socket',function ($rootScope) {
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
    }).factory('notifications', function ($window, $timeout) {
        var Notifications = function () {


            this.sendNotification = function (title, text) {
                if (this.permissionGranted()) {
                    var notification = $window.webkitNotifications.createNotification('', title, text);
                    notification.onclick = function(e) {
                        window.focus();
                        notification.cancel(); };
                    notification.show();
                    $timeout(function () {
                        notification.cancel();
                    }, 3000);
                } else {
                    this.requestPermission();
                    return;
                }
            };

            this.permissionGranted = function () {
                return $window.webkitNotifications.checkPermission() == 0;
            };

            this.requestPermission = function () {
                $window.webkitNotifications.requestPermission(function(){});
            };
        };

        return new Notifications();
    });

angular.module('nsa.data', ['nsa.services']).
    factory('chat', function (socket, notifications) {
        var Chat = function () {
            this.messages = [];
            this.logged = false;
            this.username = null;

            var instance = this;

            socket.on('message', function (data) {
                instance.messages = instance.messages.concat(data);
                var lastMessage = null;
                if (angular.isArray(data)) {
                    var maxDate = 0;
                    angular.forEach(data, function (message) {
                        if (message.user != instance.username && message.type == 'user' && message.date > maxDate) {
                            maxDate = message.date;
                            lastMessage = message;
                        }
                    });
                } else if (data.user != instance.username && data.type == 'user') {
                    lastMessage = data;
                }

                if (lastMessage) {
                    notifications.sendNotification(lastMessage.user + ':', lastMessage.text);
                }
            });

            this.login = function (username) {
                socket.emit('login', username, function (success) {
                    instance.logged = success;
                    instance.username = username;
                })
            }

            this.sendMessage = function (message) {
                socket.emit('message', message);
            };

        };

        return new Chat();
    });