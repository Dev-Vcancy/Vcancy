'use strict';

vcancyApp
    .controller('adminScheduleCtrl', ['$scope', '$firebaseAuth','emailSendingService', '$state', '$rootScope', '$stateParams', '$window', '_', '$uibModal',
        function ($scope, $firebaseAuth, emailSendingService,$state, $rootScope, $stateParams, $window, _, $uibModal) {

            var vm = this;
            var landlordID = localStorage.getItem('userID');

            //vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
            vm.userData = {};

            var vm = this;
            vm.selectedUser = '';
            vm.statusChange = {};
            vm.usersList = [];
            firebase.database().ref('users/').once("value", function (snapvalue) {

                var users = snapvalue.val();
                vm.allUsers = snapvalue.val();
               //   console.log( vm.allUsers);
               // console.log('users', users, Object.keys(users).length);
                users = _.filter(users, function (user, key) {
                    if (user.usertype == 1 || user.usertype == 3) {
                        user.key = key;
                        return true;
                    }
                });
                $scope.$apply(function () {
                    vm.usersList = users;
                });
            });

            vm.getScheduleListing = function () {
                vm.userData = vm.allUsers[vm.selectedUser];
               //  console.log(vm.userData);
                vm.getListings(vm.selectedUser);
            }

            vm.propertySelected = '';
            vm.unitSelected = '';
            vm.selectedUnitId = '';
            vm.units = [];
            vm.fromDate = '';
            vm.toDate = '';
            vm.fromTime = '';
            vm.toTime = '';
            vm.properties = [];
            vm.listings = [];
            vm.mergeListing = {};
            vm.selectedListings = [];

            vm.getListings = function (landlordId) {
                vm.loader = 1;
                if (!landlordId) {
                    landlordId = vm.selectedUser;
                }
                if (!landlordId) return;

                var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").equalTo(landlordId).once("value", function (snapshot) {
                    vm.getProperties(landlordId);
                    //console.log('propertyschedule', snapshot.val())
                    $scope.$apply(function () {
                        vm.success = 0;
                        if (snapshot.val()) {
                            vm.listings = snapshot.val();
                            vm.generateMergeListing();
                            vm.listingsAvailable = 1;
                        } else {
                            vm.listingsAvailable = 0;
                        }
                        vm.loader = 0;
                    });
                });
            }

            $scope.openImageModal = function () {
                $scope.imageModal = $uibModal.open({
                    templateUrl: 'viewimages.html',
                    controller: 'propertyCtrl',
                    backdrop: 'static',
                    size: 'lg',
                    windowClass: 'zIndex',
                    scope: $scope
                });
            }

            $scope.closeImageModal = function () {
                $scope.imageModal.dismiss('cancel');
            }

            vm.getProperties = function (landlordID, propertyID) {
                var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
                    $scope.$apply(function () {
                        vm.success = 0;
                        if (snapshot.val()) {
                            vm.properties = snapshot.val();
                            vm.propertiesAvailable = 1;
                        } else {
                            vm.propertiesAvailable = 0;
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
         //       console.log(vm.mergeListing)
            };

            vm.clearAll = function ($event) {
                vm.propertySelected = '';
                vm.unitSelected = '';
                vm.selectedUnitId = '';
                vm.units = [];
                vm.fromDate = '';
                vm.toDate = '';
                vm.fromTime = '';
                vm.toTime = '';
                $event.preventDefault();
            }

            vm.checkAllListing = function () {
                $.map(vm.listings, function (value, key) {
                    value.inputCheck = vm.selectedAllListing;
                });
                vm.generateMergeListing();
            };

            vm.statusChangeHandler = function (propertyId, unitId) {
               // console.log(vm.statusChange)
            }

            vm.checkForDuplicate = function (currentUnit) {
                for (var i in vm.listings) {
                    var value = vm.listings[i];
                    if (value.propertyId == currentUnit.propertyId && value.unitID == currentUnit.unitID
                        && value.fromDate == currentUnit.fromDate && value.fromTime == currentUnit.fromTime
                        && value.toDate == currentUnit.toDate && value.toTime == currentUnit.toTime) {
                        return true;
                    }
                }
            };

            vm.addAvailability = function ($event) {
                $event.preventDefault();
                if (!vm.propertySelected || !vm.fromDate || !vm.toDate || !vm.fromTime || !vm.toTime) {
                    return;
                }
                var availabilities = [];
                var url = 'https://vcancy.com/login/#/applyproperty/'
                // if (window.location.host.startsWith('localhost')) {
                // 	url = 'http://localhost:9000/#/applyproperty/'
                // }
                var host = window.location.origin;
                if (host.indexOf('localhost') > -1) {
                    url = host + '/#/applyproperty/';
                } else {
                    url = host + '/login/#/applyproperty/';
                }
                var availability = {
                    propertyId: vm.propertySelected,
                    fromDate: moment(vm.fromDate.toString()).toDate().toString(),
                    fromTime: vm.fromTime,
                    toDate: moment(vm.toDate.toString()).toDate().toString(),
                    toTime: vm.toTime,
                    landlordID: landlordID,
                    userID: userID,
                    link: url + vm.propertySelected,
                    status: 'Not Listed',
                    listOnCraigslist: false
                }
                vm.units = _.map(vm.selectedUnitId, 'unit');
                if (vm.units.length == 0) {
                    return;
                }
                var errorText = ''
                if (vm.units.length > 0) {
                    vm.units.forEach(function (unit) {
                        var data = {
                            unitID: unit
                        };
                        var _unitAvailability = Object.assign(data, availability);
                        _unitAvailability.link = _unitAvailability.link + '?unitId=' + unit;
                        var isDuplicateEntry = vm.checkForDuplicate(_unitAvailability);
                        if (!isDuplicateEntry) {
                            availabilities.push(_unitAvailability);
                        } else {
                            errorText += 'Duplicate entry found for ' + unit + ', ';
                        }
                    });
                    if (errorText != '') {
                        swal({
                            title: 'Some units cannot be saved',
                            text: errorText,
                            type: 'error'
                        });
                    }
                } else {
                    availabilities.push(availability);
                }
                var promises = [];
                var fbObj = firebase.database();
                availabilities.forEach(function (availability) {
                    var promiseObj = fbObj.ref('propertiesSchedule/').push().set(availability)
                    promises.push(promiseObj);
                });
                vm.loader = 1;
                $q.all(promises).then(function () {
                    vm.loader = 0;
                    vm.propertySelected = '';
                    vm.units = [];
                    vm.unitSelected = '';
                    vm.selectedUnitId = '';
                    vm.fromDate = '';
                    vm.toDate = '';
                    vm.fromTime = '';
                    vm.toTime = '';
                    vm.getListings();
                });
            };

            $scope.craigslistopen = function (isOpen) {
                if (isOpen) {
                    var userData = vm.userData;
                    $scope.craigslist = {
                        username: userData.craigslistUserID || '',
                        password: userData.craigslistpassword || '',
                        renewAds: userData.craigslistRenewAds || false,
                        removeAds: userData.craigslistRemoveAds || false
                    }
                    vm.Craigslistopenapp = $uibModal.open({
                        templateUrl: 'craigslist.html',
                        backdrop: 'static',
                        size: 'lg',
                        scope: $scope
                    });
                }
                else {
                    vm.Craigslistopenapp.close();
                }
            };

            $scope.saveCraigslistDetails = function () {
                var fbObj = firebase.database();
                var promiseObj = fbObj.ref('users/' + landlordID).update({
                    craigslistUserID: $scope.craigslist.username,
                    craigslistpassword: $scope.craigslist.password,
                    craigslistRenewAds: $scope.craigslist.renewAds,
                    craigslistRemoveAds: $scope.craigslist.removeAds
                }).then(function () {
                    userData = JSON.parse(localStorage.getItem('userData')) || {};

                    userData['craigslistUserID'] = $scope.craigslist.username,
                        userData['craigslistpassword'] = $scope.craigslist.password,
                        userData['craigslistRenewAds'] = $scope.craigslist.renewAds,
                        userData['craigslistRemoveAds'] = $scope.craigslist.removeAds,
                        localStorage.setItem('userData', JSON.stringify(userData));
                })
                vm.Craigslistopenapp.close();
            }

            vm.deleteListings = function ($event) {
                var selectedListings = [];
                $.map(vm.mergeListing, function (value, key) {
                    if (value.inputCheck) {
                        selectedListings = _.concat(selectedListings, value.keys);
                    }
                });
                if (selectedListings.length == 0) {
                    return;
                }
                var promises = [];
                vm.loader = 1;
                var fbObj = firebase.database();
                selectedListings.forEach(function (listing) {
                    var promiseObj = fbObj.ref('propertiesSchedule/' + listing).remove();
                    promises.push(promiseObj);
                });
                $q.all(promises).then(function () {
                    vm.loader = 0;
                    vm.selectedListings = [];
                    vm.listings = [];
                    vm.selectedAllListing = false;
                    vm.mergeListing = {};
                    vm.getListings();
                }); 
            };
            
            vm.saveaction =function (keys, link, status,key){
  
                 keys.forEach(function (listingId) {
                    var fbObj = firebase.database();
                    fbObj.ref('propertiesSchedule/' + listingId).update({
                        craglistLink: link,
                        status: status
                    }).then(function () {
                        vm.getListings();
                       // console.log()
                    });
                });
                           
                var emailData = '<p>Hello, </p><p>Your request for posting Unit '+vm.mergeListing[key].unitID +' for property address "'+vm.properties[vm.mergeListing[key].propertyId].address+'" has been posted to craglist</p><p>Thanks,</p><p>Team Vcancy</p>';
         
                // Send Email
                emailSendingService.sendEmailViaNodeMailer(vm.userData.email, 'Property Listed on Creaglist', 'Listed', emailData);
                swal({
                    title: 'Success',
                    text: 'Action Save Successfully',
                    type: 'success'
                });

            };

            vm.insertCraglistLink = function (keys, link) {
                keys.forEach(function (listingId) {
                    var fbObj = firebase.database();
                    fbObj.ref('propertiesSchedule/' + listingId).update({
                        craglistLink: link
                    }).then(function () {
                        vm.getListings();
                    });
                });
            };

            vm.toggleStatus = function (keys, status) {
                let toggle = false;
                keys.forEach(function (key) {
                    if (vm.listings[key].listOnCraigslist) {
                        vm.listings[key].listOnCraigslist = !vm.listings[key].listOnCraigslist;
                    }
                    else {
                        vm.listings[key].listOnCraigslist = true;
                    }
                    if (vm.listings[key].listOnCraigslist) {
                        toggle = true;
                    }
                    vm.toggleCraigsList(key, status);
                });
                if (toggle) {
                    swal({
                        title: 'Success',
                        text: 'Your unit will now be listed on Craigslist in 12-24 hours.You will get a notification email when your listing is active.',
                        type: "success",
                    });
                }
            };

            vm.toggleCraigsList = function (listingId, value, $event) {
                vm.loader = 1;
                var fbObj = firebase.database();
                var promiseObj = fbObj.ref('propertiesSchedule/' + listingId).update({
                    status: value
                })
                promiseObj
                    .then(function () {
                        vm.loader = 0;
                        vm.getListings();
                    })
                    .catch(function () {
                        vm.loader = 0;
                    });
            }

            vm.openDetailModel = function (propId, unitId) {
                var index = _.findIndex(vm.properties[propId].unitlists, ['unit', unitId]);
                var prop = vm.properties[propId];
                $scope.selectedUnitDetail = {};
                $scope.selectedUnitDetail.data = vm.properties[propId].unitlists[index];
                $scope.selectedUnitDetail.data.email = localStorage.getItem('userEmail');
                $scope.selectedUnitDetail.index = index;
                $scope.items1 = prop;
                $scope.items1.indexofDetails = index;
                $scope.prop = angular.copy(prop);
                $scope.prop.propID = propId;
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'myModalDetailsContent.html',
                    controller: 'propertyCtrl',
                    backdrop: 'static',
                    size: 'lg',
                    windowClass: '',
                    scope: $scope
                });
            };

            vm.checkIsIncomplete = function (propId, unitId) {
                if (!unitId) {
                    return false;
                }
                if (!vm.properties[propId]) return;
                var unit = _.find(vm.properties[propId].unitlists, ['unit', unitId]);
                var prop = vm.properties[propId];
                return unit.isIncomplete == false ? false : true;
            }




        }]);

