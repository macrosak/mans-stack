'use strict';

/* Filters */

angular.module('nsa.filters', []).filter('time', function () {
    return function (dateInMillis) {
        var d = new Date(dateInMillis);
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var seconds = d.getSeconds();
        if (hours < 10)   hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;

        return hours + ':' + minutes + ':' + seconds;
    };
});
