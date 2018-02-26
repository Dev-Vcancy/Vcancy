'use strict';

//=================================================
// Landlord Schedule
//================================================= 

vcancyApp
	.controller('newscheduleCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', 'emailSendingService', '$q', '$uibModal', '_'
		, function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, emailSendingService, $q, $uibModal, _) {

			var vm = this;
			var userID = localStorage.getItem('userID');
			var userData = JSON.parse(localStorage.getItem('userData'));
			var landlordID = userData.refId || userID;
			vm.moment = moment;
			$scope.eventSources = [];
			var date = new Date();
			var d = date.getDate();
			var m = date.getMonth();
			var y = date.getFullYear();

			$scope.uiConfig = {
				calendar: {
					height: 500,
					editable: true,
					header: {
						left: 'title',
						center: '',
						right: 'today prev,next'
						
					},
					buttonText:{
						today: 'Today',
					},
					eventClick: $scope.alertEventOnClick,
					eventDrop: $scope.alertOnDrop,
					eventResize: $scope.alertOnResize
				}
			};

			/* event source that pulls from google.com */
			// $scope.eventSource = {
			// 	url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
			// 	className: 'gcal-event',           // an option!
			// 	currentTimezone: 'America/Chicago' // an option!
			// };
			$scope.events = [];
			// $scope.events = [
			// 	{ title: 'All Day Event', start: new Date(y, m, 1) },
			// 	{ title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2) },
			// 	{ id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false },
			// 	{ id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false },
			// 	{ title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false },
			// 	{ title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/' }
			// ];
			// $scope.eventsF = function (start, end, timezone, callback) {
			// 	var s = new Date(start).getTime() / 1000;
			// 	var e = new Date(end).getTime() / 1000;
			// 	var m = new Date(start).getMonth();
			// 	var events = [{ title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed'] }];
			// 	callback(events);
			// };
			$scope.eventSources = [$scope.events]
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

			function getListings() {
				vm.loader = 1;
				var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
				
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
						getListings();
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
						var date = moment(vm.listings[key].fromDate).format('DD MMM') + '-' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
						vm.mergeListing[list.link].fromToDate.push(date);
						vm.mergeListing[list.link].keys = [key];
					} else {
						var date = moment(vm.listings[key].fromDate).format('DD MMM') + ' - ' + moment(vm.listings[key].toDate).format('DD MMM') + ' ' + vm.listings[key].fromTime + '-' + vm.listings[key].toTime;
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
			}

			vm.addAvailability = function ($event) {
				$event.preventDefault();
				if (!vm.propertySelected || !vm.fromDate || !vm.toDate || !vm.fromTime || !vm.toTime) {
					return;
				}
				var availabilities = [];

				let url = 'https://vcancy.ca/login/#/applyproperty/'
				if (window.location.host.startsWith('localhost')) {
					url = 'http://localhost:9000/#/applyproperty/'
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
				if (vm.properties[vm.propertySelected].units == 'multiple') {
					vm.units = _.map(vm.selectedUnitId, 'unit');
					if (vm.units.length == 0) {
						return;
					}
				}
				if (vm.units.length > 0) {
					vm.units.forEach(function (unit) {
						var data = {
							unitID: unit
						}
						var _unitAvailability = Object.assign(data, availability);
						_unitAvailability.link = _unitAvailability.link + '?unitId=' + unit
						availabilities.push(_unitAvailability);
					});
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
					getListings();
				});
			};

			$scope.craigslistopen = function (isOpen) {
				if (isOpen) {
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
					getListings();
				});
			}
			vm.availableColors = ['Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Maroon', 'Umbra', 'Turquoise'];

			vm.toggleCraigsList = function (listingId, value, $event) {
				vm.loader = 1;
				var fbObj = firebase.database();
				var promiseObj = fbObj.ref('propertiesSchedule/' + listingId).update({
					listOnCraigslist: value
				})
				promiseObj
					.then(function () {
						vm.loader = 0;
						getListings();
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
				var unit = _.find(vm.properties[propId].unitlists, ['unit', unitId]);
				var prop = vm.properties[propId];
				return unit.isIncomplete == false ? false : true;
			}
		}])