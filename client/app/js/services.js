'use strict';

/* Services */


angular.module('nsa.services', []).
    factory('armageddon',function ($timeout) {
        var Armageddon = function () {
            var shown = false;
            var timeoutPromise = null;
            var instance = this;

            this.toggle = function () {
                shown ? this.hide() : this.show();
            }

            var getRandomColor = function () {
                var letters = '0123456789ABCDEF'.split('');
                var color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.round(Math.random() * 15)];
                }
                return color;
            }

            var hell = function () {
                jQuery('body').css('backgroundColor', getRandomColor());
                jQuery('body').css('color', getRandomColor());
                instance.timeoutPromise = $timeout(hell, Math.round(Math.random() * 200));
            }
            this.show = function () {
                hell();

                jQuery('body').css('backgroundColor', 'red');
                shown = true;
            };

            this.hide = function () {
                $timeout.cancel(instance.timeoutPromise);
                jQuery('body').css('backgroundColor', 'white');
                jQuery('body').css('color', 'black');
                shown = false;
            };
        };

        return new Armageddon();
    }).
    factory('socket',function ($rootScope) {
        var socket = io.connect('http://192.168.178.175:8888');
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
                    notification.onclick = function (e) {
                        window.focus();
                        notification.cancel();
                    };
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
                $window.webkitNotifications.requestPermission(function () {
                });
            };
        };

        return new Notifications();
    })

/*.factory('pokus ', function () {
 var Armageddon  = function () {
 var shown = false;

 this.toggle = function() {
 shown ? this.hide() : this.show();
 }

 this.show = function () {
 jQuery('body').css('backgroundColor', 'red');
 };

 this.hide = function () {
 jQuery('body').css('backgroundColor', 'white');
 };
 };

 return new Armageddon();
 });*/

angular.module('nsa.data', ['nsa.services']).
    factory('chat', function (socket, notifications, armageddon) {
        var Chat = function () {
            this.messages = [];
            this.logged = false;
            this.username = null;

            var instance = this;

            socket.on('message', function (data) {
                var arm = false;
                instance.messages = instance.messages.concat(data);
                var lastMessage = null;
                if (angular.isArray(data)) {
                    var maxDate = 0;
                    angular.forEach(data, function (message) {
                        if (message.user != instance.username && message.type == 'user' && message.date > maxDate) {
                            maxDate = message.date;
                            lastMessage = message;
                        }
                        if (message.text.lastIndexOf('armageddon') >= 0)
                            arm = !arm;
                    });
                } else if (data.user != instance.username && data.type == 'user') {
                    lastMessage = data;
                }

                if (data.text && data.text.lastIndexOf('armageddon') >= 0) {
                    arm = !arm;
                }

                if (lastMessage) {
                    notifications.sendNotification(lastMessage.user + ':', lastMessage.text);
                }
                if (arm)
                    armageddon.toggle();
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