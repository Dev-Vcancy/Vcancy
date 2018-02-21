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
			vm.selectedListings = [];

			function getListings() {
				vm.loader = 1;
				var propdbObj = firebase.database().ref('propertiesSchedule/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					console.log(snapshot.val())
					$scope.$apply(function () {
						vm.success = 0;
						if (snapshot.val()) {
							vm.listings = snapshot.val();
							$.map(vm.listings, function (value, key) {
								value.parsedFromDate = parseInt(new moment(value.fromDate).format('x'))
								value.parsedToDate = parseInt(new moment(value.toDate).format('x'))
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
				var availability = {
					propertyId: vm.propertySelected,
					fromDate: moment(vm.fromDate.toString()).toDate().toString(),
					fromTime: vm.fromTime,
					toDate: moment(vm.toDate.toString()).toDate().toString(),
					toTime: vm.toTime,
					landlordID: landlordID,
					userID: userID,
					link: 'https://vcancy.ca/login/#/applyprop/' + vm.propertySelected,
					status: 'Not Listed',
					listOnCraigslist: false
				}
				if (vm.properties[vm.propertySelected].units == 'multiple') {
					vm.units = [vm.selectedUnitId];
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
				$.map(vm.listings, function (value, key) {
					if (value.inputCheck) {
						selectedListings.push(key);
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
					windowClass: 'detailmodalcss',
					scope: $scope
				});
			};

			vm.checkIsIncomplete = function(propId, unitId) {
				if(!unitId) {
					return false;
				}
				var unit = _.find(vm.properties[propId].unitlists, ['unit', unitId]);
				var prop = vm.properties[propId];
				return unit.isIncomplete == false ? false: true;
			}
		}])