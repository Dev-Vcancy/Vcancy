'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('rentalformCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		var scheduleID = $stateParams.scheduleId;
		var tenantEmail = localStorage.getItem('userEmail');
		vm.adult = [0];
		vm.minor = [0];
		vm.addadult = function(adultlen){
			vm.adult.push(adultlen);
		}
		vm.addminor = function(minorlen){
			vm.minor.push(minorlen);
		}
		
		
		firebase.database().ref('applyprop/'+scheduleID).once("value", function(snapshot) {	
			// console.log(snapshot.val())
			$scope.$apply(function(){
				if(snapshot.val()) {
					vm.scheduledata = snapshot.val();
					vm.scheduledata.scheduleID = snapshot.key;
					
					firebase.database().ref('properties/'+vm.scheduledata.propID).once("value", function(snap) {	
						$scope.$apply(function(){
							if(snap.val()) {
								vm.propdata = snap.val();
								vm.propdata.propID = snap.key;								
							}
						});								
					});
					firebase.database().ref('users/'+tenantID).once("value", function(snapval) {	
						$scope.$apply(function(){
							if(snapval.val()) {
								vm.tenantdata = snapval.val();
								console.log(vm.tenantdata);
								vm.tenantdata.tenantID = snapval.key;
								vm.tenantdata.tenantName = vm.tenantdata.firstname+" "+vm.tenantdata.lastname;
								vm.tenantdata.tenantEmail = tenantEmail;
							}
						});								
					});					
				} 
			});
		});
			
			
		vm.rentalAppSubmit = function(rentaldata){
			console.log(rentaldata);
			var tenantID = vm.tenantdata.tenantID;
			var scheduleID = vm.scheduledata.scheduleID;
			var propID = vm.propdata.propID;
			
			var address = vm.propdata.address;
			var rent = vm.propdata.rent;
			var months = rentaldata.months;
			var startdate = rentaldata.startdate;
			var parking = rentaldata.parking;
			
			var applicantname = vm.tenantdata.tenantName;
			var applicantdob = rentaldata.dob;
			var telwork = rentaldata.telwork;
			var telhome = rentaldata.telhome;
			var applicantemail = vm.tenantdata.tenantEmail;
			var appaddress = rentaldata.appadress;
			var applicantcity = rentaldata.appcity;
			var maritalstatus = rentaldata.maritalstatus;
			var rent_own = rentaldata.rent_own;
			var live_time_at_address = rentaldata.live_time;
			var rentamt = rentaldata.rentamt;
			var vacantreason = rentaldata.vacantreason;
			var landlordname = rentaldata.landlordname;
			var landlordphone = rentaldata.landlordphone;
			
			var adultapplicantname = rentaldata.otherappname;
			var adultapplicantdob = rentaldata.otherappdob;
			
			var minorapplicantname = rentaldata.minorappname;
			var minorapplicantdob = rentaldata.minorappdob;
			
			var pets = rentaldata.pets;
			var petsdesc = rentaldata.petsdesc;
			var smoking = rentaldata.smoking;
			
			var appcurrentemployer = rentaldata.appcurrentemployer;
			var appposition = rentaldata.appposition;
			var appemployerphone = rentaldata.appemployerphone;
			var appworkingduration = rentaldata.appworkingduration;
			var appgrossmonthlyincome = rentaldata.appgrossmonthlyincome;
			var appincometype = rentaldata.appincometype;
			var appotherincome = rentaldata.appotherincome;
			
			var vehiclemake = rentaldata.vehiclemake;
			var vehiclemodel = rentaldata.vehiclemodel;
			var vehicleyear = rentaldata.vehicleyear;
			
			var emergencyname = rentaldata.emergencyname;
			var emergencyphone = rentaldata.emergencyphone;
			
			var refone_name = rentaldata.refone_name;
			var refone_phone = rentaldata.refone_phone;
			var refone_relation = rentaldata.refone_relation;
			
			var reftwo_name = rentaldata.reftwo_name;
			var reftwo_phone = rentaldata.reftwo_phone;
			var reftwo_relation = rentaldata.reftwo_relation;
			
			var otherappcurrentemployer = rentaldata.otherappcurrentemployer;
			var otherappposition = rentaldata.otherappposition;
			var otherappemployerphone = rentaldata.otherappemployerphone;
			var otherappworkingduration = rentaldata.otherappworkingduration;
			var otherappgrossmonthlyincome = rentaldata.otherappgrossmonthlyincome;
			var otherappincometype = rentaldata.otherappincometype;
			var otherappotherincome = rentaldata.otherappotherincome;
			
			var dated = rentaldata.dated;
			var appsign = rentaldata.appsign;
			var otherappsign = rentaldata.otherappsign;
			
			vm.adultapplicants = $.map(adultapplicantname, function(adult, index) {
				return [{
						adultapplicantname: adult,
						adultapplicantdob: adultapplicantdob[index],												
						otherappcurrentemployer: otherappcurrentemployer[index],
						otherappposition: otherappposition[index],
						otherappemployerphone: otherappemployerphone[index],
						otherappworkingduration: otherappworkingduration[index],
						otherappgrossmonthlyincome: otherappgrossmonthlyincome[index],
						otherappincometype: otherappincometype[index],
						otherappotherincome: otherappotherincome[index],												
						otherappsign: otherappsign[index]
					}];
			});	
			
			vm.minorapplicants = $.map(minorapplicantname, function(minor, index) {
				return [{
						minorapplicantname: minor,
						minorapplicantdob: minorapplicantdob[index]
					}];
			});	
			
					
			firebase.database().ref('submitapps/').push().set({
				tenantID: tenantID,
				scheduleID: scheduleID,
				propID: propID,
				
				address: address,
				rent: rent,
				months: months,
				startdate: startdate,
				parking: parking,					

				telwork: telwork,
				telhome: telhome,
				applicantemail: applicantemail,
				appaddress: '', //appaddress,
				applicantcity: applicantcity,
				maritalstatus: maritalstatus,
				rent_own: rent_own,
				live_time_at_address: live_time_at_address,
				rentamt: rentamt,
				vacantreason: vacantreason,
				landlordname: landlordname,
				landlordphone: landlordphone,
					
				pets: pets,
				petsdesc: petsdesc,
				smoking:smoking,
				
				vehiclemake: vehiclemake,
				vehiclemodel: vehiclemodel,
				vehicleyear: vehicleyear,
				
				emergencyname: emergencyname,
				emergencyphone: emergencyphone,
				
				refone_name: refone_name,
				refone_phone: refone_phone,
				refone_relation: refone_relation,
				
				reftwo_name: reftwo_name,
				reftwo_phone: reftwo_phone,
				reftwo_relation: reftwo_relation,			
				
				applicantsno: (vm.addadult.length)+1,
				
				dated: dated,
				
				rentalstatus: "pending"
			}).then(function(){
				 //Generate the applicant details of submitted app to new table
				firebase.database().ref('submitapps/').limitToLast(1).once("child_added", function (snapshot) {		
			  
					if(snapshot.key != "undefined"){
						var applicantsdata = {
							"applicantID": snapshot.key,
							"mainapplicant": {
												"applicantname": applicantname,
												"applicantdob": applicantdob,												
												"appcurrentemployer": appcurrentemployer,
												"appposition": appposition,
												"appemployerphone": appemployerphone,
												"appworkingduration": appworkingduration,
												"appgrossmonthlyincome": appgrossmonthlyincome,
												"appincometype": appincometype,
												"appotherincome": appotherincome,												
												"appsign": appsign,
											},
							"otherapplicants": vm.adultapplicants,
							"minors":	vm.minorapplicants	 					
						}

						console.log(applicantsdata);
					
						firebase.database().ref('submitappapplicants/').push().set(applicantsdata);
						
						// update the schedule to be aubmitted application
						firebase.database().ref('applyprop/'+scheduleID).update({	
							schedulestatus: "submitted"
						})					
						$state.go('tenantapplications');
					}				
				})
			})	
		}
		
}])