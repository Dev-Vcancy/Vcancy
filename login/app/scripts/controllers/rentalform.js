'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('rentalformCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		var scheduleID = $stateParams.scheduleId;
		
		firebase.database().ref('applyprop/'+scheduleID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val()) {
					vm.scheduledata = snapshot.val();
					
					firebase.database().ref('properties/'+vm.scheduledata.propID).once("value", function(snap) {	
						$scope.$apply(function(){
							if(snap.val()) {
								vm.propdata = snap.val();		
							}
						});								
					});
					// firebase.database().ref('users/'+tenantID).once("value", function(snapval) {	
						// $scope.$apply(function(){
							// if(snapval.val()) {
								// vm.tenantdata = snapval.val();
								// vm.tenantname = vm.tenantdata.firstname+" "+vm.tenantdata.lastname;
							// }
						// });								
					// });					
				} 
			});
		});
			
}])