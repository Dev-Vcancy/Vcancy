'use strict';

//=================================================
// Landlord Dashboard
//=================================================

vcancyApp
	.controller('landlorddboardlCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _) {

		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.proplive = 0;
		vm.unitsCount = 0;
		vm.vacantUnits = 0;
		vm.appliedProperties;
		vm.viewingschedule = 0;
		vm.viewed = 0;
		vm.submitapps = 0;
		
		
		vm.moment = moment;
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
					right: 'today prev,next'
					
				},
				buttonText:{
					today: 'Today',
				},
				
			//	eventClick: $scope.alertEventOnClick,
			//	eventDrop: $scope.alertOnDrop,
			//	eventResize: $scope.alertOnResize
			}
		};

		
		$scope.events = [];

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

		vm.loader = 1;

		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
			// console.log(snapshot.val())
			var properties = snapshot.val() || {};
			$scope.$apply(function () {
				var liveProperties = 0;
				var unitsCount = 0;
				var vacantUnits = 0;
				_.forEach(properties, function (value, key) {
					if(value.unitlists) {
						unitsCount = unitsCount + value.unitlists.length;
						var _vacantUnits = _.sumBy(value.unitlists, function(unitObj) {
							if(unitObj.status == "" || unitObj.status == "available" || !unitObj.status) {
								return 1;
							}
							return 0;
						});
						vacantUnits = vacantUnits + _vacantUnits || 0;
					}
					liveProperties = liveProperties + 1;
				});
				vm.proplive = liveProperties;
				vm.unitsCount = unitsCount;
				vm.vacantUnits = vacantUnits;
				vm.loader = 0;
			});

		});

		var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
			console.log(snapshot.val())
			var appliedProperties = 0;
			$scope.$apply(function () {
				if(snapshot.val()) {
					$.map(snapshot.val(), function (value, index) {
	
						if (value.schedulestatus == "confirmed" && moment(value.dateslot).isBefore(new Date())) {
							vm.viewed += 1;
						}
						if (value.schedulestatus == "confirmed" && moment(value.dateslot).isAfter(new Date())) {
							vm.viewingschedule += 1;
						}
						if (value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date()) && moment(value.fromtimeslot).format('HH:mm') < moment(new Date()).format('HH:mm') && moment(value.toslot).format('HH:mm') < moment(new Date()).format('HH:mm')) {
							vm.viewed += 1;
						}
						if (value.schedulestatus == "confirmed" && moment(value.dateslot).isSame(new Date()) && moment(value.fromtimeslot).format('HH:mm') >= moment(new Date()).format('HH:mm') && moment(value.toslot).format('HH:mm') >= moment(new Date()).format('HH:mm')) {
							vm.viewingschedule += 1;
						}
						if (value.schedulestatus == "submitted") {
							vm.submitapps += 1;
						}
	
						appliedProperties = appliedProperties + 1;
					});
				}
				vm.appliedProperties = appliedProperties;
				vm.loader = 0;
			});

		});

	}])