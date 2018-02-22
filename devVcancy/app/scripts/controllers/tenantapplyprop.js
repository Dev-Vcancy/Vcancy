'use strict';

//=================================================
// Apply Property
//=================================================

vcancyApp.controller('applypropCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', 'slotsBuildService', 'emailSendingService', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, slotsBuildService, emailSendingService) {

	var vm = this;
	vm.emailVerifiedError = '';
	var tenantID = localStorage.getItem('userID');
	vm.propinactive = 0;
	vm.registerUser = {
		firstName:'',
		lastName:'',
		email:'',
		phone:''
	};
	firebase.database().ref('users/' + localStorage.getItem('userID')).once("value", function (snapval) {
		var userData = snapval.val();
		$scope.$apply(function () {
			// console.log(userData);
			vm.userName = userData.firstname + ' ' + userData.lastname;
		});
	});
	// console.log(localStorage.getItem('userEmailVerified'));
	if (localStorage.getItem('userEmailVerified') == "false" || !$rootScope.emailVerified) {
		vm.isEmailVerified = 1;
	} else {
		vm.isEmailVerified = 0;
	}
	// console.log(vm.isEmailVerified);

	// Fetching property Data
	var ref = firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function (snap) {
		var propData = snap.val();
		if (propData == null) {
			$state.go('tenantdashboard');
		} else {
			vm.timeSlot = [];
			vm.slots = [];
			$scope.$apply(function () {
				vm.applyprop = {
					propID: snap.key,
					landlordID: propData.landlordID,
					propimg: propData.propimg,
					propstatus: propData.propstatus,
					proptype: propData.proptype,
					units: propData.units,
					shared: propData.shared,
					address: propData.address,
					date: [],
					fromtime: [],
					to: [],
					limit: [],
					multiple: [],
					propertylink: propData.propertylink,
					name: vm.userName
				}
				angular.forEach(propData.date, function (value, key) {
					console.log(propData);
					vm.applyprop.date.push(value);
					vm.applyprop.fromtime.push(propData.fromtime[key]);
					vm.applyprop.to.push(propData.to[key]);
					vm.applyprop.limit.push(propData.limit[key]);

					if (propData.multiple) {
						vm.applyprop.multiple.push(propData.multiple[key]);
					}

				});

				vm.applyprop.slots = slotsBuildService.maketimeslots(vm.applyprop.date, vm.applyprop.fromtime, vm.applyprop.to, vm.applyprop.limit, vm.applyprop.multiple);

				// If property is inactive tenant can't apply for the application
				if (vm.applyprop.propstatus == false) {
					// $state.go('tenantdashboard');
					vm.propinactive = 1;
				}
			});
		}



		firebase.database().ref('applyprop/').orderByChild("propID").equalTo($stateParams.propId).once("value", function (snapshot) {
			$scope.$apply(function () {
				console.log(snapshot.val());

				vm.alreadyBookedSlot = 0;
				vm.appliedslots = [];
				vm.applyprop.availableslots = [];
				vm.timeslotavail = 0;


				if (snapshot.val() != null) {
					$.map(snapshot.val(), function (value, index) {
						if (value.tenantID == localStorage.getItem('userID') && value.schedulestatus !== "cancelled") {
							vm.alreadyBookedSlot = 1;
						}
					});

					vm.appliedslots = $.map(snapshot.val(), function (value, index) {
						if (value.schedulestatus !== "cancelled") {
							return [{ date: value.dateslot, fromtime: moment(value.fromtimeslot).format('HH:mm'), to: moment(value.toslot).format('HH:mm'), person: 1 }];
						}
					});

					console.log(vm.applyprop.slots);
					console.log(vm.appliedslots);
					// console.log(vm.appliedslots.length);

					for (var i = 0; i < vm.applyprop.slots.length; i++) {
						for (var j = 0; j < vm.appliedslots.length; j++) {
							if (moment(vm.applyprop.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date && moment(vm.applyprop.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.applyprop.slots[i].to).format('HH:mm') == vm.appliedslots[j].to && vm.applyprop.slots[i].multiple == false) {
								vm.applyprop.slots[i].person = 0;

								for (var l = 0; l < vm.applyprop.slots.length; l++) {
									if (vm.applyprop.slots[l].dateslotindex == vm.applyprop.slots[i].dateslotindex && l != i) {
										vm.applyprop.slots[l].person -= 1;
									}
								}

							}

							if (moment(vm.applyprop.slots[i].date).format('DD-MMMM-YYYY') == vm.appliedslots[j].date && moment(vm.applyprop.slots[i].fromtime).format('HH:mm') == vm.appliedslots[j].fromtime && moment(vm.applyprop.slots[i].to).format('HH:mm') == vm.appliedslots[j].to && vm.applyprop.slots[i].multiple == true) {
								for (var l = 0; l < vm.applyprop.slots.length; l++) {
									if (vm.applyprop.slots[l].dateslotindex == vm.applyprop.slots[i].dateslotindex) {
										vm.applyprop.slots[l].person -= 1;
									}
								}
								// break;
							}
							console.log(vm.applyprop.slots);
						}
					}


					for (var i = 0; i < vm.applyprop.slots.length; i++) {
						if (vm.applyprop.slots[i].person > 0) {
							vm.applyprop.availableslots.push(vm.applyprop.slots[i]);
						}
						vm.timeslotavail = 1;
					}
				} else {
					vm.applyprop.availableslots = vm.applyprop.slots;
					vm.timeslotavail = 1;
				}
				console.log(vm.applyprop.availableslots, vm.applyprop.availableslots.length);

				// for (var j = 0; j < vm.applyprop.availableslots.length; j++) {
				// 	if (moment(moment(vm.applyprop.availableslots[j].date).format('DD-MMMM-YYYY')).isBefore(moment(new Date()).format('DD-MMMM-YYYY')) ) {
				// 		vm.applyprop.availableslots.splice(vm.applyprop.availableslots[j]);
				// 	}
				// }
				console.log(vm.applyprop.availableslots, vm.applyprop.availableslots.length);

			});
		});

		firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).limitToLast(1).once("value", function (snapshot) {
			$scope.$apply(function () {
				console.log(snapshot.val());
				if (snapshot.val() != null) {
					$.map(snapshot.val(), function (value, index) {
						vm.applyprop.tenantlocation = value.tenantlocation;
						vm.applyprop.phone = value.phone;
						vm.applyprop.age = value.age;
						vm.applyprop.jobtitle = value.jobtitle;
						vm.applyprop.description = value.description;
					});
				} else {
					vm.applyprop.tenantlocation = '';
					vm.applyprop.phone = '';
					vm.applyprop.age = '';
					vm.applyprop.jobtitle = '';
					vm.applyprop.description = '';
				}
			});
		});



	});


	// Property Application form - Data of tenant save		
	vm.tenantapply = function (applyprop) {
		if (localStorage.getItem('userEmailVerified') !== 'false') {
			vm.emailVerifiedError = '';
			var tenantID = localStorage.getItem('userID');
			var propID = vm.applyprop.propID;
			var address = vm.applyprop.address;
			var name = vm.applyprop.name;
			var tenantlocation = vm.applyprop.tenantlocation;
			var phone = vm.applyprop.phone;
			var age = vm.applyprop.age;
			var jobtitle = vm.applyprop.jobtitle;
			var landlordID = vm.applyprop.landlordID;
			var description = vm.applyprop.description;
			var datetimeslot = vm.applyprop.datetimeslot;
			var units = vm.applyprop.units;
			var dateslot = moment(vm.applyprop.availableslots[datetimeslot].date).format('DD-MMMM-YYYY');
			var fslot = vm.applyprop.availableslots[datetimeslot].fromtime.toString();
			var tslot = vm.applyprop.availableslots[datetimeslot].to.toString();
			var timerange = moment(vm.applyprop.availableslots[datetimeslot].fromtime).format('hh:mm A') + " - " + moment(vm.applyprop.availableslots[datetimeslot].to).format('hh:mm A');

			// console.log(dateslot,fslot,tslot);


			var applypropObj = $firebaseAuth();
			var applypropdbObj = firebase.database();

			applypropdbObj.ref('applyprop/').push().set({
				tenantID: tenantID,
				propID: propID,
				address: address,
				schedulestatus: "pending",
				name: name,
				tenantlocation: tenantlocation,
				phone: phone,
				age: age,
				datetimeslot: datetimeslot,
				dateslot: dateslot,
				fromtimeslot: fslot,
				toslot: tslot,
				jobtitle: jobtitle,
				landlordID: landlordID,
				description: description,
				timerange: timerange,
				units: units
			}).then(function () {
				$state.go('applicationThanks');
				// $rootScope.success = 'Application for property successfully sent!';	
				console.log('Application for property successfully sent!');

				firebase.database().ref('users/' + landlordID).once("value", function (snapshot) {
					// Mail to Landlord
					var emailData = '<p>Hello, </p><p>' + name + ' has requested a viewing at ' + dateslot + ', ' + timerange + 'for ' + address + '.</p><p>To accept this invitation and view renter details, please log in at http://vcancy.ca/login/  and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
					// Send Email
					emailSendingService.sendEmailViaNodeMailer(snapshot.val().email, name + ' has requested a viewing for ' + address, 'newviewingreq', emailData);
				});

				// Mail to Tenant
				var emailData = '<p>Hello ' + name + ', </p><p>Your viewing request for ' + address + ' at ' + dateslot + ', ' + timerange + ' has been sent.</p><p>To view your requests, please log in at http://vcancy.ca/login/ and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';
				// Send Email
				emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Viewing request for ' + address, 'viewingreq', emailData);
			})
		} else {
			vm.emailVerifiedError = 'Email not verified yet. Please verify email to schedule a slot.'
		}
	}

	vm.createUser = function (user) {
		var reguserObj = $firebaseAuth();
		var random = parseInt(Math.random() * 10000);
        var characterArray = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var pass = '';
        for (var i = 0; i < 6; i++) {
          var num = Math.floor((Math.random() * 60) + 1);
          pass += characterArray[num];
        }
		reguserObj.$createUserWithEmailAndPassword(user.email, pass)
			.then(function (firebaseUser) {
				var reguserdbObj = firebase.database();
				reguserdbObj.ref('users/' + firebaseUser.uid).set({
					firstname: user.firstname,
					lastname: user.lastname,
					usertype: 1,
					email: user.email,
					isadded: 1,
					iscancelshow: 1,
					iscreditcheck: 1,
					iscriminalreport: 1,
					isexpiresoon: 1,
					ispropertydelete: 1,
					isrentalsubmit: 1,
					isshowingtime: 1,
					companyname: ""
				});
				vm.opensuccesssweet("User Added successfully!, verification email has been sent to your email.");

				firebase.auth().signInWithEmailAndPassword(user.email, pass)
					.then(function (firebaseUser) {
						localStorage.setItem('userID', firebase.auth().currentUser.uid);
						localStorage.setItem('userEmail', firebase.auth().currentUser.email);
						localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
						localStorage.setItem('password', pass);
						alert('verification email has been sent to your email.');
						var emailData = '<p>Hello, </p><p>A new user,' + firstname + ' ,has been added to on https://vcancy.ca/ .</p><p>Your email is ' + email + '.</p><p>Your password : <strong>' + pass + '</strong></p><p>If you have any questions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

						// Send Email
						emailSendingService.sendEmailViaNodeMailer(user.email, 'A new user account has been added to your portal', 'Welcome', emailData);
						// Success 
						firebaseUser.sendEmailVerification().then(function () {

							var emailData = '<p>Hello, </p><p>A new user,' + firstname + ' ,has been added to your portal.</p><p>An account confirmation email has been sent to the user at ' + email + '.</p><p>To view/edit user details, please log in https://vcancy.ca/ and go to “Profile” and click on “Users”</p><p>If you have any questions please email us at support@vcancy.ca</p><p>Thanks,</p><p>Team Vcancy</p>';

							// Send Email
							emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'A new user account has been added to your portal', 'Welcome', emailData);

							console.log("Email Sent");
							$rootScope.success = 'Confirmation email resent';
							$rootScope.error = '';
							setTimeout(function () { $rootScope.success = '' }, 1000);
						}).catch(function (error) {
							console.log("Error in sending email" + error);
						});
					})
			}).catch(function (error) {
				//console.log(error);
				// if (error.message) {
				// 	if (error.message == "The email address is badly formatted.") {
				// 		$rootScope.error = "Invalid Email.";
				// 		$rootScope.success = '';
				// 	} else {
				// 		$rootScope.error = error.message;
				// 		setTimeout(function () { $rootScope.error = '' }, 1000);
				// 		$rootScope.success = '';
				// 	}
				// 	//$rootScope.error = error.message;

				// }

				// if (error.code === "auth/invalid-email") {
				// 	$rootScope.invalid = 'regemail';
				// } else if (error.code === "auth/weak-password") {
				// 	$rootScope.invalid = 'regpwd';
				// } else {
				// 	$rootScope.invalid = '';
				// }
				vm.openerrorsweet(error.code);
			});
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
            // $state.reload();
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

}])