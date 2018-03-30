vcancyApp.filter('availableunit', function () {
    return function (units, filterBy) {
        return units.filter(function (unit) {
            if (unit.status === 'status' || unit.status === 'available' || unit.status === 'availablesoon') {
                return true;
            }
        });
    };
});