'use strict';

//=================================================
// Tenant Dashboard
//=================================================

vcancyApp
    .controller('tenantdboardlCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		
		vm.viewingschedule = 0;
		vm.submitapps = 0;
		vm.propactive = 0;
		vm.applicantcompet = 0;

		var propdbObj = firebase.database().ref('applyprop/').orderByChild("tenantID").equalTo(tenantID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				snapshot.forEach(function(childSnapshot) {
					// console.log(childSnapshot.val().propstatus);
					
					// if(childSnapshot.val().schedulestatus == "pending"){
						vm.viewingschedule += 1;
						
					// }
					
				});
			});
		   
		});
		
		
		
		
}])