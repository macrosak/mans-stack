'use strict';


// Declare app level module which depends on filters, and services
angular.module('nsa', ['nsa.data', 'nsa.filters', 'nsa.services', 'nsa.directives', 'nsa.controllers']).
    config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'Home'});
        $routeProvider.otherwise({redirectTo: '/'});
    }).
    run(function() {

    });
