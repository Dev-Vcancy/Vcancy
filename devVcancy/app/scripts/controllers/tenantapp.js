'use strict';

//=================================================
// Tenant Applications
//=================================================

vcancyApp
	.controller('tenantappCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'emailSendingService', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, emailSendingService) {

		var vm = this;
		var tenantID = localStorage.getItem('userID');
		var userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {};
		var userEmail = localStorage.getItem('userEmail');
		vm.loader = 1;
		vm.submittedappsavail = 0;
		$scope.reverseSort = false;
		vm.submitappsdata = [];

		firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
			// console.log(snapshot.val())
			$scope.$apply(function () {
				if (snapshot.val() != null) {
					vm.pendingappsavail = 0;

					console.log($rootScope.$previousState.name);
					if ($rootScope.$previousState.name == "rentalform") {
						$state.reload();
					}
					//to map the object to array
					console.log(snapshot.val());
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

							/*, {
							total: vm.tabledata.length, // length of data
							getData: function($defer, params) {
								// console.log(params);
								// use build-in angular filter
								var orderedData = params.sorting() ? $filter('orderBy')(vm.tabledata, params.orderBy()) : vm.tabledata;
					
								$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
							}*/
							// dataset: vm.tabledata
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


		console.log($rootScope.$previousState.name);
		if ($rootScope.$previousState.name == "rentalform") {
			$state.reload();
		}

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


	}])