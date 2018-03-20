'use strict';

vcancyApp
    .controller('adminDashbordCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _) {

            var vm = this;
            vm.allUsers ={};
            vm.totalUsers = 0;
            vm.totalProperty = 0;
            vm.totalUnit = 0;
            vm.totalVacant = 0;
            vm.totalApplication = 0;
            vm.totalShowingScheduled = 0;

            firebase.database().ref('users/').once("value", function (snapvalue) {
                var users = snapvalue.val();
                vm.allUsers = snapvalue.val();
                console.log(vm.allUsers)
                $scope.$apply(function () {
                    vm.totalUsers = _.size(users);
                });
            });

            firebase.database().ref('properties/').once("value", function (snapvalue) {
                var properties = snapvalue.val();
                vm.properties = snapvalue.val();

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
                // console.log(scheduled)
                $scope.$apply(function () {
                    vm.totalShowingScheduled = _.reduce(scheduled, function (pv, cv, ci) {
                        if (cv.schedulestatus == "scheduled" || cv.schedulestatus == "submitted") {
                            pv += 1;
                        }
                        return pv;
                    }, 0);
                });
            });
    
            vm.getListings = function () {

                var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").once("value", function (snapshot) {

                    console.log('propertyschedule', snapshot.val())
                    $scope.$apply(function () {
                        vm.success = 0;
                        if (snapshot.val()) {
                            vm.listings = snapshot.val();
                            vm.listings = _.filter(vm.listings, function (schedule, key) {
                                console.log(schedule.status)
                                if (schedule.listOnCraigslist == true && (schedule.status == 'Not Listed' || schedule.status == 'Pending')) {
                                    return true;
                                }
                            });
                            vm.generateMergeListing();
                            vm.listingsAvailable = 1;
                        } else {
                            vm.listingsAvailable = 0;
                        }
                        vm.loader = 0;
                    });
                });
            }

            vm.generateMergeListing = function () {
                vm.mergeListing = {};
                _.forEach(vm.listings, function (list, key) {
                    if (!vm.mergeListing[list.link]) {
                        vm.mergeListing[list.link] = angular.copy(vm.listings[key]);
                        vm.mergeListing[list.link].fromToDate = [];
                        var date = '';
                        if (moment(vm.listings[key].fromDate).format('DD MMM') == moment(vm.listings[key].toDate).format('DD MMM')) {
                            date = moment(vm.listings[key].fromDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
                        }
                        else {
                            date = moment(vm.listings[key].fromDate).format('DD') + ' to ' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
                        }
                        vm.mergeListing[list.link].fromToDate.push(date);
                        vm.mergeListing[list.link].keys = [key];
                    } else {
                        var date = '';
                        if (moment(vm.listings[key].fromDate).format('DD MMM') == moment(vm.listings[key].toDate).format('DD MMM')) {
                            date = moment(vm.listings[key].fromDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
                        }
                        else {
                            date = moment(vm.listings[key].fromDate).format('DD') + ' to ' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
                        }
                        vm.mergeListing[list.link].fromToDate.push(date);
                        vm.mergeListing[list.link].keys.push(key);
                    }
                });
                console.log(vm.mergeListing)
            };
            vm.getListings();
        }]);
