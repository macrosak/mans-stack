'use strict';

/* Directives */


angular.module('nsa.directives', []).
    directive('onEnter',function () {
        return function (scope, elm, attrs) {
            elm.bind("keyup", function (e) {
                if (e.keyCode == 13) {
                    scope.$apply(attrs.onEnter);
                    return false; // returning false will prevent the event from bubbling up.
                }
            });
        };
    }).directive('focusMe', function ($timeout) {
        return function (scope, element, attrs) {
            scope.$watch(attrs.focusMe, function (value) {
                if (value == true) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });

        };
    });
;