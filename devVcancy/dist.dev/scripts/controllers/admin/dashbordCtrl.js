'use strict';

vcancyApp
    .controller('adminDashbordCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _) {

            var vm = this;
            vm.totalUsers = 0;
            vm.totalProperty = 0;
            vm.totalUnit = 0;
            vm.totalVacant = 0;
            vm.totalApplication = 0;
            vm.totalShowingScheduled = 0;

            firebase.database().ref('users/').once("value", function (snapvalue) {
                var users = snapvalue.val();
                $scope.$apply(function () {
                    vm.totalUsers = _.size(users);
                });
            });

            firebase.database().ref('properties/').once("value", function (snapvalue) {
                var properties = snapvalue.val();
                $scope.$apply(function () {
                    vm.totalProperty = _.size(properties);

                    vm.totalUnit = _.reduce(properties, function (previousValue, currentValue, currentIndex) {
                        previousValue += _.size(currentValue.unitlists);
                        return previousValue;
                    }, 0);

                    vm.totalVacant = _.reduce(properties, function (previousValue, currentValue, currentIndex) {
                        previousValue += _.reduce(currentValue.unitlists, function (pv, cv, ci) {
                            if (cv.status === 'available' || cv.status === 'availablesoon') {
                                pv += 1;
                            }
                            return pv;
                        }, 0);
                        return previousValue;
                    }, 0);
                });

            });

            firebase.database().ref('submitapps/').once("value", function (snapvalue) {
                var application = snapvalue.val();
                $scope.$apply(function () {
                    vm.totalApplication = _.size(application);
                });
            });

            firebase.database().ref('applyprop/').once("value", function (snapvalue) {
                var scheduled = snapvalue.val();
                console.log(scheduled)
                $scope.$apply(function () {
                    vm.totalShowingScheduled = _.reduce(scheduled, function (pv, cv, ci) {
                        if (cv.schedulestatus == "scheduled" || cv.schedulestatus == "submitted") {
                            pv += 1;
                        }
                        return pv;
                    }, 0);
                });
            });

        }]);
