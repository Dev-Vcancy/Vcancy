'use strict';

//=================================================
// Landlord Dashboard
//=================================================

vcancyApp
	.controller('landlorddboardlCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_', function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _) {

		var vm = this;
		var landlordID = localStorage.getItem('userID');
		vm.proplive = 0;
		vm.units = 0;
		vm.vacantUnits = 0;
		vm.appliedProperties;
		vm.viewingschedule = 0;
		vm.viewed = 0;
		vm.submitapps = 0;

		vm.loader = 1;

		var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
			// console.log(snapshot.val())
			var properties = snapshot.val() || {};
			$scope.$apply(function () {
				var liveProperties = 0;
				var units = 0;
				var vacantUnits = 0;
				_.forEach(properties, function (value, key) {
					if(value.units == "multiple" && value.unitlists) {
						units = units + value.unitlists.length;
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
				vm.units = units;
				vm.vacantUnits = vacantUnits;
				vm.loader = 0;
			});

		});

		var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
			console.log(snapshot.val())
			var appliedProperties = 0;
			$scope.$apply(function () {
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
				vm.appliedProperties = appliedProperties;
				vm.loader = 0;
			});

		});

	}])