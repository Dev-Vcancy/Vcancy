'use strict';

vcancyApp
    .controller('adminApplicationCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_', 'NgTableParams',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _, NgTableParams) {

            var vm = this;
            var tenantID = '';
            var userData = {};
            var userEmail = '';

            var vm = this;
            vm.selectedUser = '';
            vm.statusChange = {};
            vm.usersList = [];
            vm.tenantID = '';
            vm.allUsers = {};

            firebase.database().ref('users/').once("value", function (snapvalue) {

                var users = snapvalue.val();
                vm.allUsers = users;
                //  console.log('users', users, Object.keys(users).length);
                users = _.filter(users, function (user, key) {
                    if (user.usertype == 0) {
                        user.key = key;
                        return true;
                    }
                });
                $scope.$apply(function () {
                    vm.usersList = users;
                });
            });

            vm.submittedappsavail = 0;
            $scope.reverseSort = false;
            vm.submitappsdata = [];

            vm.getPendingApplications = function () {
                firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
                    // console.log(snapshot.val())
                    $scope.$apply(function () {
                        if (snapshot.val() != null) {
                            vm.pendingappsavail = 0;
                            if ($rootScope.$previousState.name == "rentalform") {
                                $state.reload();
                            }
                            vm.tabledata = $.map(snapshot.val(), function (value, index) {
                                if (value.schedulestatus == "scheduled") { // && moment(value.dateslot).isBefore(new Date())
                                    vm.pendingappsavail = 1;
                                    var units = '';
                                    if (value.unitID === ' ' || !value.unitID) {
                                        units = '';
                                    } else {
                                        units = value.unitID + " - ";
                                    }
                                    return [{ applicationID: 0, scheduleID: index, address: units + value.address, dateslot: value.dateSlot, timerange: value.timeRange, schedulestatus: value.schedulestatus }];
                                }
                            });

                            // console.log(vm.tabledata);
                            angular.forEach(vm.tabledata, function (schedule, key) {
                                firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function (snap) {
                                    // console.log(snap.val());
                                    $scope.$apply(function () {
                                        if (snap.val() != null) {
                                            $.map(snap.val(), function (val, k) {
                                                vm.tabledata[key].applicationID = k;
                                            });
                                        }
                                    });
                                });
                            });

                            // console.log(vm.tabledata);

                            vm.extracols = [
                                { field: "scheduleID", title: "", show: true }
                            ];


                            vm.cols = [
                                { field: "address", title: "Address", sortable: "address", show: true },
                                { field: "dateslot", title: "Viewed On", sortable: "dateslot", show: true }
                            ];

                            vm.loader = 0;

                            //Sorting
                            vm.tableSorting = new NgTableParams({
                                sorting: { address: 'asc' }
                            },

                                {
                                    dataset: vm.tabledata
                                })
                        }


                        if (snapshot.val() != null) {
                            $.map(snapshot.val(), function (val, key) {
                                firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(key).once("value", function (snap) {
                                    $scope.$apply(function () {
                                        if (snap.val() !== null) {
                                            //to map the object to array
                                            $.map(snap.val(), function (value, index) {
                                                if (val.externalappStatus == "submit") {
                                                    vm.submittedappsavail = 1;
                                                    vm.submitappsdata.push({ appID: index, address: value.address, dated: moment(value.dated).format("DD-MMMM-YYYY"), rentalstatus: value.rentalstatus });
                                                }
                                            });
                                        }
                                    });
                                });
                            });

                            vm.submitappsextracols = [
                                { field: "appID", title: "", show: true }
                            ];

                            vm.submitappscols = [
                                { field: "address", title: "Address", sortable: "address", show: true },
                                { field: "dated", title: "Submitted On", sortable: "dated", show: true },
                            ];

                            //Sorting
                            vm.submitappsSorting = new NgTableParams({
                                sorting: { address: 'asc' },
                                count: vm.submitappsdata.length
                            },

                                {
                                    dataset: vm.submitappsdata
                                });
                        }

                    });
                });
            }

            vm.getSubmitedApps = function () {
                firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
                    $scope.$apply(function () {
                        if (snapshot.val() != null) {
                            $.map(snapshot.val(), function (value, key) {
                                if (value.scheduleID != 0 && value.externalappStatus == "submit") {
                                    vm.submittedappsavail = 1;
                                    vm.submitappsdata.push({ appID: key, address: value.address, dated: moment(value.dated).format("DD-MMMM-YYYY"), rentalstatus: value.rentalstatus });
                                }
                            });
                            vm.submitappsextracols = [
                                { field: "appID", title: "", show: true }
                            ];

                            vm.submitappscols = [
                                { field: "address", title: "Address", sortable: "address", show: true },
                                { field: "dated", title: "Submitted On", sortable: "dated", show: true },
                            ];

                            //Sorting
                            vm.submitappsSorting = new NgTableParams({
                                sorting: { address: 'asc' },
                                count: vm.submitappsdata.length
                            },

                                {
                                    dataset: vm.submitappsdata
                                })
                        }

                    });
                });

                if (vm.submittedappsavail == 0) {
                    // vm.submitappsdata.push({scheduleID:'', name:'', age: '', profession: '',salary: '', pets: '', maritalstatus:'', appno:'',  schedulestatus: ''});
                } else {
                    vm.loader = 0;
                }

                if (vm.pendingappsavail == 0) {
                    // vm.tabledata.push({scheduleID:'', address:'', dateslot: '', timerange: '',  schedulestatus: ''});
                } else {
                    vm.loader = 0;
                }
            }

            vm.selectUser = function () {
                vm.loader = 1;
                tenantID = vm.selectedUser;
                userData = vm.allUsers[tenantID];
                userEmail = userData.email;
                vm.getPendingApplications();
                vm.getSubmitedApps();
            };

            vm.email = '';
            vm.disablebutton = 1;
            vm.emailrequired = function (event) {
                if (vm.email == '' || !vm.email.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/)) {
                    vm.disablebutton = 1;
                } else {
                    vm.disablebutton = 0;
                }
            }

            vm.openRentalForm = function () {
                $rootScope.isFormOpenToSaveInDraft = true;
                window.location.href = "#/rentalform/0/0";
            }

            vm.requestCreditReport = function () {
                swal({
                    title: "",
                    text: "We will send you an email with instructions on how to get your credit report.\n Are you sure you want to submit this request?",
                    type: "info",
                    showCancelButton: true,
                    confirmButtonClass: "bgm-teal",
                    confirmButtonText: "Yes",
                    closeOnConfirm: false
                }, function () {
                    // swal("Deleted!", "Your imaginary file has been deleted.", "success");
                    var userName = '';
                    if (userData) {
                        userName = userData.firstname + ' ' + (userData.lastname || '');
                    }
                    var emailData = '<p>Hello, </p><p>' + userName + '- ' + userEmail + ' has requested for credit report from the tenant portal';
                    var toEmail = 'creditrequest@vcancy.com';
                    emailSendingService.sendEmailViaNodeMailer(toEmail, 'Tenant Request for Credit Report', 'Request Credit Report', emailData);
                    swal("", "Your request has been submitted successfully, you will soon receive an email.", "success");
                });

            }

            vm.gotoRental = function (event) {
                if (vm.disablebutton == 0) {
                    $rootScope.renterExternalEmail = vm.email;
                    window.location.href = "#/rentalform/0/0";
                }
            }


        }]);
