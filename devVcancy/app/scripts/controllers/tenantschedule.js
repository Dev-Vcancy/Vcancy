'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
	.controller('tenantscheduleCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'emailSendingService', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, emailSendingService) {

		var vm = this;
		vm.showCal = false;
		var tenantID = localStorage.getItem('userID');
		vm.loader = 1;

		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function (snapshot) {
			// console.log(snapshot.val())
			$scope.$apply(function () {
				if (snapshot.val() !== null) {
					vm.calendardata = $.map(snapshot.val(), function (value, index) {
						if (value.schedulestatus == "confirmed") {
							var units = '';
							if (value.unitID === ' ' || !value.unitID) {
								units = '';
							} else {
								units = value.unitID + " - ";
							}
							return [{ scheduleID: index, className: 'bgm-cyan', title: units + value.address, start: new Date(value.dateslot) }];
						}
					});

					// vm.calendardata = [{scheduleID:"-KvaDdFDac3A_apLY-ce",className:"bgm-cyan",title:"Active kl",start:"24-September-2017"}]
					$scope.calendardata = vm.calendardata;

					console.log($scope.calendardata);
					vm.schedulesavail = 0;

					//to map the object to array
					vm.tabledata = $.map(snapshot.val(), function (value, index) {
						if (value.schedulestatus !== "removed" && value.schedulestatus !== "pending") {
							vm.schedulesavail = 1;
							var units = '';
							if (value.unitID === ' ' || !value.unitID) {
								units = '';
							} else {
								units = value.unitID + " - ";
							}
							var dateSlot = value.dateSlot;
							var timeRange = value.timeRange;
							if (value.schedulestatus == "pending" && value.proposeNewTime) {
								dateSlot = value.proposeNewTime.date1 || value.proposeNewTime.date2 || value.proposeNewTime.date3;
								timeRange = (value.proposeNewTime.fromTime1 + '-' + value.proposeNewTime.toTime1) || (value.proposeNewTime.fromTime2 + '-' + value.proposeNewTime.toTime2) || (value.proposeNewTime.fromTime3 + '-' + value.proposeNewTime.toTime3)
							}
							return [{ scheduleID: index, address: units + value.address, dateslot: moment(dateSlot, 'MM/DD/YYYY').format('DD MMMM YYYY'), timerange: timeRange, schedulestatus: value.schedulestatus }];
						}
					});

					vm.extracols = [
						{ field: "", title: "", show: true }
					];

				} else {
					vm.tabledata = [{ scheduleID: '', address: '', dateslot: '', timerange: '', schedulestatus: '' }];
					vm.calendardata = [{ scheduleID: '', className: 'bgm-cyan', title: '', start: '' }]
					$scope.calendardata = vm.calendardata;
					vm.schedulesavail = 0;
				}

				vm.cols = [
					{ field: "address", title: "Address", sortable: "address", show: true },
					{ field: "dateslot", title: "Date", show: true },
					{ field: "timerange", title: "Time", show: true },
					{ field: "schedulestatus", title: "Status", sortable: "schedulestatus", show: true }
				];


				vm.loader = 0;

				//Sorting
				vm.tableSorting = new NgTableParams({
					sorting: { address: 'asc' }
				},

					{
						dataset: vm.tabledata,
						counts: [],
						paginate: false

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

				vm.showCal = false;
			});
		});

		vm.cancelschedule = function (index) {
			// console.log(index);
			// if ($window.confirm("Are you sure you want to cancel this viewing appointment?")) {
			swal({
				title: "Are you sure?",
				text: 'This will Cancel this viewing appointment!',
				type: "warning",
				showCancelButton: true,
				confirmButtonClass: "btn-danger",
				confirmButtonText: 'Cancel',
				closeOnConfirm: true
			}, function () {
				firebase.database().ref('applyprop/' + index).update({
					schedulestatus: "cancelled"
				})

				firebase.database().ref('applyprop/' + index).once("value", function (snapshot) {
					firebase.database().ref('users/' + snapshot.val().landlordID).once("value", function (snap) {
						var emailData = '<p>Hello, </p><p>' + snapshot.val().name + ' has <strong>cancelled</strong> their viewing at ' + snapshot.val().dateslot + ', ' + snapshot.val().timerange + ' for ' + snapshot.val().address + '.</p><p>The time slot is now open to other renters.</p><p>To view details, please <a href="http://www.vcancy.com/login/#/"> log in </a> and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

						emailSendingService.sendEmailViaNodeMailer(snap.val().email, snapshot.val().name + 'has cancelled viewing for ' + snapshot.val().address, 'cancelstatus', emailData);
					});

					var emailData = '<p>Hello ' + snapshot.val().name + ', </p><p>Your viewing time ' + snapshot.val().dateslot + ', ' + snapshot.val().timerange + ' has been been <strong>cancelled</strong> by the landlord of ' + snapshot.val().address + '.</p><p>Please book another time using the link initially provided or contact the landlord directly.</p><p>To view details, please <a href="http://www.vcancy.com/login/#/"> log in </a> and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

					emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Your viewing has been cancelled for ' + snapshot.val().address, 'cancelstatus', emailData);
				});
				$state.reload();
			});

			// }
		}

		vm.removeSchedule = function (key) {
			swal({
				title: "Are you sure?",
				text: 'This will delete the schedule from the system.',
				type: "warning",
				showCancelButton: true,
				confirmButtonClass: "btn-danger",
				confirmButtonText: 'Delete',
				closeOnConfirm: true
			}, function () {
				firebase.database().ref('applyprop/' + key).update({
					schedulestatus: 'removed'
				}).then(function () {
					$state.reload();
				})
					.catch(function (err) {
						console.error('ERROR', err);
						swal("", "There was error deleteing the schedule.", "error");
					});

			});
		}
	}])
