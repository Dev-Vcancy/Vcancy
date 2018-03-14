'use strict';

//=================================================
// Landlord Schedule
//================================================= 

vcancyApp
	.controller('newscheduleCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'emailSendingService', '$q', '$uibModal', '_', '$compile', 'uiCalendarConfig'
		, function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, emailSendingService, $q, $uibModal, _, $compile, uiCalendarConfig) {

			var vm = this;
			var userID = localStorage.getItem('userID');
			var landlordID = ''
			var userData = JSON.parse(localStorage.getItem('userData'));
			var userEmail = localStorage.getItem('userEmail');
			vm.userData = userData;
			var landlordID = userData.refId || userID;
			vm.landLordID = landlordID;
			vm.moment = moment;
			vm.todayDate = moment().format('YYYY-MM-DD');
			$scope.eventSources = [];
			var date = new Date();
			var d = date.getDate();
			var m = date.getMonth();
			var y = date.getFullYear();

			$scope.uiConfig = {
				calendar: {
					height: 500,
					editable: false,
					header: {
						left: 'title',
						center: '',
						right: 'today prev,next',

					},
					buttonText: {
						today: 'Today',
					},
				}
			};

			/* event source that pulls from google.com */
			$scope.eventSource = {
				className: 'gcal-event',           // an option!
				currentTimezone: 'America/Chicago' // an option!
			};

			$scope.events = [];

			$scope.eventsF = function (start, end, timezone, callback) {
				callback();
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

			vm.getListings = function () {
				vm.loader = 1;
				var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					// $scope.events = [];
					for (var i = 0; i < $scope.events.length; i++) {
						$scope.events.pop();
					}
					$scope.$apply(function () {
						vm.success = 0;
						if (snapshot.val()) {
							vm.listings = snapshot.val();
							vm.generateMergeListing();

							$.map(vm.listings, function (value, key) {
								value.parsedFromDate = parseInt(new moment(value.fromDate).format('x'))
								value.parsedToDate = parseInt(new moment(value.toDate).format('x'))
								var startDate = new Date(value.fromDate).setHours(parseFloat(value.fromTime));
								var endDate = new Date(value.toDate).setHours(parseFloat(value.toTime));
								$scope.events.push(
									{
										title: value.unitID + '-' + vm.properties[value.propertyId].address,
										start: new Date(startDate),
										end: new Date(endDate),
										className: 'bgm-teal'

									}
								)
							});
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

			function getProperties() {
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
						vm.getListings();
					});
				});
			}

			function init() {
				vm.loader = 1;
				getProperties();
			}

			init();

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
				var url = 'https://vcancy.ca/login/#/applyproperty/'
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
					userData = JSON.parse(localStorage.getItem('userData')) || {};
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
				swal({
					title: "Are you sure?",
					text: 'This will Delete all the selected listings.',
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: 'Delete All!',
					closeOnConfirm: true
				}, function () {
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
				});
			}

			vm.toggleCraigsList = function (listingId, value, $event) {
				vm.loader = 1;
				var fbObj = firebase.database();
				var promiseObj = fbObj.ref('propertiesSchedule/' + listingId).update({
					listOnCraigslist: value
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
				$scope.selectedUnitDetail.otherUnits = vm.properties[propId].unitlists
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

			vm.toggleListOnCraglist = function (keys) {
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
					vm.toggleCraigsList(key, vm.listings[key].listOnCraigslist)
				});
				if (toggle) {
					swal({
						title: 'Success',
						text: 'Your unit will now be listed on Craigslist in 12-24 hours.You will get a notification email when your listing is active.',
						type: "success",
					});
				}
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

			$scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF]

			function generateToken() {
				var result = '',
					length = 6,
					chars = 'ABCEDFGHIJKLMNOPQRSTUVWXYZ0123456789';

				for (var i = 0; i < length; i++)
					result += chars[Math.floor(Math.random() * chars.length)];

				return result;
			}

			vm.questionDropDown = [
				{ id: 'WKRX6Q', label: 'What is your profession?', isChecked: false },
				{ id: 'MV5SML', label: 'Do you have Pets? Provide details', isChecked: true },
				{ id: 'N1F5MO', label: 'Are you able to provide references?', isChecked: false },
				{ id: 'OU489L', label: 'Why are you moving?', isChecked: false },
				{ id: 'U0G6V8', label: 'Tell me a bit about yourself', isChecked: true },
				{ id: 'A9OG32', label: 'No. of Applicants', isChecked: true },
				{ id: 'UH7JZS', label: 'Do you smoke?', isChecked: true },
				{ id: 'ZGJQ60', label: 'Move-in date', isChecked: true },
			];

			vm.openPrescreeningQuestions = function () {
				vm.prescreeningQuestion = $uibModal.open({
					templateUrl: 'prescreeningquestions.html',
					backdrop: 'static',
					size: 'md',
					scope: $scope
				});
			};

			$scope.closePrescreeningModal = function () {
				vm.prescreeningQuestion.close();
			}
			vm.customQuestion = null;
			vm.addCustomQuestion = function () {
				if (!vm.customQuestion) {
					return;
				}
				var data = {
					label: vm.customQuestion,
					id: generateToken(),
					isChecked: false
				}

				vm.screeningQuestions.push(data);
				vm.customQuestion = null;
			}

			vm.saveScreeningQuestions = function () {
				vm.loader = 1;
				var ques = angular.copy(vm.screeningQuestions);
				_.omit(ques, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					screeningQuestions: ques
				}).then(function () {
					userData.screeningQuestions = ques;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshScreeningQuestions();
					vm.loader = 0;
					vm.prescreeningQuestion.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			vm.deleteQuestionById = function (id) {
				var index = vm.screeningQuestions.findIndex(function (ques) {
					if (ques.id == id) return true;
				});
				vm.screeningQuestions.splice(index, 1);
			};

			function refreshScreeningQuestions() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.screeningQuestions && userData.screeningQuestions.length !== 0) {
					vm.screeningQuestions = userData.screeningQuestions;
				} else {
					vm.screeningQuestions = angular.copy(vm.questionDropDown);
				}
			}
			refreshScreeningQuestions();

			// Custom Rental
			vm.companyDetail = function () {
				return vm.userData.companyname + ' ' + (',' + vm.userData.contact || '')
			}

			vm.customRentalApplicationCheck = {};
			vm.customRentalApplicationCheck.TCData = 'You are authorized to obtaining credit checks & verifying details contained in this Application.' +

				'This unit/s is strictly NON SMOKING. This offer is subject to acceptance by the landlord/property' +
				'management company that listed the property.This application is made on the understanding that no ' +
				'betterments will be provided to the Rental Unit except those which may be specifically requested in' +
				'this Application and agreed to in writing by the Landlord and specified in a tenancy agreement.' +

				'It is understood that this application will not be processed unless fully completed.' +

				'If the landlord/property management company accepts this Application, we will sign a Fixed ' +
				'Term Tenancy Agreement at the offices of the property management company or in person with' +
				'the landlord and pay the security deposit. The Rental Unit will not be considered rented' +
				'until the Fixed Term Tenancy Agreement is signed by the Tenant and the Landlord.' +

				'We will ensure that the collection, use, disclosure and retention of information will comply with ' +
				'the provisions of the Freedom of information and Protection of Privacy Act. ' +
				'Information will be collected and used only as necessary and for the intended purpose and will ' +
				'not be disclosed as required by law.' +

				'I hereby state that the information contained herein is true and I authorize my References' +
				'as listed above to release information regarding my employment and/or past/current tenancies.' +

				'Tenants are not chosen on a first come – first served basis. We choose the most suitable ' +
				'application for the unit at our sole discretion. This application form is to be used only' +
				'in the interested of the owner of the rental unit.';

			vm.defaultRentalApplicationCheck = {
				'PAPPD': true,
				'CADDR': true,
				'PADDR': false,
				'AAPPD': false,
				'AAPP1': false,
				'AAPP2': false,
				'ESIV': true,
				'ESIV1': true,
				'VI': false,
				'EC': false,
				'EC1': false,
				'REF': true,
				'REF1': true,
				'REF2': false,
				'UD': true,
				'UDAAPP': false,
				'TC': true,
				'TCData': vm.customRentalApplicationCheck.TCData,
				'companyLogo': userData ? userData.companylogo || 'https://s3.ca-central-1.amazonaws.com/vcancy-final/public/no_image_found.jpg' : 'https://s3.ca-central-1.amazonaws.com/vcancy-final/public/no_image_found.jpg',
				'companyDetails': vm.companyDetail()
			}

			function refreshCustomRentalApplicationCheck() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.customRentalApplicationCheck) {
					if (userData.customRentalApplicationCheck && !userData.customRentalApplicationCheck.TCData) {
						userData.customRentalApplicationCheck.TCData = vm.customRentalApplicationCheck.TCData;
					}
					if (!userData.customRentalApplicationCheck.companyLogo) {
						userData.customRentalApplicationCheck.companyLogo = userData.companylogo || vm.customRentalApplicationCheck.companyLogo || "https://s3.ca-central-1.amazonaws.com/vcancy-final/public/no_image_found.jpg";
					}
					if (!userData.customRentalApplicationCheck.companyDetails) {
						userData.customRentalApplicationCheck.companyDetails = vm.companyDetail();
					}
					vm.customRentalApplicationCheck = userData.customRentalApplicationCheck;
				} else {
					vm.customRentalApplicationCheck = angular.copy(vm.defaultRentalApplicationCheck);
				}
			}
			refreshCustomRentalApplicationCheck();

			vm.saveCustomRentalApplicationCheck = function () {
				vm.loader = 1;
				var customChecks = angular.copy(vm.customRentalApplicationCheck);
				_.omit(customChecks, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					customRentalApplicationCheck: customChecks
				}).then(function () {
					userData.customRentalApplicationCheck = customChecks;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshCustomRentalApplicationCheck();
					vm.loader = 0;
					vm.customrentalapp.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			$scope.uploadDetailsImages = function (event) {
				var file = event.target.files[0];
				AWS.config.update({
					accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
					secretAccessKey: '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'
				});
				AWS.config.region = 'ca-central-1';

				var bucket = new AWS.S3({
					params: {
						Bucket: 'vcancy-final'
					}
				});
				var filename = moment().format('YYYYMMDDHHmmss') + file.name;
				filename = filename.replace(/\s/g, '');

				if (file.size > 3145728) {
					swal({
						title: "Error!",
						text: 'File size should be 3 MB or less.',
						type: "error",
					});
					return false;
				} else if (file.type.indexOf('image') === -1) {
					swal({
						title: "Error!",
						text: 'Only files are accepted.',
						type: "error",
					});
					return false;
				}

				var params = {
					Key: 'company-logo/' + filename,
					ContentType: file.type,
					Body: file,
					StorageClass: "STANDARD_IA",
					ACL: 'public-read'
				};

				bucket.upload(params).on('httpUploadProgress', function (evt) { })
					.send(function (err, data) {
						if (data && data.Location) {
							$scope.$apply(function () {
								vm.customRentalApplicationCheck.companyLogo = data.Location;
							});
							// });
							// firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
							//   vm.opensuccesssweet("Profile Updated successfully!");
							// }, function (error) {

							//   vm.openerrorsweet("Profile Not Updated! Try again!");
							//   return false;
							// });
						}
					});
			}

			$scope.closecustomrentalappModal = function () {
				vm.customrentalapp.close();
			}

			vm.opencustomrentalapp = function () {
				vm.customrentalapp = $uibModal.open({
					templateUrl: 'customrentalapp.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};

		}])