'use strict';

//=================================================
// View Tenant Application
//=================================================

vcancyApp
    .controller('viewappCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		var applicationID = $stateParams.appID;
		var tenantEmail = localStorage.getItem('userEmail');
		
		vm.adult = [];
		vm.minor = [];
		vm.rentaldata = [];		
		
		// DATEPICKER
		vm.today = function() {
			vm.dt = new Date();
		};
		vm.today();

		vm.toggleMin = function() {
			vm.minDate = vm.minDate ? null : new Date();
		};
		vm.toggleMin();
		
		vm.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
		vm.maxDate = new Date();
		vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		vm.format = vm.formats[0];
		
		
		firebase.database().ref('submitapps/'+applicationID).once("value", function(snapshot) {	
			console.log(snapshot.val());
			$scope.$apply(function(){
				if(snapshot.val()) {
						var value = snapshot.val();
						console.log(value);
						vm.rentaldata.tenantID = value.tenantID;
						vm.rentaldata.scheduleID = value.scheduleID;
						vm.rentaldata.propID = value.propID;
						
						vm.rentaldata.address = value.address;
						vm.rentaldata.rent = value.rent;
						vm.rentaldata.months = value.months;
						vm.rentaldata.startdate = value.startdate;
						vm.rentaldata.parking = value.parking;						
						vm.rentaldata.telwork = value.telwork;
						vm.rentaldata.telhome = value.telhome;
						vm.rentaldata.tenantEmail = value.applicantemail;
						vm.rentaldata.appaddress = value.appaddress;
						vm.rentaldata.appcity = value.applicantcity;
						vm.rentaldata.maritalstatus = value.maritalstatus;
						vm.rentaldata.rent_own = value.rent_own;		
						vm.rentaldata.live_time = value.live_time_at_address;
						vm.rentaldata.rentamt = value.rentamt;
						vm.rentaldata.vacantreason = value.vacantreason;
						vm.rentaldata.landlordname = value.landlordname;
						vm.rentaldata.landlordphone = value.landlordphone;
						vm.rentaldata.pets = value.pets;
						vm.rentaldata.petsdesc = value.petsdesc;
						vm.rentaldata.smoking = value.smoking;
						vm.rentaldata.vehiclemake = value.vehiclemake;
						vm.rentaldata.vehiclemodel = value.vehiclemodel;
						vm.rentaldata.vehicleyear = value.vehicleyear;						
						vm.rentaldata.emergencyname = value.emergencyname;
						vm.rentaldata.emergencyphone = value.emergencyphone;
						vm.rentaldata.refone_name = value.refone_name;
						vm.rentaldata.refone_phone = value.refone_phone;
						vm.rentaldata.refone_relation = value.refone_relation;
						vm.rentaldata.reftwo_name = value.reftwo_name;
						vm.rentaldata.reftwo_phone = value.reftwo_phone;
						vm.rentaldata.reftwo_relation = value.reftwo_relation;
						vm.rentaldata.dated = new Date(value.dated);

						console.log(vm.rentaldata);
						
						firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(applicationID).once("value", function(snap) {	
							$scope.$apply(function(){
								if(snap.val()) {
									$.map(snap.val(), function(v, k) {
										console.log(v);
										vm.rentaldata.tenantName = v.mainapplicant.applicantname;
										vm.rentaldata.dob =  new Date(v.mainapplicant.applicantdob);												
										vm.rentaldata.appcurrentemployer =  v.mainapplicant.appcurrentemployer;
										vm.rentaldata.appposition =  v.mainapplicant.appposition;
										vm.rentaldata.appemployerphone =  v.mainapplicant.appemployerphone;
										vm.rentaldata.appworkingduration =  v.mainapplicant.appworkingduration;
										vm.rentaldata.appgrossmonthlyincome =  v.mainapplicant.appgrossmonthlyincome;
										vm.rentaldata.appincometype =  v.mainapplicant.appincometype;
										vm.rentaldata.appotherincome =  v.mainapplicant.appotherincome;												
										vm.rentaldata.appsign =  v.mainapplicant.appsign;
										
										vm.rentaldata.minorappname= [];
										vm.rentaldata.minorappdob= [];
										
										if(v.minors != undefined){
											angular.forEach(v.minors, function(value, key) {
											  vm.minor.push(key);
											  vm.rentaldata.minorappname.push(value.minorapplicantname);
											  vm.rentaldata.minorappdob.push(new Date(value.minorapplicantdob));			  
											});
										}
										vm.rentaldata.otherappname= [];
										vm.rentaldata.otherappdob= [];
										vm.rentaldata.otherappcurrentemployer= [];
										vm.rentaldata.otherappposition= [];
										vm.rentaldata.otherappemployerphone= [];
										vm.rentaldata.otherappworkingduration= [];
										vm.rentaldata.otherappgrossmonthlyincome= [];
										vm.rentaldata.otherappincometype= [];
										vm.rentaldata.otherappotherincome= [];
										vm.rentaldata.otherappsign= [];
										
										if(v.otherapplicants != undefined){
											angular.forEach(v.otherapplicants, function(value, key) {
											  vm.adult.push(key);
											  vm.rentaldata.otherappname.push(value.adultapplicantname);
											  vm.rentaldata.otherappdob.push(new Date(value.adultapplicantdob));
											  vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
											  vm.rentaldata.otherappposition.push(value.otherappposition);
											  vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
											  vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
											  vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
											  vm.rentaldata.otherappincometype.push(value.otherappincometype);
											  vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
											  vm.rentaldata.otherappsign.push(value.otherappsign);									  
											});
										}
									});
								}
							});
						});
				}
			});
		});
		vm.printApp = function(){
		   $window.print();
		  }
}])