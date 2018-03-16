'use strict';

//=================================================
// Apply Property
//=================================================

vcancyApp.controller('applypropCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', 'slotsBuildService', 'emailSendingService', '$uibModal', '$location', '_'
	, function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, slotsBuildService, emailSendingService, $uibModal, $location, _) {

		var vm = this;
		vm.moment = moment;
		vm.emailVerifiedError = '';
		var tenantID = localStorage.getItem('userID');
		vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
		vm.propinactive = 0;
		vm.registerUser = {
			firstName: '',
			lastName: '',
			email: '',
			phone: ''
		};
		vm.proposeDiv = false;
		vm.preScreeningAns = {};
		vm.landlordData = {};

		vm.proposeNewTime = {};

		if (vm.userData) {
			vm.registerUser.firstName = vm.userData.firstname;
			vm.registerUser.lastName = vm.userData.lastname;
			vm.registerUser.email = vm.userData.email;
		}
		vm.signIn = {
			username: '',
			password: ''
		}
		var urlData = $location.search() || {};
		vm.unitId = urlData.unitId || null;

		vm.selectedUnit = {};
		if (vm.userData) {
			vm.userName = vm.firstname + ' ' + vm.lastname;
		}
		// console.log(localStorage.getItem('userEmailVerified'));
		if (localStorage.getItem('userEmailVerified') == "false" || !$rootScope.emailVerified) {
			vm.isEmailVerified = 1;
		} else {
			vm.isEmailVerified = 0;
		}
		// console.log(vm.isEmailVerified);

		vm.getLandlord = function () {
			firebase.database().ref('/users/' + vm.propData.landlordID).once('value').then(function (snap) {
				$scope.$apply(function () {
					vm.landlordData = snap.val();
					console.log('vm.landlordData', vm.landlordData);
					vm.landlordData.id = snap.key;
				})
			});
		}

		function generateSlots() {
			var listings = angular.copy(vm.listings);
			var slotsData = {};
			_.forEach(listings, (value, key) => {
				var fromDate = moment(value.fromDate);
				var toDate = moment(value.toDate);
				var days = toDate.diff(fromDate, 'days');
				for (var i = 0; i <= days; i++) {
					let _fromDate = angular.copy(fromDate)
					let formattedDate = _fromDate.add(i, 'days').format('MM/DD/YYYY');
					if(!slotsData[formattedDate]) {
						slotsData[formattedDate] = [];
					}
					var fromTime = moment(value.fromTime, 'hh:mm a');
					var toTime = moment(value.toTime, 'hh:mm a');
					var slotsCount = toTime.diff(fromTime, 'minutes') / 30;
					for (var j = 0; j <= slotsCount; j++) {
						let _fromTime = angular.copy(fromTime);
						let formattedTime = _fromTime.add(30 * j, 'minutes').format('hh:mm a');
						slotsData[formattedDate].push(formattedTime);
					}
					slotsData[formattedDate] = _.uniq(slotsData[formattedDate]);
				}
				console.log('slotsData', slotsData)
			});
			$scope.$apply(function () {
				vm.availableSlots = angular.copy(slotsData);
				let keys = _.keys(vm.availableSlots);
				vm.selectedDate = keys[0];
				vm.selectedTime = vm.availableSlots[vm.selectedDate][0];
			});
		}
		vm.openproposemodal = function () {
			vm.proposeDiv = !vm.proposeDiv;
		};

		vm.formatDay = function (key) {
			return moment(key, 'MM/DD/YYYY').format('ddd')
		}

		vm.formatDate = function (key) {
			return moment(key, 'MM/DD/YYYY').format('MMM DD')
		}

		vm.selectSlotDate = function (key) {
			vm.selectedDate = key;
		};

		vm.selectSlotTime = function (key) {
			vm.selectedTime = key;
		};

		function getScheduledProp() {
			firebase.database().ref('propertiesSchedule/').orderByChild("propertyId").equalTo($stateParams.propId).once("value", function (snap) {
				if (snap.val()) {
					console.log('scheduleProp', snap.val());
					var listings = snap.val();
					vm.listings = angular.copy(listings);
					vm.schudeledListing = 1;
					generateSlots();
					// getScheduledProp();
				} else {
					vm.schudeledListing = 0;
				}
			})
		}

		function getProperty() {
			firebase.database().ref("/properties/" + $stateParams.propId).once('value').then(function (snap) {
				if (snap.val()) {
					var propData = snap.val();
					vm.propData = angular.copy(propData);
					if (propData && propData.unitlists && propData.unitlists.length > 0) {
						vm.selectedUnit = propData.unitlists.find(function (unit) {
							if (unit.unit == vm.unitId) return true;
						});
						vm.selectedUnit.description = vm.selectedUnit.description.replace(/(?:\r\n|\r|\n)/g, '<br />')
						vm.selectedUnit.otherAminities = vm.selectedUnit.otherAminities.replace(/(?:\r\n|\r|\n)/g, '<br />')
					}
					if (!vm.selectedUnit.images) {
						vm.selectedUnit.images = [];
					}
					vm.selectedUnit.images.push({ Location: vm.propData ? vm.propData.propimg : null });
					getScheduledProp();
					vm.getLandlord();
				} else {
					$state.go('tenantdashboard');
				}
			})
		}

		function init() {
			getProperty();
		}

		init();

		vm.forgotpwdmail = function () {
			var email = vm.signIn.email;
			if (!email) {
				swal({
					type: 'error',
					title: 'Error',
					text: 'Please enter email'
				});
				return
			}
			$rootScope.invalid = '';
			$rootScope.success = '';
			$rootScope.error = '';

			var forgotuserObj = $firebaseAuth();
			forgotuserObj.$sendPasswordResetEmail(email).then(function () {
				$rootScope.success = 'Password reset email sent to your inbox. Please check your email.';
				$rootScope.error = '';
				vm.signIn.email = '';
				vm.modalInstance.dismiss('cancel');
				swal({
					type: 'success',
					title: 'success',
					text: 'Email sent'
				});
			}).catch(function (error) {
				swal({
					type: 'error',
					title: 'Error',
					text: error.message
				});
			});

		};
		vm.forgetPwd = false;
		vm.toggleForgetPwd = function () {
			vm.forgetPwd = true;
		}

		// Property Application form - Data of tenant save		
		vm.tenantapply = function () {
			//if (localStorage.getItem('userEmailVerified') !== 'false') {
				var userInfo = vm.userInfo ? angular.copy(vm.userInfo) : null;
				var userDetails = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : userInfo;
				vm.emailVerifiedError = '';
				var tenantID = localStorage.getItem('userID') || vm.userInfo.id;
				var propID = $stateParams.propId;
				var address = vm.propData.address;
				var name = vm.registerUser.firstName + ' ' + vm.registerUser.lastName;
				var phone = vm.registerUser.phone;
				var landlordID = vm.landlordData.id;
				var unitID = vm.unitId;
				var dateSlot = vm.selectedDate;
				var fromTime = moment(vm.selectedTime, 'hh:mm a');
				var toTime = moment(fromTime).add(30, 'minutes');
				var timeRange = fromTime.format('hh:mm a') + '-' + toTime.format('hh:mm a');
				var fromTimeSlot = fromTime.format('hh:mm a');
				var toTimeSlot = toTime.format('hh:mm a');
				var preScreeningAns = angular.copy(vm.preScreeningAns)
				var proposeNewTime = {};
				if (Object.keys(vm.proposeNewTime).length > 0) {
					proposeNewTime = angular.copy(vm.proposeNewTime);
				}
				vm.proposeNewTime = {};

				var applypropObj = $firebaseAuth();
				var applypropdbObj = firebase.database();
				var _data = {
					tenantID: tenantID,
					propID: propID,
					address: address,
					schedulestatus: "scheduled",
					name: name,
					phone: phone,
					dateSlot: dateSlot,
					fromTimeSlot: fromTimeSlot,
					toTimeSlot: toTimeSlot,
					landlordID: landlordID,
					timeRange: timeRange,
					unitID: unitID,
					units: unitID,
					preScreeningAns: preScreeningAns,
					proposeNewTime: proposeNewTime
				}
				if (!_.isEmpty(_data.proposeNewTime)) {
					_data.schedulestatus = 'pending';
					if (_data.proposeNewTime.date1) {
						_data.proposeNewTime.date1 = moment(_data.proposeNewTime.date1).format('MM/DD/YYYY')
					}
					if (_data.proposeNewTime.date2) {
						_data.proposeNewTime.date2 = moment(_data.proposeNewTime.date2).format('MM/DD/YYYY')
					}
					if (_data.proposeNewTime.date3) {
						_data.proposeNewTime.date3 = moment(_data.proposeNewTime.date3).format('MM/DD/YYYY')
					}
				}
				applypropdbObj.ref('applyprop/').push().set(_data).then(function () {
					$state.go('applicationThanks');
					// $rootScope.success = 'Application for property successfully sent!';	
					console.log('Application for property successfully sent!');

					firebase.database().ref('users/' + landlordID).once("value", function (snapshot) {
						// Mail to Landlord
						var emailData = '<p>Hello, </p><p>' + name + ' has requested a viewing at ' + dateSlot + ', ' + timeRange + 'for ' + address + '.</p><p>To accept this invitation and view renter details, please log in at http://vcancy.com/login/  and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
						// Send Email
						emailSendingService.sendEmailViaNodeMailer(snapshot.val().email, name + ' has requested a viewing for ' + address, 'newviewingreq', emailData);
					});

					// Mail to Tenant
					var emailData = '<p>Hello ' + vm.registerUser.firstName + ', </p><p>Your viewing request for ' + address + ' at ' + dateSlot + ', ' + timeRange + ' has been sent.</p><p>To view your requests, please log in at http://vcancy.com/login/ and go to “Schedule”</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
					// Send Email
					emailSendingService.sendEmailViaNodeMailer(vm.registerUser.email, 'Viewing request for ' + address, 'viewingreq', emailData);
				});
			// } else {
			// 	vm.emailVerifiedError = 'Email not verified yet. Please verify email to schedule a slot.'
			// }
		}

		vm.createUser = function (user) {
			if (vm.userData) {
				vm.tenantapply();
				return;
			}
			firebase.database().ref('/users').orderByChild("email").equalTo(vm.registerUser.email).once('value').then(function (snap) {
				if (snap.val()) {
					vm.userInfo = snap.val();
					vm.userInfo.id = snap.key;
					vm.foundUser = true;
					vm.tenantapply();
				} else {
					var reguserObj = $firebaseAuth();
					var random = parseInt(Math.random() * 10000);
					var characterArray = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
					var pass = '';
					for (var i = 0; i < 6; i++) {
						var num = Math.floor((Math.random() * 60) + 1);
						pass += characterArray[num];
					}
					reguserObj.$createUserWithEmailAndPassword(vm.registerUser.email, pass)
						.then(function (firebaseUser) {
							var reguserdbObj = firebase.database();
							reguserdbObj.ref('users/' + firebaseUser.uid).set({
								firstname: vm.registerUser.firstName,
								lastname: vm.registerUser.lastName,
								usertype: 0,
								email: vm.registerUser.email,
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
							vm.opensuccesssweet("User Added successfully!, A verification email has been sent to your email.");

							firebase.auth().signInWithEmailAndPassword(vm.registerUser.email, pass)
								.then(function (firebaseUser) {
									localStorage.setItem('userID', firebase.auth().currentUser.uid);
									localStorage.setItem('userEmail', firebase.auth().currentUser.email);
									localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
									localStorage.setItem('password', pass);
									swal({
										title: "Success",
										text: 'A verification email has been sent to your email.',
										type: "success",
									});
									var emailData = '<p>Hello, </p><p>A new user,' + vm.registerUser.firstName + ' ,has been added to on https://vcancy.com/ .</p><p>Your email is ' + vm.registerUser.email + '.</p><p>Your password : <strong>' + pass + '</strong></p><p>If you have any questions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

									// Send Email
									emailSendingService.sendEmailViaNodeMailer(vm.registerUser.email, 'A new user account has been added to your portal', 'Welcome', emailData);
									// Success 
									firebaseUser.sendEmailVerification().then(function () {

										$rootScope.success = 'Confirmation email resent';
										$rootScope.error = '';
										setTimeout(function () { $rootScope.success = '' }, 1000);
										vm.tenantapply();
									}).catch(function (error) {
										console.log("Error in sending email" + error);
									});
								})
						}).catch(function (error) {
							vm.openerrorsweet(error.code);
						});
				}
			});

		};
		vm.openSignInmodel = function (prop) {

			vm.modalInstance = $uibModal.open({
				templateUrl: 'signin.html',
				backdrop: 'static',
				scope: $scope,
				size: 'md'
			});
		};
		vm.signInFunction = function (userdetails) {
			firebase.auth().signInWithEmailAndPassword(userdetails.email, userdetails.password)
				.then(function (firebaseUser) {
					localStorage.setItem('userID', firebase.auth().currentUser.uid);
					localStorage.setItem('userEmail', firebase.auth().currentUser.email);
					localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
					localStorage.setItem('password', userdetails.password);
					firebase.database().ref('/users/' + firebase.auth().currentUser.uid).once('value').then(function (userdata) {
						$rootScope.usertype = 0;
						localStorage.setItem('usertype', 0);
						localStorage.setItem('userData', JSON.stringify(userdata.val()));
						vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
						if (vm.userData) {
							vm.registerUser.firstName = vm.userData.firstname;
							vm.registerUser.lastName = vm.userData.lastname;
							vm.registerUser.email = vm.userData.email;
						}
						vm.closeModal();
						$scope.$apply();
					});
				})
				.catch(function (error) {
					vm.openerrorsweet(error.code);
				});
		}
		vm.closeModal = function () {
			vm.modalInstance.dismiss('cancel');
		}
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