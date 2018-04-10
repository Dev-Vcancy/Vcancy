'use strict';

vcancyApp
    .controller('adminBillingCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_', "NgTableParams", "$http",
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _, NgTableParams, $http) {
            var vm = this;
            var adminID = localStorage.getItem('userID');
            vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
            vm.currentYear = new Date().getFullYear();
            vm.years = [];
            for (var i = 0; i < 15; i++) {
                vm.years.push(vm.currentYear + i);
            }
            vm.moment = moment;
            var adminID = ''
            if (localStorage.getItem('refId')) {
                adminID = localStorage.getItem('refId')
            } else {
                adminID = localStorage.getItem('userID');
            }
            vm.adminID = adminID;
            var userData = JSON.parse(localStorage.getItem('userData'));
            var userEmail = localStorage.getItem('userEmail');
            vm.userData = userData;
            vm.filters = {
                options: [],
            };
            vm.trialDays = '';
            vm.noFreeUnitPerMonth = '';
            vm.pricePerUnitPerMonth = '';
            vm.selectedUser = undefined;
            vm.selectedUserOldPlan = '';
            vm.selectedUserSelectedPlan = '';
            vm.selectedUserPayaableAmount = 0;
            vm.selectedUserEstimatedAmount = 0;
            vm.selectedUserTotalWithDiscount = 0;
            vm.paymentMethodSelected = '';
            vm.unitsAllowed = 0;
            vm.unitsAlreadyAdded = 0;
            vm.nextBillingCycleStartDate = undefined;
            vm.nextBillingCycleEndDate = undefined;
            vm.unitsFree = 5;
            vm.taxes = 2;   // 2%
            vm.selectedUserTaxes = 0;
            vm.selectedbillableUnits = 0;
            vm.selectedUsertaxes = 0;
            vm.discount = 0.1; // 10%
            vm.selectedUserDiscount = 0;
            vm.paymentComments = "";
            vm.unitsChange = 0;
            vm.rangeSlider = {
                value: 1,
                options: {
                    floor: 5,
                    ceil: 1000,
                    step: 1,
                    minLimit: 5,
                    disabled: false,
                    maxLimit: 1000,
                    onChange: function (val) {
                        vm.updatePayableAmount();
                    }
                }
            };
            vm.card = {
                type: '',
                cardnumber: "",
                expiryMonth: "",
                expiryYear: "",
                cvc: "",
            };
            vm.bankDraftName = "";
            vm.bankDraftNo = "";
            vm.bankOnlineName = "";
            vm.bankOnlineAccountno = "";
            vm.checqueBank = "";
            vm.checqueNo = "";
            vm.usersBillingHistory = [];
            vm.billingHistoryDatatoShow = [];
            vm.tableParams = new NgTableParams({ count: 100 }, { dataset: vm.billingHistoryDatatoShow });
            vm.users = [];
            vm.selectedUsers = [];
            vm.selectedUserBillingHistory = [];
            var billingdate = new Date(), year = billingdate.getFullYear(), month = billingdate.getMonth();
            vm.recieved = new Date();
            vm.fromDate = new Date(year, month, 1);
            vm.endDate = new Date();
            vm.opened = false;
            vm.opened1 = false;
            vm.opened2 = false;
            vm.billingAllowPayment = false;
            vm.currentSelectedUser = undefined;     // selected user db details
            vm.oldPlan = '';
            vm.allowFreeUnits = false;
            vm.discountRequired = false;
            vm.degradePlan = false;
            vm.billingRequired = false;
            vm.unitsProvidedToUser = 5;
            vm.invoice = {
                username: "",
                id: "",
                amount: "",
                tax: "",
                units: "",
                unitsChange: "",
                subscription: "",
                paymethod: "",
                date: '',
                data: ''
            };

            vm.opensuccesssweet = function (value) {
                swal({
                    title: "Success!",
                    text: value,
                    type: "success",
                    confirmButtonColor: '#009999',
                    confirmButtonText: "Ok"
                }, function (isConfirm) {
                    if (isConfirm) {
                        $state.reload();
                    }
                });
            };
            vm.openerrorsweet = function (value) {
                swal({
                    title: "Error",
                    text: value,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },
                    function () {
                        return false;
                    });
            };

            function disabled(data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }
            vm.openPicker = function () {
                vm.opened = true;
            };
            vm.closePicker = function () {
                vm.opened = false;
            };
            vm.openPicker1 = function () {
                vm.opened1 = true;
            };
            vm.closePicker1 = function () {
                vm.opened1 = false;
            };
            vm.openPicker2 = function () {
                vm.opened2 = true;
            };
            vm.closePicker2 = function () {
                vm.opened2 = false;
            };
            vm.dateOptions = {
                dateDisabled: disabled,
                formatYear: 'yy',
                maxDate: new Date(3020, 5, 22),
                minDate: new Date(1970, 1, 1),
                startingDay: 1
            };
            vm.cardTypeDetect = function () {
                var cardno = vm.card.cardnumber;
                vm.card.type = Stripe.card.cardType(cardno);
            };
            vm.cardnoHandler = function () {
                var cardno = vm.card.cardnumber;
                if (Stripe.card.validateCardNumber(cardno)) {
                } else {
                    swal({
                        title: "Warning!",
                        text: "Please enter a valid card no.",
                        type: "warning",
                        confirmButtonColor: '#009999',
                        confirmButtonText: "Ok",
                        showCancelButton: false,
                        closeOnClickOutside: false,
                        allowEscapeKey: true
                    }, function (isConfirm) {
                        if (isConfirm) {
                            console.log("close");
                        } else {
                            console.log("No changes needed");
                        }
                    });
                }
            }
            vm.cardexpiryHandler = function () {
                var expiryMonth = vm.card.expiryMonth;
                var expiryYear = vm.card.expiryYear;
                if (expiryMonth != '' && expiryYear != '') {
                    if (Stripe.card.validateExpiry(expiryMonth, expiryYear))
                    { } else {
                        swal({
                            title: "Warning!",
                            text: "Please select correct expiry date.",
                            type: "warning",
                            confirmButtonColor: '#009999',
                            confirmButtonText: "Ok",
                            showCancelButton: false,
                            closeOnClickOutside: false,
                            allowEscapeKey: true
                        }, function (isConfirm) {
                            if (isConfirm) {
                                console.log("close");
                            } else {
                                console.log("No changes needed");
                            }
                        });
                    }
                }
            }
            vm.cardcvcHandler = function () {
                var cvc = vm.card.cvc;
                if (Stripe.card.validateCVC(cvc))
                { } else {
                    swal({
                        title: "Warning!",
                        text: "Please enter correct cvc code.",
                        type: "warning",
                        confirmButtonColor: '#009999',
                        confirmButtonText: "Ok",
                        showCancelButton: false,
                        closeOnClickOutside: false,
                        allowEscapeKey: true
                    }, function (isConfirm) {
                        if (isConfirm) {
                            console.log("close");
                        } else {
                            console.log("No changes needed");
                        }
                    });
                }
            }
            // update admin billing setttings like trial days , free units and cost per unit for landlords
            vm.updateAdminBillingPricing = function () {
                // prompt swal
                swal({
                    title: "Warning!",
                    text: "Are you sure you want to change Billing settings?",
                    type: "warning",
                    confirmButtonColor: '#009999',
                    confirmButtonText: "Ok",
                    showCancelButton: true,
                    closeOnClickOutside: false,
                    allowEscapeKey: false
                }, function (isConfirm) {
                    if (isConfirm) {
                        console.log("Plan changes beign done");
                        var trialdays = vm.trialDays;
                        var unitsFree = vm.noFreeUnitPerMonth;
                        var pricePerUnitPerMonth = vm.pricePerUnitPerMonth;
                        var userID = localStorage.userID;
                        var updateUser = firebase.database().ref('/billing').update({
                            days: trialdays,
                            freeUnits: unitsFree,
                            pricePerUnit: pricePerUnitPerMonth
                        }).then(function () {
                            // success swal form
                            swal({
                                title: "Success!",
                                text: "Billing settings updated successfully.",
                                type: "success",
                                confirmButtonColor: '#009999',
                                confirmButtonText: "Ok"
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    $state.reload();
                                }
                            });
                        }, function (error) {
                            console.log(error);
                        });
                    } else {
                        console.log("No changes needed");
                        // nothing to do
                    }
                });
            }
            function getUsersList() {
                var landlords = [];
                var usersListFetch = firebase.database().ref('users/').once("value", function (snapshot) {
                    var users = snapshot.val();
                    // console.log("snapshot", users);
                    $.map(users, function (value, key) {
                        if (value.usertype == 1) {
                            // console.log("landlord user: ", value);
                            var landlord = {
                                _id: key,
                                userData: value
                            };
                            landlords.push(landlord);
                        }
                    });
                    console.log("landlord users", landlords);
                    $scope.$apply(function () {
                        vm.users = landlords;
                    });
                });
            }
            function init() {
                getUsersList();
                var userid = localStorage.userID;
                $("body").removeClass("login");
                // fetch billing details
                firebase.database().ref('/billing').once('value').then(function (data) {
                    $scope.$apply(function () {
                        console.log(data.val());
                        vm.unitsFree = data.val().freeUnits;
                        vm.trialDays = data.val().days;
                        vm.pricePerUnitPerMonth = data.val().pricePerUnit;
                        vm.noFreeUnitPerMonth = data.val().freeUnits;
                        vm.rangeSlider = {
                            value: 5,
                            options: {
                                floor: data.val().freeUnits,
                                ceil: 1000,
                                step: 1,
                                minLimit: data.val().freeUnits,
                                maxLimit: 1000,
                                disabled: true,
                                onChange: function (val) {
                                    vm.updatePayableAmount();
                                }
                            }
                        };
                    });
                });

                // firebase.database().ref('users/' + userid + '/').once('value', function (snap) {
                firebase.database().ref('users/').once('value', function (snapshot) {
                    var usersHistory = [];
                    snapshot.forEach(function (childSnapshot) {
                        var item = childSnapshot.val();
                        // item.key = childSnapshot.key;
                        if (item.usertype == 1) {
                            if (item.billingHistory)
                                usersHistory = usersHistory.concat(item.billingHistory);
                        }
                    });
                    // console.log("usersHistory", usersHistory);
                    vm.billingHistoryDatatoShow = usersHistory;
                    var count = parseInt(usersHistory.length + 1);
                    vm.usersBillingHistory = usersHistory;
                    vm.tableParams = new NgTableParams({ count: count }, { dataset: vm.billingHistoryDatatoShow, });
                });

            }
            init();
            var specialElementHandlers = {
                '#editor': function (element, renderer) {
                    return true;
                }
            };
            vm.generatePDFReport = function (data) {
                vm.invoice.username = data.firstname + " " + data.lastname;
                vm.invoice.date = moment(data.date).format("MMMM DD, YYYY HH:mm A");
                vm.invoice.id = data.id;
                vm.invoice.amount = data.amount;
                vm.invoice.tax = data.tax;
                vm.invoice.paymethod = data.payMethod;
                vm.invoice.units = data.units;
                vm.invoice.unitsChange = data.unitsChange;
                vm.invoice.subscription = data.plan;
                vm.invoice.data = data;
                $('#invoice').show(1, function () {
                    var pdf = new jsPDF('p', 'pt', 'letter');
                    pdf.addHTML($('#invoice')[0], function () {
                        pdf.save('Test.pdf');
                        $('#invoice').hide(0);
                    });
                });
            }
            vm.exportAsCsv = function () {
                var table = $("#billingReports").find("table").get(0);
                var csvString = '';
                console.log(table);
                for (var i = 0; i < table.rows.length; i++) {
                    var rowData = table.rows[i].cells;
                    for (var j = 0; j < rowData.length; j++) {
                        csvString = csvString + rowData[j].textContent.trim() + ",";
                    }
                    csvString = csvString.substring(0, csvString.length - 1);
                    csvString = csvString + "\n";
                }
                csvString = csvString.substring(0, csvString.length - 1);
                csvString = csvString.replace(/,,,,,,,\n/, '');
                console.log(csvString);
                var a = $('<a/>', {
                    style: 'display:none',
                    href: 'data:application/octet-stream;base64,' + btoa(csvString),
                    download: 'billinginfo.csv'
                }).appendTo('body')
                a[0].click();
                a.remove();
            };

            vm.filterHistoryFromStart = function () {
                //filter table from start date
                vm.filterHistoryByName();
                // var billingHistoryDatatoShow = vm.usersBillingHistory.filter(history => Date.parse(history.date) > Date.parse(vm.fromDate))
                // vm.tableParams = new NgTableParams({}, { dataset: billingHistoryDatatoShow });
            }
            vm.filterHistoryToEnd = function () {
                //filter table from start date
                vm.filterHistoryByName();
                // var billingHistoryDatatoShow = vm.usersBillingHistory.filter(history => Date.parse(history.date) < Date.parse(vm.endDate))
                // vm.tableParams = new NgTableParams({}, { dataset: billingHistoryDatatoShow });
            }
            vm.filterHistoryByName = function () {
                console.log(vm.selectedUsers);
                console.log(vm.usersBillingHistory);
                if (vm.selectedUsers.length > 0) {
                    if (vm.fromDate && vm.endDate) {
                        var selectedUsers = vm.selectedUsers.map(user => user.userData.firstname + " " + user.userData.lastname);
                        var billingHistoryDatatoShow = vm.usersBillingHistory.filter(history => (selectedUsers.indexOf(history.firstname + ' ' + history.lastname) > -1) && ((Date.parse(history.date) > Date.parse(vm.fromDate)) && (Date.parse(history.date) < Date.parse(vm.endDate))));
                        vm.tableParams = new NgTableParams({}, { dataset: billingHistoryDatatoShow });
                    } else {
                        var selectedUsers = vm.selectedUsers.map(user => user.userData.firstname + " " + user.userData.lastname);
                        var billingHistoryDatatoShow = vm.usersBillingHistory.filter(history => selectedUsers.indexOf(history.firstname + ' ' + history.lastname) > -1);
                        vm.tableParams = new NgTableParams({}, { dataset: billingHistoryDatatoShow });
                    }
                } else {
                    var billingHistoryDatatoShow = vm.usersBillingHistory.filter(history => (Date.parse(history.date) > Date.parse(vm.fromDate)) && (Date.parse(history.date) < Date.parse(vm.endDate)));
                    vm.tableParams = new NgTableParams({}, { dataset: billingHistoryDatatoShow });
                }
            }

            // load state after refresh
            // if (localStorage.userSelected != undefined) {
            //     vm.currentSelectedUser = JSON.parse(localStorage.userSelected);
            // }

            vm.switchUser = function () {
                console.log(vm.currentSelectedUser);
                localStorage.setItem('userSelected', JSON.stringify(vm.currentSelectedUser));
                var user = vm.currentSelectedUser;
                if (user !== '' && user !== undefined) {
                    // selected any user
                    vm.rangeSlider.options.disabled = false;
                    // check if any units are provided to user units are allocated to user
                    if (user.userData.unitsProvidedToUser && user.userData.freeUnitsAlloted && user.userData.unitsProvidedToUser != '' && user.userData.freeUnitsAlloted != '') {
                        vm.unitsProvidedToUser = user.userData.unitsProvidedToUser;
                        vm.allowFreeUnits = false;
                        vm.selectedUserBillingHistory = vm.currentSelectedUser.userData.billingHistory ? vm.currentSelectedUser.userData.billingHistory : [];
                    }
                    else {
                        // if no units are allocated
                        vm.allowFreeUnits = true;
                        vm.unitsProvidedToUser = vm.unitsFree;
                        //set free units being assigned to user
                        firebase.database().ref('users/' + user._id + "/").update({ freeUnitsAlloted: 5, unitsProvidedToUser: vm.unitsProvidedToUser }).then(function (snap) {
                            firebase.database().ref('users/' + user._id + "/").once('value', function (snap) {
                                vm.currentSelectedUser.userData = snap.val();
                                user.userData = snap.val();
                                vm.users.find(landlord => landlord._id === user._id).userData = snap.val();
                            });
                        });
                    }
                    // select previous plan
                    if (user.userData.currentPlan && user.userData.currentPlan != '') {
                        vm.selectedUserSelectedPlan = user.userData.currentPlan;
                        vm.selectedUserOldPlan = user.userData.currentPlan;
                        if (user.userData.currentPlanInfo && user.userData.currentPlanInfo != '') {
                            vm.selectedUserOldPlanInfo = user.userData.currentPlanInfo;
                        } else {
                            vm.selectedUserOldPlanInfo = JSON.stringify({
                                name: "Free",
                                units: vm.unitsProvidedToUser,
                                days: 15,
                                start: moment(new Date()).toDate(),
                                end: moment(new Date()).add(15, "days").toDate()
                            });
                            vm.selectedUserSelectedPlan = "Free";
                            vm.selectedUserOldPlan = "Free";
                            firebase.database().ref('users/' + user._id + "/").update({ currentPlanInfo: vm.selectedUserOldPlanInfo, currentPlan: "Free", }).then(function (data) {
                                firebase.database().ref('users/' + user._id + "/").once('value', function (snap) {
                                    vm.currentSelectedUser.userData = snap.val();
                                    user.userData = snap.val();
                                    vm.users.find(landlord => landlord._id === user._id).userData = snap.val();
                                });
                            });
                        }

                    } else { // no plan
                        vm.selectedUserOldPlanInfo = JSON.stringify({
                            name: "Free",
                            units: vm.unitsProvidedToUser,
                            days: 15,
                            start: moment(new Date()).toDate(),
                            end: moment(new Date()).add(15, "days").toDate()
                        });
                        vm.selectedUserSelectedPlan = "Free";
                        vm.selectedUserOldPlan = "Free";
                        firebase.database().ref('users/' + user._id + "/").update({
                            currentPlanInfo: vm.selectedUserOldPlanInfo,
                            currentPlan: "Free",
                        }).then(function (data) {
                            firebase.database().ref('users/' + user._id + "/").once('value', function (snap) {
                                vm.currentSelectedUser.userData = snap.val();
                                user.userData = snap.val();
                                vm.users.find(landlord => landlord._id === user._id).userData = snap.val();
                            });
                        });
                    }
                }
                else {
                    // no user selected
                    vm.rangeSlider.options.disabled = true;
                }  // no user selected else
                // vm.updatePayableAmount();
            };

            vm.updatePayableAmount = function () {
                vm.calculateNextCycleDate();
                // next plan changes dates to be calculated.
                var billableUnits = 0,
                    estimatedCharge = 0,
                    pricePerUnit = vm.currentSelectedUser.userData.freeUnitsAlloted,
                    freeUnits = vm.currentSelectedUser.userData.freeUnitsAlloted ? vm.currentSelectedUser.userData.freeUnitsAlloted : vm.unitsFree,
                    discount = 0,
                    totalAfterDiscount = 0,
                    taxTodeduct = 0,
                    totalDue = 0,
                    unitsAddedDeleted = 0,
                    date = '';
                vm.selectedUserDiscount = 0;
                vm.selectedUserTaxes = 0;
                var unitsSelected = vm.unitsProvidedToUser; // includes all past allocated units + free units + current added ones i.e. total units user will have 
                var unitsAlreadyPaidFor = parseInt(vm.currentSelectedUser.userData.unitsProvidedToUser) != NaN ? parseInt(vm.currentSelectedUser.userData.unitsProvidedToUser) : 0;
                if (vm.selectedUserSelectedPlan != vm.selectedUserOldPlan) { // plan change
                    var oldPlanInfo = JSON.parse(vm.currentSelectedUser.userData.currentPlanInfo);
                    console.log("Another plan selected");
                    // check if old plan is expired
                    if (Date.parse(oldPlanInfo.end) < Date.now()) {
                        console.log("Plan expired. Pay for all units selected.");
                        // like monthly to annual
                        if (vm.selectedUserSelectedPlan == "Annual" && vm.selectedUserOldPlan == "Monthly") {
                            console.log("Upgrade from monthly o annual. Billing cyckle will be next month first day.");
                            console.log("Pay for selected units annually");
                            vm.billingRequired = true;
                            vm.discountRequired = true;
                            billableUnits = vm.unitsProvidedToUser - freeUnits;
                            vm.selectedbillableUnits = parseInt(billableUnits);
                            estimatedCharge = billableUnits * vm.pricePerUnitPerMonth * 12;
                            discount = estimatedCharge * 0.1;
                            vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                            vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                            totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                            vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                            taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                            vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                            payableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                            vm.selectedUserPayaableAmount = parseFloat(payableAmount.toFixed(2));
                        }
                        // free to Annual
                        if (vm.selectedUserSelectedPlan == "Annual" && vm.selectedUserOldPlan == "Free") {
                            console.log("Upgrade from free to annual. Billing cyckle will be next month first day.");
                            // Billing cycle date will be next month first day
                            console.log("Pay for selected units annually");
                            vm.billingRequired = true;
                            vm.discountRequired = true;
                            billableUnits = vm.unitsProvidedToUser - freeUnits;
                            vm.selectedbillableUnits = parseInt(billableUnits);
                            estimatedCharge = billableUnits * vm.pricePerUnitPerMonth * 12;
                            discount = estimatedCharge * 0.1;
                            vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                            vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                            totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                            vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                            taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                            vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                            payableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                            vm.selectedUserPayaableAmount = parseFloat(payableAmount.toFixed(2));
                        }
                        // free to Monthly
                        if (vm.selectedUserSelectedPlan == "Monthly" && vm.selectedUserOldPlan == "Free") {
                            console.log("Upgrade from free to monthly. Billing cyckle will be next month first day.");
                            console.log("Pay for selected units for month");
                            // Billing cycle date will be next month first day
                            vm.billingRequired = true;
                            vm.discountRequired = false;
                            billableUnits = vm.unitsProvidedToUser - freeUnits;
                            vm.selectedbillableUnits = parseInt(billableUnits);
                            estimatedCharge = billableUnits * vm.pricePerUnitPerMonth;
                            discount = 0;
                            vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                            vm.selectedUserDiscount = 0;
                            totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                            vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                            taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                            vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                            payableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                            vm.selectedUserPayaableAmount = parseFloat(payableAmount.toFixed(2));
                        }
                        // free to Monthly
                        if (vm.selectedUserSelectedPlan == "Monthly" && vm.selectedUserOldPlan == "Annual") {
                            console.log("Upgrade from annual to monthly. Billing cyckle will be next month first day.");
                            console.log("Pay for selected units");
                            // Billing cycle date will be next month first day
                            vm.billingRequired = true;
                            vm.discountRequired = false;
                            billableUnits = vm.unitsProvidedToUser - freeUnits;
                            vm.selectedbillableUnits = parseInt(billableUnits);
                            estimatedCharge = billableUnits * vm.pricePerUnitPerMonth;
                            discount = 0;
                            vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                            vm.selectedUserDiscount = 0;
                            totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                            vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                            taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                            vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                            vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                        }
                        if (vm.selectedUserSelectedPlan == "Free" && vm.selectedUserOldPlan == "Annual") {
                            console.log("Plan chaged from Annual to Free");
                            swal({
                                title: "Warning!",
                                text: 'Are you sure you want to change your subscription to Free. You will not be able to use more than free units.',
                                type: "warning",
                                showCancelButton: true,
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    vm.billingRequired = false;
                                    vm.discountRequired = false;
                                    vm.selectedbillableUnits = 0;
                                    vm.selectedUserDiscount = 0;
                                    vm.selectedUserEstimatedAmount = 0;
                                    vm.selectedUserTotalWithDiscount = 0;
                                    vm.selectedUserTaxes = 0;
                                    vm.selectedUserPayaableAmount = 0;
                                } else { }
                            });
                        }
                        if (vm.selectedUserSelectedPlan == "Free" && vm.selectedUserOldPlan == "Monthly") {
                            console.log("Plan chaged from Monthly to Free");
                            swal({
                                title: "Warning!",
                                text: 'Are you sure you want to change your subscription to Free. You will not be able to use more than free units.',
                                type: "warning",
                                showCancelButton: true,
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    vm.billingRequired = false;
                                    vm.discountRequired = false;
                                    vm.selectedbillableUnits = 0;
                                    vm.selectedUserDiscount = 0;
                                    vm.selectedUserEstimatedAmount = 0;
                                    vm.selectedUserTotalWithDiscount = 0;
                                    vm.selectedUserTaxes = 0;
                                    vm.selectedUserPayaableAmount = 0;
                                } else { }
                            });
                        }

                    } else {
                        console.log("Plan is valid");
                        if (vm.selectedUserSelectedPlan == "Annual" && vm.selectedUserOldPlan == "Monthly") {
                            console.log("Upgrade from monthly to annual. Billing cycle will be next month first day.");
                            if (unitsSelected > unitsAlreadyPaidFor) {
                                // More units added, Add units and update billing cycle from future
                                console.log("Pay for all units and update plan from month to annual.");
                                // pay for all units except free units
                                vm.billingRequired = true;
                                vm.discountRequired = true;
                                billableUnits = vm.unitsProvidedToUser - freeUnits;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = billableUnits * vm.pricePerUnitPerMonth * 12;
                                discount = estimatedCharge * 0.1;
                                vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                                vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                                totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                                vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                                taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                                vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                                vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                            }
                            else if (unitsSelected == unitsAlreadyPaidFor) {
                                console.log("Same no of units. Charge for units annually. Upgrade plan to annually and update added units.");
                                vm.billingRequired = true;
                                vm.discountRequired = true;
                                billableUnits = vm.unitsProvidedToUser - freeUnits;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = billableUnits * vm.pricePerUnitPerMonth * 12;
                                discount = estimatedCharge * 0.1;
                                vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                                vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                                totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                                vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                                taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                                vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                                vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                            }
                            else {
                                // units decreased save info indb so stat it can be changes in furure when plan is expired
                                console.log("Same plan plan selected and units degraded", "set information for next billing cycle.");
                                vm.billingRequired = false;
                                vm.discountRequired = false;
                                billableUnits = vm.unitsProvidedToUser - freeUnits;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = 0;
                                discount = 0;
                                vm.selectedUserEstimatedAmount = 0;
                                vm.selectedUserDiscount = 0;
                                vm.selectedUserTotalWithDiscount = 0;
                                taxTodeduct = 0;
                                vm.selectedUserTaxes = 0;
                                vm.selectedUserPayaableAmount = 0;
                                swal({
                                    title: "Are you sure!",
                                    text: "Do you really want to decrease number of units for this user?",
                                    type: "warning",
                                    confirmButtonColor: '#009999',
                                    confirmButtonText: "Ok",
                                    showCancelButton: true,
                                    closeOnClickOutside: false,
                                    allowEscapeKey: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        console.log("Degrade in progress");
                                        vm.degradeUserPlan(); // apply degrade changes
                                    } else {
                                        console.log("No changes needed");
                                        $scope.$apply(function () {
                                            vm.unitsProvidedToUser = vm.currentSelectedUser.userData.unitsProvidedToUser;
                                        });
                                        // reset units to old already purchased units
                                    }
                                });

                            }
                        }
                        // free to Annual
                        if (vm.selectedUserSelectedPlan == "Annual" && vm.selectedUserOldPlan == "Free") {
                            console.log("Upgrade from free to annual. Billing cyckle will be after free trial plan expire.");
                            // Billing cycle date will be next month first day
                            if (unitsSelected > unitsAlreadyPaidFor) {
                                // More units added, Add units and update billing cycle from future
                                console.log("Pay for all units and update plan from Free to annual.");
                                // pay for all units except free units
                                vm.billingRequired = true;
                                vm.discountRequired = true;
                                billableUnits = vm.unitsProvidedToUser - freeUnits;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = billableUnits * vm.pricePerUnitPerMonth * 12;
                                discount = estimatedCharge * 0.1;
                                vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                                vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                                totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                                vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                                taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                                vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                                vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                            }
                            else if (unitsSelected == unitsAlreadyPaidFor) {
                                console.log("Same no of units. Charge for units annually. Upgrade plan to annually and update added units.");
                                vm.billingRequired = true;
                                vm.discountRequired = true;
                                billableUnits = vm.unitsProvidedToUser - freeUnits;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = billableUnits * vm.pricePerUnitPerMonth * 12;
                                discount = estimatedCharge * 0.1;
                                vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                                vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                                totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                                vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                                taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                                vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                                vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                            }
                            else {
                                // units decreased save info indb so stat it can be changes in furure when plan is expired
                                console.log("Same plan plan selected and units degraded", "set information for next billing cycle.");
                                vm.billingRequired = false;
                                vm.discountRequired = false;
                                billableUnits = vm.unitsProvidedToUser - freeUnits;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = 0;
                                discount = 0;
                                vm.selectedUserEstimatedAmount = 0;
                                vm.selectedUserDiscount = 0;
                                vm.selectedUserTotalWithDiscount = 0;
                                taxTodeduct = 0;
                                vm.selectedUserTaxes = 0;
                                vm.selectedUserPayaableAmount = 0;
                                swal({
                                    title: "Are you sure!",
                                    text: "Do you really want to decrease number of units for this user?",
                                    type: "warning",
                                    confirmButtonColor: '#009999',
                                    confirmButtonText: "Ok",
                                    showCancelButton: true,
                                    closeOnClickOutside: false,
                                    allowEscapeKey: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        console.log("Degrade in progress");
                                        vm.degradeUserPlan(); // apply degrade changes
                                    } else {
                                        console.log("No changes needed");
                                        $scope.$apply(function () {
                                            vm.unitsProvidedToUser = vm.currentSelectedUser.userData.unitsProvidedToUser;
                                        });
                                        // reset units to old already purchased units
                                    }
                                });
                            }
                        }
                        // free to Monthly
                        if (vm.selectedUserSelectedPlan == "Monthly" && vm.selectedUserOldPlan == "Free") {
                            console.log("Upgrade from monthly to annual. Billing cyckle will be next month first day.");
                            // Billing cycle date will be next month first day
                            if (unitsSelected > unitsAlreadyPaidFor) {
                                // More units added, Add units and update billing cycle from future
                                console.log("Pay for all units and update plan from Free to Monthly.");
                                // pay for all units except free units
                                vm.billingRequired = true;
                                vm.discountRequired = false;
                                billableUnits = vm.unitsProvidedToUser - freeUnits;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = billableUnits * vm.pricePerUnitPerMonth;
                                discount = 0;
                                vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                                vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                                totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                                vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                                taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                                vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                                vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                            }
                            else if (unitsSelected == unitsAlreadyPaidFor) {
                                console.log("Same no of units. Plan is still valid. No need for Payment");
                                vm.billingRequired = false;
                                vm.discountRequired = false;
                                billableUnits = 0;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = 0;
                                discount = 0;
                                vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                                vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                                totalAfterDiscount = 0;
                                vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                                taxTodeduct = 0;
                                vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                                vm.selectedUserPayaableAmount = 0;
                            }
                            else {
                                // units decreased save info indb so stat it can be changes in furure when plan is expired
                                console.log("Same plan plan selected and units degraded", "set information for next billing cycle.");
                                vm.billingRequired = false;
                                vm.discountRequired = false;
                                billableUnits = 0;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                estimatedCharge = 0;
                                discount = 0;
                                vm.selectedUserEstimatedAmount = 0;
                                vm.selectedUserDiscount = 0;
                                vm.selectedUserTotalWithDiscount = 0;
                                taxTodeduct = 0;
                                vm.selectedUserTaxes = 0;
                                vm.selectedUserPayaableAmount = 0;
                                swal({
                                    title: "Are you sure!",
                                    text: "Do you really want to decrease number of units for this user?",
                                    type: "warning",
                                    confirmButtonColor: '#009999',
                                    confirmButtonText: "Ok",
                                    showCancelButton: true,
                                    closeOnClickOutside: false,
                                    allowEscapeKey: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        console.log("Degrade in progress");
                                        // vm.degradeUserPlan(); // apply degrade changes
                                    } else {
                                        console.log("No changes needed");
                                        $scope.$apply(function () {
                                            vm.unitsProvidedToUser = vm.currentSelectedUser.userData.unitsProvidedToUser;
                                        });
                                        // reset units to old already purchased units
                                    }
                                });
                            }

                        }
                        // from annual to monthly
                        if (vm.selectedUserSelectedPlan == "Monthly" && vm.selectedUserOldPlan == "Annual") {
                            console.log("Change from annual subscription to monthly. Billing cycle will be next years first day.");
                            console.log("No need for Payment.");
                            console.log("Change upgrade info in db.");
                        }
                        if (vm.selectedUserSelectedPlan == "Free" && vm.selectedUserOldPlan == "Annual") {
                            vm.discountRequired = false;
                            vm.billingRequired = false;
                            swal({
                                title: "Are you sure!",
                                text: "Do you really want to Change you plan to Free Trial version?",
                                type: "warning",
                                confirmButtonColor: '#009999',
                                confirmButtonText: "Ok",
                                showCancelButton: false,
                                closeOnClickOutside: false,
                                allowEscapeKey: true
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    console.log("Change plan to free plan after period expire.");
                                } else {
                                    console.log("No changes needed");
                                    // reset units to old already purchased units
                                }
                            });
                        }
                        if (vm.selectedUserSelectedPlan == "Free" && vm.selectedUserOldPlan == "Monthly") {
                            vm.discountRequired = false;
                            vm.billingRequired = false;
                            swal({
                                title: "Are you sure!",
                                text: "Do you really want to Change you plan to Free Trial version?",
                                type: "warning",
                                confirmButtonColor: '#009999',
                                confirmButtonText: "Ok",
                                showCancelButton: false,
                                closeOnClickOutside: false,
                                allowEscapeKey: true
                            }, function (isConfirm) {
                                if (isConfirm) {
                                    console.log("Change plan to free plan after period expire.");
                                } else {
                                    console.log("No changes needed");
                                    // reset units to old already purchased units
                                }
                            });
                        }
                    }
                }   // plan change end
                else {
                    // No change in  subscription plan 
                    console.log("Same subscription plan is selected. Pay if extra units are selected. else no payment is required.");
                    // check if current plan expired
                    var oldPlanInfo = JSON.parse(vm.currentSelectedUser.userData.currentPlanInfo);
                    if (Date.parse(oldPlanInfo.end) < Date.now()) { // check plan nvalidity
                        console.log("Plan expired");
                        console.log("Pay for units selected.");
                        vm.billingRequired = true;
                        billableUnits = vm.unitsProvidedToUser - freeUnits;
                        vm.selectedbillableUnits = parseInt(billableUnits);
                        if (vm.selectedUserSelectedPlan == "Annual") {
                            vm.discountRequired = true;
                            estimatedCharge = billableUnits * vm.pricePerUnitPerMonth * 12;
                            discount = estimatedCharge * 0.1; // 10% dicount for annual plan
                            vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                            vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                            totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                            vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                            taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                            vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                            vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                        }
                        else if (vm.selectedUserSelectedPlan == "Monthly") {
                            vm.discountRequired = false;
                            estimatedCharge = billableUnits * vm.pricePerUnitPerMonth;
                            discount = 0;
                            vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                            vm.selectedUserDiscount = 0;
                            totalAfterDiscount = vm.selectedUserEstimatedAmount;
                            vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                            taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                            vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                            vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                        }
                        else {
                            estimatedCharge = 0;
                            discount = 0;
                            vm.selectedUserEstimatedAmount = 0;
                            vm.selectedUserDiscount = 0;
                            vm.selectedUserTaxes = 0;
                            vm.selectedUserTotalWithDiscount = 0;
                            vm.selectedUserPayaableAmount = 0;
                            swal({
                                title: "Warning!",
                                text: 'User cannot have more than free units allowed in free plan? Hence No payment required.',
                                type: "warning",
                                showCancelButton: true,
                            }, function (isConfirm) {
                                vm.unitsProvidedToUser = freeUnits;
                            });
                        }   // free plan extra units selected in free plan
                    }
                    else {
                        console.log("Plan is valid");
                        // check and restrict for free plan
                        if ((unitsSelected > freeUnits) && vm.selectedUserSelectedPlan == "Free") {
                            vm.billingRequired = false;
                            estimatedCharge = 0;
                            discount = 0;
                            vm.selectedUserEstimatedAmount = 0;
                            vm.selectedUserDiscount = 0;
                            vm.selectedUserTotalWithDiscount = 0;
                            vm.selectedUserTaxes = 0;
                            vm.selectedUserPayaableAmount = 0;
                            swal({
                                title: "Warning!",
                                text: 'User cannot have more than free units allowed in free plan?',
                                type: "warning",
                                showCancelButton: true,
                            }, function (isConfirm) {
                            });
                            vm.unitsProvidedToUser = freeUnits;
                        }// free plan check end
                        else {
                            if (unitsSelected > unitsAlreadyPaidFor) {
                                // More units added
                                console.log("Same plan plan selected and units added, pay for extra units");
                                // pay for only extra units
                                vm.billingRequired = true;
                                billableUnits = vm.unitsProvidedToUser - unitsAlreadyPaidFor;
                                vm.selectedbillableUnits = parseInt(billableUnits);
                                if (vm.selectedUserSelectedPlan == "Annual") {
                                    vm.discountRequired = true;
                                    estimatedCharge = billableUnits * vm.pricePerUnitPerMonth * 12;
                                    discount = estimatedCharge * 0.1; /// 10% dicount for annual plan
                                    vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                                    vm.selectedUserDiscount = parseFloat(discount.toFixed(2));
                                    totalAfterDiscount = vm.selectedUserEstimatedAmount - vm.selectedUserDiscount;
                                    vm.selectedUserTotalWithDiscount = parseFloat(totalAfterDiscount.toFixed(2));
                                    taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                                    vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                                    vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                                }
                                else if (vm.selectedUserSelectedPlan == "Monthly") {
                                    estimatedCharge = billableUnits * vm.pricePerUnitPerMonth;
                                    discount = 0;
                                    vm.selectedUserEstimatedAmount = parseFloat(estimatedCharge.toFixed(2));
                                    vm.selectedUserDiscount = 0;
                                    vm.selectedUserTotalWithDiscount = vm.selectedUserEstimatedAmount;
                                    taxTodeduct = vm.selectedUserTotalWithDiscount * vm.taxes / 100;
                                    vm.selectedUserTaxes = parseFloat(taxTodeduct.toFixed(2));
                                    vm.selectedUserPayaableAmount = vm.selectedUserTotalWithDiscount + vm.selectedUserTaxes;
                                }
                            }
                            else if (unitsSelected == unitsAlreadyPaidFor) {
                                console.log("Same no of units. No changes required.");
                                vm.billingRequired = false;
                                // openerrorsweet("No payment needed");
                            }
                            else {
                                // units decreased save info indb so stat it can be changes in furure when plan is expired
                                console.log("Same plan plan selected and units degraded", "set information for next billing cycle.");
                                vm.billingRequired = false;
                                swal({
                                    title: "Are you sure!",
                                    text: "Do you really want to decrease number of units for this user?",
                                    type: "warning",
                                    confirmButtonColor: '#009999',
                                    confirmButtonText: "Ok",
                                    showCancelButton: true,
                                    closeOnClickOutside: false,
                                    allowEscapeKey: true
                                }, function (isConfirm) {
                                    if (isConfirm) {
                                        console.log("Degrade in progress");
                                        vm.degradeUserPlan(); // apply degrade changes
                                    } else {
                                        console.log("No changes needed");
                                        $scope.$apply(function () {
                                            vm.unitsProvidedToUser = vm.currentSelectedUser.userData.unitsProvidedToUser;
                                        });
                                        // reset units to old already purchased units
                                    }
                                });
                            }
                        }
                    }
                }
            };

            vm.calculateNextCycleDate = function () {
                var currentPlan = vm.selectedUserSelectedPlan, oldPlan = vm.currentSelectedUser.userData.currentPlan, oldPlanInfo = vm.currentSelectedUser.userData.currentPlanInfo;
                var startdate = '', enddate = '';

                // check if user have a plan
                if (oldPlanInfo != '' || oldPlanInfo != undefined) {
                    if (Date.parse(oldPlanInfo.end) < Date.now()) {
                        console.log("Plan subscription is expired.");
                        // check for different plan
                        if (currentPlan != oldPlan) {
                            console.log("Diffrent Plan selected");
                            // check for expiry of old plan
                            if (Date.parse(currentPlanInfo.end) < Date.now()) {
                                console.log("Plan subscription is expired.");
                                if (currentPlan == "Free") {
                                    startdate = new moment().toDate();
                                    enddate = new moment().add(15, 'day').toDate();
                                } else if (currentPlan == "Monthly") {
                                    startdate = new moment().toDate();
                                    enddate = new moment().add(30, 'day').toDate();
                                }
                                else if (currentPlan == "Annual") {
                                    startdate = new moment().toDate();
                                    enddate = new moment().add(365, 'day').toDate();
                                } else {
                                }
                            }
                            else {
                                console.log("Plan subscription is still valid.");
                                // calculat next cycle date after current plan
                                var oldPlanEndDate = oldPlanInfo.end;
                                if (currentPlan == "Free") {
                                    startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                                    enddate = new moment(startdate).add(15, 'day').toDate();
                                } else if (currentPlan == "Monthly") {
                                    startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                                    enddate = new moment(startdate).add(30, 'day').toDate();
                                }
                                else if (currentPlan == "Annual") {
                                    startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                                    enddate = new moment(startdate).add(365, 'day').toDate();
                                } else {
                                }
                            }
                        }
                        else {
                            // same plan selected as old
                            if (Date.parse(oldPlanInfo.end) < Date.now()) {
                                console.log("Plan subscription is expired.");
                                if (currentPlan == "Free") {
                                    startdate = new moment().toDate();
                                    enddate = new moment().add(15, 'day').toDate();
                                } else if (currentPlan == "Monthly") {
                                    startdate = new moment().toDate();
                                    enddate = new moment().add(30, 'day').toDate();
                                }
                                else if (currentPlan == "Annual") {
                                    startdate = new moment().toDate();
                                    enddate = new moment().add(365, 'day').toDate();
                                } else {
                                }
                            }
                            else {
                                console.log("Plan subscription is still valid.");
                                // calculat next cycle date after current plan
                                var oldPlanEndDate = oldPlanInfo.end;
                                if (currentPlan == "Free") {
                                    startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                                    enddate = new moment(startdate).add(15, 'day').toDate();
                                } else if (currentPlan == "Monthly") {
                                    startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                                    enddate = new moment(startdate).add(30, 'day').toDate();
                                }
                                else if (currentPlan == "Annual") {
                                    startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                                    enddate = new moment(startdate).add(365, 'day').toDate();
                                } else {
                                }
                            }
                        } // end same plan else
                    } else {
                        var oldPlanEndDate = oldPlanInfo.end;
                        if (currentPlan == "Free") {
                            startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                            enddate = new moment(startdate).add(15, 'day').toDate();
                        } else if (currentPlan == "Monthly") {
                            startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                            enddate = new moment(startdate).add(30, 'day').toDate();
                        }
                        else if (currentPlan == "Annual") {
                            startdate = new moment(oldPlanEndDate).add(1, "day").toDate();
                            enddate = new moment(startdate).add(365, 'day').toDate();
                        } else {
                        }
                    }
                }
                else {
                    console.log("User have no plan subscribed.");
                    vm.selectedUserSelectedPlan = "Free";
                    vm.unitsProvidedToUser = vm.unitsFree;
                    console.log("Free plan selected, Check for expiry.")
                    if (currentPlan == "Free") {
                        startdate = new moment().toDate();
                        enddate = new moment().add(15, 'day').toDate();
                    } else if (currentPlan == "Monthly") {
                        startdate = new moment().toDate();
                        enddate = new moment().add(30, 'day').toDate();
                    }
                    else if (currentPlan == "Annual") {
                        startdate = new moment().toDate();
                        enddate = new moment().add(365, 'day').toDate();
                    } else {
                    }
                }
                vm.nextBillingCycleStartDate = startdate;
                vm.nextBillingCycleEndDate = enddate;
            }

            vm.makePayment = function () {
                if (vm.billingRequired == true) {
                    var newPlan = vm.selectedUserSelectedPlan,
                        unitsBilled = vm.selectedbillableUnits,
                        chagres = vm.selectedUserEstimatedAmount,
                        discount = vm.selectedUserDiscount,
                        tax = vm.selectedUserTaxes,
                        amount = vm.selectedUserPayaableAmount,
                        allUnitsPayedFor = vm.unitsProvidedToUser,
                        paymentMethod = '';
                    // check for payment method
                    var currentPlan = vm.selectedUserSelectedPlan, oldPlan = vm.currentSelectedUser.userData.currentPlan, oldPlanInfo = vm.currentSelectedUser.userData.currentPlanInfo;
                    // plan expired
                    if (oldPlanInfo) {
                        if (Date.parse(oldPlanInfo.end) < Date.now()) {
                            switch (parseInt(vm.paymentMethodSelected)) {
                                case 1:
                                    paymentMethod = 'Cheque';
                                    var cdate = new Date();
                                    if (vm.checqueBank.length < 3 || vm.checqueNo.length < 3 || vm.paymentComments.length < 3) {
                                        vm.openerrorsweet("Please Fill all necessary Fields.");
                                    } else {
                                        var newAllowedUnits = vm.unitsProvidedToUser;
                                        var upgradeOrRenew = JSON.stringify({
                                            start: vm.nextBillingCycleStartDate,
                                            end: vm.nextBillingCycleEndDate,
                                            units: unitsBilled,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            plan: vm.selectedUserSelectedPlan
                                        });
                                        vm.selectedUserBillingHistory.push({
                                            date: vm.recieved,
                                            amount: '$' + amount,
                                            tax: '$' + tax,
                                            id: Date.parse(cdate),
                                            plan: newPlan,
                                            payMethod: paymentMethod,
                                            firstname: vm.currentSelectedUser.userData.firstname,
                                            lastname: vm.currentSelectedUser.userData.lastname,
                                            email: vm.currentSelectedUser.userData.email,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            unitsChange: unitsBilled,
                                            stripeResponse: null,
                                            status: "Success",
                                            comments: vm.paymentComments
                                        });
                                        var billinginfo = vm.selectedUserBillingHistory;
                                        // update database 
                                        var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                            currentPlan: vm.selectedUserSelectedPlan,
                                            unitsProvidedToUser: vm.unitsProvidedToUser,
                                            unitsAllowed: vm.unitsProvidedToUser,
                                            billingHistory: billinginfo,
                                            nextBillingDate: vm.nextBillingCycleStartDate,
                                            newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                            currentPlanInfo: upgradeOrRenew
                                        }).then(function () {
                                            // reset form
                                            swal({
                                                title: "Success!",
                                                text: "Transaction completed successfully.",
                                                type: "success",
                                                confirmButtonColor: '#009999',
                                                confirmButtonText: "Ok"
                                            }, function (isConfirm) {
                                                if (isConfirm) {
                                                    $state.reload();
                                                }
                                            });
                                        });
                                    }
                                    break;
                                case 2: paymentMethod = 'Online Transfer';
                                    if (vm.bankOnlineName.length < 3 || vm.bankOnlineAccountno.length < 3 || vm.paymentComments.length < 3) {
                                        vm.openerrorsweet("Please Fill all necessary Fields.");
                                    } else {
                                        var cdate = new Date();
                                        var upgradeOrRenew = JSON.stringify({
                                            start: vm.nextBillingCycleStartDate,
                                            end: vm.nextBillingCycleEndDate,
                                            units: unitsBilled,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            plan: vm.selectedUserSelectedPlan
                                        });
                                        vm.selectedUserBillingHistory.push({
                                            date: vm.recieved,
                                            amount: '$' + amount,
                                            tax: '$' + tax,
                                            id: Date.parse(cdate),
                                            plan: newPlan,
                                            payMethod: paymentMethod,
                                            firstname: vm.currentSelectedUser.userData.firstname,
                                            lastname: vm.currentSelectedUser.userData.lastname,
                                            email: vm.currentSelectedUser.userData.email,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            unitsChange: unitsBilled,
                                            stripeResponse: null,
                                            status: "Success",
                                            comments: vm.paymentComments
                                        });
                                        // update database 
                                        var billinginfo = vm.selectedUserBillingHistory;
                                        var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                            currentPlan: vm.selectedUserSelectedPlan,
                                            unitsProvidedToUser: vm.unitsProvidedToUser,
                                            unitsAllowed: vm.unitsProvidedToUser,
                                            billingHistory: billinginfo,
                                            nextBillingDate: vm.nextBillingCycleStartDate,
                                            newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                            currentPlanInfo: upgradeOrRenew
                                        }).then(function () {
                                            swal({
                                                title: "Success!",
                                                text: "Transaction completed successfully.",
                                                type: "success",
                                                confirmButtonColor: '#009999',
                                                confirmButtonText: "Ok"
                                            }, function (isConfirm) {
                                                if (isConfirm) {
                                                    $state.reload();
                                                }
                                            });
                                        });
                                    }
                                    break;
                                case 3: paymentMethod = 'Bank Draft';
                                    if (vm.bankDraftName.length < 3 || vm.bankDraftNo.length < 3 || vm.paymentComments.length < 3) {
                                        vm.openerrorsweet("Please Fill all necessary Fields.");
                                    }
                                    var cdate = new Date();
                                    var newAllowedUnits = vm.unitsProvidedToUser;
                                    var upgradeOrRenew = JSON.stringify({
                                        start: vm.nextBillingCycleStartDate,
                                        end: vm.nextBillingCycleEndDate,
                                        units: unitsBilled,
                                        unitsTotal: vm.unitsProvidedToUser,
                                        plan: vm.selectedUserSelectedPlan
                                    });
                                    vm.selectedUserBillingHistory.push({
                                        date: vm.recieved,
                                        amount: '$' + amount,
                                        tax: '$' + tax,
                                        id: Date.parse(cdate),
                                        plan: newPlan,
                                        payMethod: paymentMethod,
                                        firstname: vm.currentSelectedUser.userData.firstname,
                                        lastname: vm.currentSelectedUser.userData.lastname,
                                        email: vm.currentSelectedUser.userData.email,
                                        unitsTotal: vm.unitsProvidedToUser,
                                        unitsChange: unitsBilled,
                                        stripeResponse: null,
                                        status: "Success",
                                        comments: vm.paymentComments
                                    });
                                    // units: vm.selectedbillableUnits,
                                    // update database 
                                    var billinginfo = vm.selectedUserBillingHistory;
                                    var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                        currentPlan: vm.selectedUserSelectedPlan,
                                        unitsProvidedToUser: vm.unitsProvidedToUser,
                                        unitsAllowed: vm.unitsProvidedToUser,
                                        billingHistory: billinginfo,
                                        nextBillingDate: vm.nextBillingCycleStartDate,
                                        newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                        currentPlanInfo: upgradeOrRenew
                                    }).then(function () {
                                        // reset form
                                        swal({
                                            title: "Success!",
                                            text: "Transaction completed successfully.",
                                            type: "success",
                                            confirmButtonColor: '#009999',
                                            confirmButtonText: "Ok"
                                        }, function (isConfirm) {
                                            if (isConfirm) {
                                                $state.reload();
                                            }
                                        });
                                    });
                                    break;
                                case 4: paymentMethod = 'Credit/Debit Card';
                                    if (Stripe.card.validateCardNumber(vm.card.cardnumber) && Stripe.card.validateExpiry(vm.card.expiryMonth, vm.card.expiryYear) && Stripe.card.validateCVC(vm.card.cvc))
                                        var upgradeOrRenew = JSON.stringify({
                                            start: vm.nextBillingCycleStartDate,
                                            end: vm.nextBillingCycleEndDate,
                                            units: unitsBilled,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            plan: vm.selectedUserSelectedPlan
                                        });
                                    var req = {
                                        method: 'POST',
                                        // url: 'http://localhost:1337/api/v1/stipecharge',
                                        url: config.sailsBaseUrl + 'stipecharge',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Access-Control-Allow-Origin': '*',
                                            "Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
                                        },
                                        data: {
                                            user: vm.selectedUser,
                                            amount: amount,
                                            desciption: 'Rental Charges from ' + vm.currentSelectedUser.userData.email,
                                            cardno: vm.card.cardnumber,
                                            expiryMonth: vm.card.expiryMonth,
                                            expiryYear: vm.card.expiryYear,
                                            cvc: vm.card.cvc
                                        }
                                    };
                                    $http(req).then(function successCallback(response) {
                                        console.log("Transaction completed successfully. Response: ", response);
                                        // update billing info in database
                                        if (response.data.err) {
                                            swal({
                                                title: "Error!",
                                                text: response.data.err.message,
                                                type: "error",
                                                confirmButtonColor: '#009999',
                                                confirmButtonText: "Ok",
                                                showCancelButton: false,
                                                closeOnClickOutside: true,
                                                allowEscapeKey: true
                                            }, function (isConfirm) {
                                            });
                                        }
                                        if (response.data.charge) {
                                            var charge = response.data.charge;
                                            console.log(charge);
                                            var cdate = new Date();
                                            var upgradeOrRenew = JSON.stringify({
                                                start: vm.nextBillingCycleStartDate,
                                                end: vm.nextBillingCycleEndDate,
                                                units: unitsBilled,
                                                unitsTotal: vm.unitsProvidedToUser,
                                                plan: vm.selectedUserSelectedPlan
                                            });
                                            vm.selectedUserBillingHistory.push({
                                                date: vm.recieved,
                                                amount: '$' + amount,
                                                tax: '$' + tax,
                                                id: Date.parse(cdate),
                                                plan: newPlan,
                                                payMethod: paymentMethod,
                                                firstname: vm.currentSelectedUser.userData.firstname,
                                                lastname: vm.currentSelectedUser.userData.lastname,
                                                email: vm.currentSelectedUser.userData.email,
                                                unitsTotal: vm.unitsProvidedToUser,
                                                unitsChange: unitsBilled,
                                                status: "Success",
                                                comments: vm.paymentComments,
                                                stripeResponse: JSON.stringify(charge)
                                            });

                                            // update database 
                                            var billinginfo = vm.selectedUserBillingHistory;
                                            var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                                currentPlan: vm.selectedUserSelectedPlan,
                                                unitsProvidedToUser: vm.unitsProvidedToUser,
                                                unitsAllowed: vm.unitsProvidedToUser,
                                                billingHistory: billinginfo,
                                                nextBillingDate: vm.nextBillingCycleStartDate,
                                                newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                                currentPlanInfo: upgradeOrRenew
                                            }).then(function () {
                                                // reset form
                                                swal({
                                                    title: "Success!",
                                                    text: "Transaction completed successfully.",
                                                    type: "success",
                                                    confirmButtonColor: '#009999',
                                                    confirmButtonText: "Ok"
                                                }, function (isConfirm) {
                                                    if (isConfirm) {
                                                        $state.reload();
                                                    }
                                                });
                                            });
                                        }
                                    });
                                    break;
                                default: vm.openerrorsweet("Please select a payment method. And Fill all necessary fields.");
                                    break;
                            }
                        } else {
                            // plan valid update units
                            // console.log("Copy above switch");
                            switch (parseInt(vm.paymentMethodSelected)) {
                                case 1:
                                    paymentMethod = 'Cheque';
                                    var cdate = new Date();
                                    if (vm.checqueBank.length < 3 || vm.checqueNo.length < 3 || vm.paymentComments.length < 3) {
                                        vm.openerrorsweet("Please Fill all necessary Fields.");
                                    } else {
                                        var newAllowedUnits = vm.unitsProvidedToUser;
                                        var upgradeOrRenew = JSON.stringify({
                                            start: vm.nextBillingCycleStartDate,
                                            end: vm.nextBillingCycleEndDate,
                                            units: unitsBilled,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            plan: vm.selectedUserSelectedPlan
                                        });
                                        vm.selectedUserBillingHistory.push({
                                            date: vm.recieved,
                                            amount: '$' + amount,
                                            tax: '$' + tax,
                                            id: Date.parse(cdate),
                                            plan: newPlan,
                                            payMethod: paymentMethod,
                                            firstname: vm.currentSelectedUser.userData.firstname,
                                            lastname: vm.currentSelectedUser.userData.lastname,
                                            email: vm.currentSelectedUser.userData.email,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            unitsChange: unitsBilled,
                                            stripeResponse: null,
                                            status: "Success",
                                            comments: vm.paymentComments
                                        });
                                        var billinginfo = vm.selectedUserBillingHistory;
                                        // update database 
                                        var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                            currentPlan: vm.selectedUserSelectedPlan,
                                            unitsProvidedToUser: vm.unitsProvidedToUser,
                                            unitsAllowed: vm.unitsProvidedToUser,
                                            billingHistory: billinginfo,
                                            nextBillingDate: vm.nextBillingCycleStartDate,
                                            newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                            currentPlanInfo: upgradeOrRenew
                                        }).then(function () {
                                            // reset form
                                            swal({
                                                title: "Success!",
                                                text: "Transaction completed successfully.",
                                                type: "success",
                                                confirmButtonColor: '#009999',
                                                confirmButtonText: "Ok"
                                            }, function (isConfirm) {
                                                if (isConfirm) {
                                                    $state.reload();
                                                }
                                            });
                                        });
                                    }
                                    break;
                                case 2: paymentMethod = 'Online Transfer';
                                    if (vm.bankOnlineName.length < 3 || vm.bankOnlineAccountno.length < 3 || vm.paymentComments.length < 3) {
                                        vm.openerrorsweet("Please Fill all necessary Fields.");
                                    } else {
                                        var cdate = new Date();
                                        var upgradeOrRenew = JSON.stringify({
                                            start: vm.nextBillingCycleStartDate,
                                            end: vm.nextBillingCycleEndDate,
                                            units: unitsBilled,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            plan: vm.selectedUserSelectedPlan
                                        });
                                        vm.selectedUserBillingHistory.push({
                                            date: vm.recieved,
                                            amount: '$' + amount,
                                            tax: '$' + tax,
                                            id: Date.parse(cdate),
                                            plan: newPlan,
                                            payMethod: paymentMethod,
                                            firstname: vm.currentSelectedUser.userData.firstname,
                                            lastname: vm.currentSelectedUser.userData.lastname,
                                            email: vm.currentSelectedUser.userData.email,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            unitsChange: unitsBilled,
                                            stripeResponse: null,
                                            status: "Success",
                                            comments: vm.paymentComments
                                        });
                                        // update database 
                                        var billinginfo = vm.selectedUserBillingHistory;
                                        var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                            currentPlan: vm.selectedUserSelectedPlan,
                                            unitsProvidedToUser: vm.unitsProvidedToUser,
                                            unitsAllowed: vm.unitsProvidedToUser,
                                            billingHistory: billinginfo,
                                            nextBillingDate: vm.nextBillingCycleStartDate,
                                            newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                            currentPlanInfo: upgradeOrRenew
                                        }).then(function () {
                                            swal({
                                                title: "Success!",
                                                text: "Transaction completed successfully.",
                                                type: "success",
                                                confirmButtonColor: '#009999',
                                                confirmButtonText: "Ok"
                                            }, function (isConfirm) {
                                                if (isConfirm) {
                                                    $state.reload();
                                                }
                                            });
                                        });
                                    }
                                    break;
                                case 3: paymentMethod = 'Bank Draft';
                                    if (vm.bankDraftName.length < 3 || vm.bankDraftNo.length < 3 || vm.paymentComments.length < 3) {
                                        vm.openerrorsweet("Please Fill all necessary Fields.");
                                    }
                                    var cdate = new Date();
                                    var newAllowedUnits = vm.unitsProvidedToUser;
                                    var upgradeOrRenew = JSON.stringify({
                                        start: vm.nextBillingCycleStartDate,
                                        end: vm.nextBillingCycleEndDate,
                                        units: unitsBilled,
                                        unitsTotal: vm.unitsProvidedToUser,
                                        plan: vm.selectedUserSelectedPlan
                                    });
                                    vm.selectedUserBillingHistory.push({
                                        date: vm.recieved,
                                        amount: '$' + amount,
                                        tax: '$' + tax,
                                        id: Date.parse(cdate),
                                        plan: newPlan,
                                        payMethod: paymentMethod,
                                        firstname: vm.currentSelectedUser.userData.firstname,
                                        lastname: vm.currentSelectedUser.userData.lastname,
                                        email: vm.currentSelectedUser.userData.email,
                                        unitsTotal: vm.unitsProvidedToUser,
                                        unitsChange: unitsBilled,
                                        stripeResponse: null,
                                        status: "Success",
                                        comments: vm.paymentComments
                                    });
                                    // units: vm.selectedbillableUnits,
                                    // update database 
                                    var billinginfo = vm.selectedUserBillingHistory;
                                    var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                        currentPlan: vm.selectedUserSelectedPlan,
                                        unitsProvidedToUser: vm.unitsProvidedToUser,
                                        unitsAllowed: vm.unitsProvidedToUser,
                                        billingHistory: billinginfo,
                                        nextBillingDate: vm.nextBillingCycleStartDate,
                                        newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                        currentPlanInfo: upgradeOrRenew
                                    }).then(function () {
                                        // reset form
                                        swal({
                                            title: "Success!",
                                            text: "Transaction completed successfully.",
                                            type: "success",
                                            confirmButtonColor: '#009999',
                                            confirmButtonText: "Ok"
                                        }, function (isConfirm) {
                                            if (isConfirm) {
                                                $state.reload();
                                            }
                                        });
                                    });
                                    break;
                                case 4: paymentMethod = 'Credit/Debit Card';
                                    if (Stripe.card.validateCardNumber(vm.card.cardnumber) && Stripe.card.validateExpiry(vm.card.expiryMonth, vm.card.expiryYear) && Stripe.card.validateCVC(vm.card.cvc))
                                        var upgradeOrRenew = JSON.stringify({
                                            start: vm.nextBillingCycleStartDate,
                                            end: vm.nextBillingCycleEndDate,
                                            units: unitsBilled,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            plan: vm.selectedUserSelectedPlan
                                        });
                                    var req = {
                                        method: 'POST',
                                        url: 'http://localhost:1337/api/v1/stipecharge',
                                        // url: config.sailsBaseUrl + 'email/sendemail',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Access-Control-Allow-Origin': '*',
                                            "Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
                                        },
                                        data: {
                                            user: vm.selectedUser,
                                            amount: amount,
                                            desciption: 'Rental Charges from ' + vm.currentSelectedUser.userData.email,
                                            cardno: vm.card.cardnumber,
                                            expiryMonth: vm.card.expiryMonth,
                                            expiryYear: vm.card.expiryYear,
                                            cvc: vm.card.cvc
                                        }
                                    };
                                    $http(req).then(function successCallback(response) {
                                        console.log("Transaction completed successfully. Response: ", response);
                                        // update billing info in database
                                        if (response.data.err) {
                                            swal({
                                                title: "Error!",
                                                text: response.data.err.message,
                                                type: "error",
                                                confirmButtonColor: '#009999',
                                                confirmButtonText: "Ok",
                                                showCancelButton: false,
                                                closeOnClickOutside: true,
                                                allowEscapeKey: true
                                            }, function (isConfirm) {
                                            });
                                        }
                                        if (response.data.charge) {
                                            var charge = response.data.charge;
                                            console.log(charge);
                                            var cdate = new Date();
                                            var upgradeOrRenew = JSON.stringify({
                                                start: vm.nextBillingCycleStartDate,
                                                end: vm.nextBillingCycleEndDate,
                                                units: unitsBilled,
                                                unitsTotal: vm.unitsProvidedToUser,
                                                plan: vm.selectedUserSelectedPlan
                                            });
                                            vm.selectedUserBillingHistory.push({
                                                date: vm.recieved,
                                                amount: '$' + amount,
                                                tax: '$' + tax,
                                                id: Date.parse(cdate),
                                                plan: newPlan,
                                                payMethod: paymentMethod,
                                                firstname: vm.currentSelectedUser.userData.firstname,
                                                lastname: vm.currentSelectedUser.userData.lastname,
                                                email: vm.currentSelectedUser.userData.email,
                                                unitsTotal: vm.unitsProvidedToUser,
                                                unitsChange: unitsBilled,
                                                status: "Success",
                                                comments: vm.paymentComments,
                                                stripeResponse: JSON.stringify(charge)
                                            });

                                            // update database 
                                            var billinginfo = vm.selectedUserBillingHistory;
                                            var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                                currentPlan: vm.selectedUserSelectedPlan,
                                                unitsProvidedToUser: vm.unitsProvidedToUser,
                                                unitsAllowed: vm.unitsProvidedToUser,
                                                billingHistory: billinginfo,
                                                nextBillingDate: vm.nextBillingCycleStartDate,
                                                newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                                currentPlanInfo: upgradeOrRenew
                                            }).then(function () {
                                                // reset form
                                                swal({
                                                    title: "Success!",
                                                    text: "Transaction completed successfully.",
                                                    type: "success",
                                                    confirmButtonColor: '#009999',
                                                    confirmButtonText: "Ok"
                                                }, function (isConfirm) {
                                                    if (isConfirm) {
                                                        $state.reload();
                                                    }
                                                });
                                            });
                                        }
                                    });
                                    break;
                                default: vm.openerrorsweet("Please select a payment method. And Fill all necessary fields.");
                                    break;
                            }
                            // update units and dates for current plan
                        }
                    } else {
                        // pay for first plan
                        // console.log("Pay for first plan");
                        switch (parseInt(vm.paymentMethodSelected)) {
                            case 1:
                                paymentMethod = 'Cheque';
                                var cdate = new Date();
                                if (vm.checqueBank.length < 3 || vm.checqueNo.length < 3 || vm.paymentComments.length < 3) {
                                    vm.openerrorsweet("Please Fill all necessary Fields.");
                                } else {
                                    var newAllowedUnits = vm.unitsProvidedToUser;
                                    var upgradeOrRenew = JSON.stringify({
                                        start: vm.nextBillingCycleStartDate,
                                        end: vm.nextBillingCycleEndDate,
                                        units: unitsBilled,
                                        unitsTotal: vm.unitsProvidedToUser,
                                        plan: vm.selectedUserSelectedPlan
                                    });
                                    vm.selectedUserBillingHistory.push({
                                        date: vm.recieved,
                                        amount: '$' + amount,
                                        tax: '$' + tax,
                                        id: Date.parse(cdate),
                                        plan: newPlan,
                                        payMethod: paymentMethod,
                                        firstname: vm.currentSelectedUser.userData.firstname,
                                        lastname: vm.currentSelectedUser.userData.lastname,
                                        email: vm.currentSelectedUser.userData.email,
                                        unitsTotal: vm.unitsProvidedToUser,
                                        unitsChange: unitsBilled,
                                        stripeResponse: null,
                                        status: "Success",
                                        comments: vm.paymentComments
                                    });
                                    var billinginfo = vm.selectedUserBillingHistory;
                                    // update database 
                                    var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                        currentPlan: vm.selectedUserSelectedPlan,
                                        unitsProvidedToUser: vm.unitsProvidedToUser,
                                        unitsAllowed: vm.unitsProvidedToUser,
                                        billingHistory: billinginfo,
                                        nextBillingDate: vm.nextBillingCycleStartDate,
                                        newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                        currentPlanInfo: upgradeOrRenew
                                    }).then(function () {
                                        // reset form
                                        swal({
                                            title: "Success!",
                                            text: "Transaction completed successfully.",
                                            type: "success",
                                            confirmButtonColor: '#009999',
                                            confirmButtonText: "Ok"
                                        }, function (isConfirm) {
                                            if (isConfirm) {
                                                $state.reload();
                                            }
                                        });
                                    });
                                }
                                break;
                            case 2: paymentMethod = 'Online Transfer';
                                if (vm.bankOnlineName.length < 3 || vm.bankOnlineAccountno.length < 3 || vm.paymentComments.length < 3) {
                                    vm.openerrorsweet("Please Fill all necessary Fields.");
                                } else {
                                    var cdate = new Date();
                                    var upgradeOrRenew = JSON.stringify({
                                        start: vm.nextBillingCycleStartDate,
                                        end: vm.nextBillingCycleEndDate,
                                        units: unitsBilled,
                                        unitsTotal: vm.unitsProvidedToUser,
                                        plan: vm.selectedUserSelectedPlan
                                    });
                                    vm.selectedUserBillingHistory.push({
                                        date: vm.recieved,
                                        amount: '$' + amount,
                                        tax: '$' + tax,
                                        id: Date.parse(cdate),
                                        plan: newPlan,
                                        payMethod: paymentMethod,
                                        firstname: vm.currentSelectedUser.userData.firstname,
                                        lastname: vm.currentSelectedUser.userData.lastname,
                                        email: vm.currentSelectedUser.userData.email,
                                        unitsTotal: vm.unitsProvidedToUser,
                                        unitsChange: unitsBilled,
                                        stripeResponse: null,
                                        status: "Success",
                                        comments: vm.paymentComments
                                    });
                                    // update database 
                                    var billinginfo = vm.selectedUserBillingHistory;
                                    var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                        currentPlan: vm.selectedUserSelectedPlan,
                                        unitsProvidedToUser: vm.unitsProvidedToUser,
                                        unitsAllowed: vm.unitsProvidedToUser,
                                        billingHistory: billinginfo,
                                        nextBillingDate: vm.nextBillingCycleStartDate,
                                        newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                        currentPlanInfo: upgradeOrRenew
                                    }).then(function () {
                                        swal({
                                            title: "Success!",
                                            text: "Transaction completed successfully.",
                                            type: "success",
                                            confirmButtonColor: '#009999',
                                            confirmButtonText: "Ok"
                                        }, function (isConfirm) {
                                            if (isConfirm) {
                                                $state.reload();
                                            }
                                        });
                                    });
                                }
                                break;
                            case 3: paymentMethod = 'Bank Draft';
                                if (vm.bankDraftName.length < 3 || vm.bankDraftNo.length < 3 || vm.paymentComments.length < 3) {
                                    vm.openerrorsweet("Please Fill all necessary Fields.");
                                }
                                var cdate = new Date();
                                var newAllowedUnits = vm.unitsProvidedToUser;
                                var upgradeOrRenew = JSON.stringify({
                                    start: vm.nextBillingCycleStartDate,
                                    end: vm.nextBillingCycleEndDate,
                                    units: unitsBilled,
                                    unitsTotal: vm.unitsProvidedToUser,
                                    plan: vm.selectedUserSelectedPlan
                                });
                                vm.selectedUserBillingHistory.push({
                                    date: vm.recieved,
                                    amount: '$' + amount,
                                    tax: '$' + tax,
                                    id: Date.parse(cdate),
                                    plan: newPlan,
                                    payMethod: paymentMethod,
                                    firstname: vm.currentSelectedUser.userData.firstname,
                                    lastname: vm.currentSelectedUser.userData.lastname,
                                    email: vm.currentSelectedUser.userData.email,
                                    unitsTotal: vm.unitsProvidedToUser,
                                    unitsChange: unitsBilled,
                                    stripeResponse: null,
                                    status: "Success",
                                    comments: vm.paymentComments
                                });
                                // units: vm.selectedbillableUnits,
                                // update database 
                                var billinginfo = vm.selectedUserBillingHistory;
                                var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                    currentPlan: vm.selectedUserSelectedPlan,
                                    unitsProvidedToUser: vm.unitsProvidedToUser,
                                    unitsAllowed: vm.unitsProvidedToUser,
                                    billingHistory: billinginfo,
                                    nextBillingDate: vm.nextBillingCycleStartDate,
                                    newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                    currentPlanInfo: upgradeOrRenew
                                }).then(function () {
                                    // reset form
                                    swal({
                                        title: "Success!",
                                        text: "Transaction completed successfully.",
                                        type: "success",
                                        confirmButtonColor: '#009999',
                                        confirmButtonText: "Ok"
                                    }, function (isConfirm) {
                                        if (isConfirm) {
                                            $state.reload();
                                        }
                                    });
                                });
                                break;
                            case 4: paymentMethod = 'Credit/Debit Card';
                                if (Stripe.card.validateCardNumber(vm.card.cardnumber) && Stripe.card.validateExpiry(vm.card.expiryMonth, vm.card.expiryYear) && Stripe.card.validateCVC(vm.card.cvc))

                                    var req = {
                                        method: 'POST',
                                        url: 'http://localhost:1337/api/v1/stipecharge',
                                        // url: config.sailsBaseUrl + 'email/sendemail',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Access-Control-Allow-Origin': '*',
                                            "Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
                                        },
                                        data: {
                                            user: vm.selectedUser,
                                            amount: amount,
                                            desciption: 'Rental Charges from ' + vm.currentSelectedUser.userData.email,
                                            cardno: vm.card.cardnumber,
                                            expiryMonth: vm.card.expiryMonth,
                                            expiryYear: vm.card.expiryYear,
                                            cvc: vm.card.cvc
                                        }
                                    };
                                $http(req).then(function successCallback(response) {
                                    console.log("Transaction completed successfully. Response: ", response);
                                    // update billing info in database
                                    if (response.data.err) {
                                        swal({
                                            title: "Error!",
                                            text: response.data.err.message,
                                            type: "error",
                                            confirmButtonColor: '#009999',
                                            confirmButtonText: "Ok",
                                            showCancelButton: false,
                                            closeOnClickOutside: true,
                                            allowEscapeKey: true
                                        }, function (isConfirm) {
                                        });
                                    }
                                    if (response.data.charge) {
                                        var charge = response.data.charge;
                                        console.log(charge);
                                        var cdate = new Date();
                                        var upgradeOrRenew = JSON.stringify({
                                            start: vm.nextBillingCycleStartDate,
                                            end: vm.nextBillingCycleEndDate,
                                            units: unitsBilled,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            plan: vm.selectedUserSelectedPlan
                                        });
                                        vm.selectedUserBillingHistory.push({
                                            date: vm.recieved,
                                            amount: '$' + amount,
                                            tax: '$' + tax,
                                            id: Date.parse(cdate),
                                            plan: newPlan,
                                            payMethod: paymentMethod,
                                            firstname: vm.currentSelectedUser.userData.firstname,
                                            lastname: vm.currentSelectedUser.userData.lastname,
                                            email: vm.currentSelectedUser.userData.email,
                                            unitsTotal: vm.unitsProvidedToUser,
                                            unitsChange: unitsBilled,
                                            status: "Success",
                                            comments: vm.paymentComments,
                                            stripeResponse: JSON.stringify(charge)
                                        });
                                        // update database 
                                        var billinginfo = vm.selectedUserBillingHistory;
                                        var updateUser = firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                                            currentPlan: vm.selectedUserSelectedPlan,
                                            unitsProvidedToUser: vm.unitsProvidedToUser,
                                            unitsAllowed: vm.unitsProvidedToUser,
                                            billingHistory: vm.selectedUserBillingHistory,
                                            nextBillingDate: vm.nextBillingCycleStartDate,
                                            newPaymentApplyFrom: vm.nextBillingCycleStartDate,
                                            currentPlanInfo: upgradeOrRenew
                                        }).then(function () {
                                            // reset form
                                            swal({
                                                title: "Success!",
                                                text: "Transaction completed successfully.",
                                                type: "success",
                                                confirmButtonColor: '#009999',
                                                confirmButtonText: "Ok"
                                            }, function (isConfirm) {
                                                if (isConfirm) {
                                                    $state.reload();
                                                }
                                            });
                                        });
                                    }
                                });
                                break;
                            default: vm.openerrorsweet("Please select a payment method. And Fill all necessary fields.");
                                break;
                        }
                    }
                } else {
                    if (vm.currentSelectedUser == '' || vm.currentSelectedUser == undefined) {
                        vm.openerrorsweet("Please select a user first.");
                    } else {
                        vm.openerrorsweet("No Need for Payment.");
                    }
                }
            }


            vm.upgradeUserPlan = function () {
                // when user have vlalid subscription then save upgrade info and check for it on login.
                // if found then update plan info on basis of info change startDate, endDate, plan name and units as per plan 
                var increasedUnits = vm.unitsProvidedToUser - vm.currentSelectedUser.userData.unitsProvidedToUser;
                var oldPlan = vm.currentSelectedUser.userData.currentPlan;
                var upgradeInfo = JSON.stringify({
                    startDate: vm.nextBillingCycleStartDate,
                    endDate: vm.nextBillingCycleEndDate,
                    units: increasedUnits,
                    plan: vm.selectedUserSelectedPlan
                });
                console.log("degrade info", JSON.parse(upgradeInfo));
                // firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                //     upgradeInfo: upgradeInfo
                // }).then(function () {
                //     vm.opensuccesssweet("Plan for " + vm.currentSelectedUser.userData.firstname + " " + vm.currentSelectedUser.userData.lastname + " has been updated. Settings will be updated from " + vm.nextBillingCycleStartDate);
                // }, function (error) {
                //     vm.openerrorsweet("May Be your session is expire please login again.");
                //     return false;
                // });
            }
            vm.degradeUserPlan = function () {
                var decreasedUnits = vm.currentSelectedUser.userData.unitsProvidedToUser - vm.unitsProvidedToUser;
                var oldPlan = vm.currentSelectedUser.userData.currentPlan;
                // updateplan in database 
                var degradeInfo = JSON.stringify({
                    startDate: vm.nextBillingCycleStartDate,
                    endDate: vm.nextBillingCycleEndDate,
                    units: decreasedUnits,
                    plan: vm.selectedUserSelectedPlan
                });
                console.log("degrade info", JSON.parse(degradeInfo));
                firebase.database().ref('users/' + vm.currentSelectedUser._id + '/').update({
                    degradeInfo: degradeInfo
                }).then(function () {
                    vm.opensuccesssweet("Plan for " + vm.currentSelectedUser.userData.firstname + " " + vm.currentSelectedUser.userData.lastname + " has been degraded.! Settings will b eupdated from " + vm.nextBillingCycleStartDate);
                }, function (error) {
                    vm.openerrorsweet("May Be your session is expire please login again.");
                    return false;
                });
            }




            // clear all landlord users billing history
            // var resetDB = firebase.database().ref('users/').once("value", function (snapshot) {
            //     var user = snapshot;
            //     snapshot.forEach(function (childSnapshot) {
            //         firebase.database().ref('users/' + childSnapshot.key + '/').update({
            //             currentPlanInfo: '',
            //             unitsAllowed: '',
            //             unitsAlreadyAdded: '',
            //             lastPurchasedPlan: '',
            //             lastRenewalDate: '',
            //             currentPlan: '',
            //             freeUnitsAlloted: '',
            //             registrationDate: '',
            //             upgradeInfo: '',
            //             degradeInfo: '',
            //         });
            //     });
            //     console.log("db snapshot", snapshot.val());
            // });

            // firebase.database().ref('users/').once('value', function (snap) {
            //     console.log("db", snap.val())
            // });

        }]);
