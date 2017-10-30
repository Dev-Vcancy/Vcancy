'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('rentalformCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams','Upload','$http','emailSendingService','config', function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams,Upload, $http,emailSendingService,config) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		var scheduleID = $stateParams.scheduleId;
		var applicationID = $stateParams.applicationId;
		var tenantEmail = localStorage.getItem('userEmail');
		vm.submitemail = $rootScope.renterExternalEmail;
		console.log(vm.submitemail);
		$rootScope.renterExternalEmail = '';
		console.log($rootScope.renterExternalEmail);
		
		vm.draft = "false";
		vm.draftdata = "false";
		
		vm.rentownchange = function(){
			if(vm.rentaldata.rent_own == "rent"){
				vm.rentaldata.live_time =  '';
				vm.rentaldata.rentamt =  '';
				vm.rentaldata.vacantreason =  '';
			} else {
				vm.rentaldata.live_time =  ' ';
				vm.rentaldata.rentamt =  '0.00';
				vm.rentaldata.vacantreason =  ' ';
			}
			
		}
		
		vm.petschange = function(){
			if(vm.rentaldata.pets == "yes"){
				vm.rentaldata.petsdesc = '';
			} else {
				vm.rentaldata.petsdesc = ' ';
			}
		}
		
		vm.tenantdata = [];
		vm.rentaldata = [];
		vm.propdata = [];
		vm.scheduledata = [];
		
		
		vm.tenantdata.tenantID =  '';
		vm.scheduledata.scheduleID =  '';
		vm.propdata.propID =  '';
		vm.propdata.landlordID =  '';
		
		vm.propdata.address =  '';
		vm.propdata.rent =  '';
		vm.rentaldata.months =  '';
		vm.rentaldata.startdate =  '';
		vm.rentaldata.parking =  '';
		vm.tenantdata.tenantName =  '';
		vm.rentaldata.dob =  '';
		vm.rentaldata.sinno = '';
		vm.rentaldata.telwork =  '';
		vm.rentaldata.telhome =  '';
		vm.tenantdata.tenantEmail =  '';
		vm.rentaldata.appaddress =  '';
		vm.rentaldata.appcity =  '';
		vm.rentaldata.maritalstatus =  '';
		vm.rentaldata.rent_own =  '';
		vm.rentaldata.live_time =  '';
		vm.rentaldata.rentamt =  '';
		vm.rentaldata.vacantreason =  '';
		vm.rentaldata.landlordname =  '';
		vm.rentaldata.landlordphone =  '';
		
		vm.rentaldata.otherappname =  [];
		vm.rentaldata.otherappdob =  [];
		vm.rentaldata.otherappsinno =  [];
		
		vm.rentaldata.minorappname =  [];
		vm.rentaldata.minorappdob =  [];
		vm.rentaldata.minorappsinno =  [];
		
		vm.rentaldata.pets =  '';
		vm.rentaldata.petsdesc =  '';
		vm.rentaldata.smoking =  '';
		vm.rentaldata.appfiles = '';
		
		vm.rentaldata.appcurrentemployer =  '';
		vm.rentaldata.appposition =  '';
		vm.rentaldata.appemployerphone =  '';
		vm.rentaldata.appworkingduration =  '';
		vm.rentaldata.appgrossmonthlyincome =  '';
		vm.rentaldata.appincometype =  '';
		vm.rentaldata.appotherincome =  '';
		
		vm.rentaldata.vehiclemake =  '';
		vm.rentaldata.vehiclemodel =  '';
		vm.rentaldata.vehicleyear =  '';
		
		vm.rentaldata.emergencyname =  '';
		vm.rentaldata.emergencyphone =  '';
		
		vm.rentaldata.refone_name =  '';
		vm.rentaldata.refone_phone =  '';
		vm.rentaldata.refone_relation =  '';
		
		vm.rentaldata.reftwo_name =  '';
		vm.rentaldata.reftwo_phone =  '';
		vm.rentaldata.reftwo_relation =  '';
		
		vm.rentaldata.otherappcurrentemployer =  [];
		vm.rentaldata.otherappposition =  [];
		vm.rentaldata.otherappemployerphone =  [];
		vm.rentaldata.otherappworkingduration =  [];
		vm.rentaldata.otherappgrossmonthlyincome =  [];
		vm.rentaldata.otherappincometype =  [];
		vm.rentaldata.otherappotherincome =  [];
		
		vm.rentaldata.dated =  '';
		vm.rentaldata.appsign =  '';
		vm.rentaldata.otherappsign =  [];
		
		
		// DATEPICKER
		vm.today = function() {
			vm.dt = new Date();
		};
		vm.today();

		vm.toggleMin = function() {
			vm.minDate = vm.minDate ? null : new Date();
		};
		vm.toggleMin();

		vm.dobopen = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			vm.dobopened = true;
		};
		
		vm.dateopen = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
			vm.dateopened = true;
		};
		
		vm.minordobopened = [];
		vm.minordobopen = function($event,minorindex) {
			console.log(minorindex);
			$event.preventDefault();
			$event.stopPropagation();
			angular.forEach(vm.minor, function(value, key) {
			  vm.minordobopened[key] = false;
			console.log(vm.minordobopened[key]);
			});
			vm.minordobopened[minorindex] = true;
			console.log("here"+vm.minordobopened[minorindex]);
		};
		
		
		vm.adultdobopened = [];
		vm.adultdobopen = function($event,adultindex) {
			console.log(adultindex);
			$event.preventDefault();
			$event.stopPropagation();
			angular.forEach(vm.adult, function(value, key) {
			  vm.adultdobopened[key] = false;
			console.log(vm.adultdobopened[key]);
			});
			vm.adultdobopened[adultindex] = true;
			console.log("here"+vm.adultdobopened[adultindex]);
		};

		vm.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
		vm.maxDate = new Date();
		vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		vm.format = vm.formats[0];
		
		
		vm.adult = [];
		vm.minor = [];
		vm.addadult = function(adultlen){
			vm.adult.push(adultlen);
		}
		vm.addminor = function(minorlen){
			vm.minor.push(minorlen);
		}
		
		// to remove adult
		vm.removeadult = function(slotindex){
			console.log(slotindex,vm.adult);
			vm.adult.splice(slotindex,1);
			vm.rentaldata.otherappname.splice(slotindex,1);
			vm.rentaldata.otherappdob.splice(slotindex,1);
			vm.rentaldata.otherappsinno.splice(slotindex,1);
			vm.rentaldata.otherappcurrentemployer.splice(slotindex,1);
			vm.rentaldata.otherappposition.splice(slotindex,1);	
			vm.rentaldata.otherappemployerphone.splice(slotindex,1);
			vm.rentaldata.otherappworkingduration.splice(slotindex,1);
			vm.rentaldata.otherappgrossmonthlyincome.splice(slotindex,1);
			vm.rentaldata.otherappincometype.splice(slotindex,1);	
			vm.rentaldata.otherappotherincome.splice(slotindex,1);
			vm.rentaldata.otherappsign.splice(slotindex,1);			
		}
		
		// to remove minor
		vm.removeminor = function(slotindex){	
			console.log(slotindex,vm.adult);
			console.log(vm.rentaldata);		
			vm.minor.splice(slotindex,1);
			vm.rentaldata.minorappdob.splice(slotindex,1);
			vm.rentaldata.minorappsinno.splice(slotindex,1);
			vm.rentaldata.minorappname.splice(slotindex,1);
			
			console.log(vm.minor,vm.rentaldata);
		}
		
		if(applicationID == 0) {
			firebase.database().ref('submitapps/').orderByChild("tenantID").equalTo(tenantID).limitToLast(1).once("value", function(snapshot) {	
				console.log(snapshot.val());
				$scope.$apply(function(){
					if(snapshot.val() !== null) {
						$.map(snapshot.val(),function(value,index){	
							vm.draftdata = "false";					
							vm.applicationID = index;
							vm.tenantdata.tenantID = value.tenantID;
							// vm.scheduledata.scheduleID = value.scheduleID;
							// vm.propdata.propID = value.propID;
							// vm.propdata.landlordID = value.landlordID;
							
							// vm.propdata.address = value.address;
							vm.propdata.rent = value.rent;
							vm.rentaldata.months = value.months;
							vm.rentaldata.startdate = value.startdate;
							vm.rentaldata.parking = value.parking;
							vm.rentaldata.telwork = value.telwork;
							vm.rentaldata.telhome = value.telhome;
							vm.tenantdata.tenantEmail = value.applicantemail;
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
							vm.rentaldata.appfiles = value.appfiles;
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
							vm.rentaldata.dated = value.dated != '' ? new Date(value.dated) : '';
							
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
													if(vm.propdata.units == ' '){
														var units = '';
													} else {
														var units = vm.propdata.units +" - ";
													}
													vm.propdata.address = units+vm.propdata.address;
												}
											});								
										});				
									} 
								});
							});
						});
						firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationID).once("value", function(snap) {	
							$scope.$apply(function(){
								if(snap.val()!= null) {
									$.map(snap.val(), function(v, k) {
										console.log(v);
										vm.tenantdata.tenantName = v.mainapplicant.applicantname;
										vm.rentaldata.dob =  v.mainapplicant.applicantdob != '' ? new Date(v.mainapplicant.applicantdob) : '';
										vm.rentaldata.sinno = v.mainapplicant.applicantsinno;												
										vm.rentaldata.appcurrentemployer =  v.mainapplicant.appcurrentemployer;
										vm.rentaldata.appposition =  v.mainapplicant.appposition;
										vm.rentaldata.appemployerphone =  v.mainapplicant.appemployerphone;
										vm.rentaldata.appworkingduration =  v.mainapplicant.appworkingduration;
										vm.rentaldata.appgrossmonthlyincome =  v.mainapplicant.appgrossmonthlyincome;
										vm.rentaldata.appincometype =  v.mainapplicant.appincometype;
										vm.rentaldata.appotherincome =  v.mainapplicant.appotherincome;												
										vm.rentaldata.appsign =  v.mainapplicant.appsign;
										
										
										angular.forEach(v.minors, function(value, key) {
										  vm.minor.push(key);
										  vm.rentaldata.minorappname.push(value.minorapplicantname);
										  vm.rentaldata.minorappdob.push(value.minorapplicantdob != '' ? new Date(value.minorapplicantdob) : '');
										  vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);			  
										});
										
										angular.forEach(v.otherapplicants, function(value, key) {
										  vm.adult.push(key);
										  vm.rentaldata.otherappname.push(value.adultapplicantname);
										  vm.rentaldata.otherappdob.push(value.adultapplicantdob != '' ? new Date(value.adultapplicantdob) : '');
										  vm.rentaldata.otherappsinno.push(value.adultapplicantsinno);
										  vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
										  vm.rentaldata.otherappposition.push(value.otherappposition);
										  vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
										  vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
										  vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
										  vm.rentaldata.otherappincometype.push(value.otherappincometype);
										  vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
										  vm.rentaldata.otherappsign.push(value.otherappsign);									  
										});
										
									});
								}
							});
						});
					} else {
						vm.draftdata = "false";
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
												vm.propdata.address = vm.propdata.units +" - "+vm.propdata.address;
											}
										});								
									});				
								} 
							});
						});
						
						
						firebase.database().ref('users/'+tenantID).once("value", function(snapval) {	
							$scope.$apply(function(){
								if(snapval.val()) {
									vm.tenantdata = snapval.val();
									vm.tenantdata.tenantID = snapval.key;
									vm.tenantdata.tenantName = vm.tenantdata.firstname+" "+vm.tenantdata.lastname;
									vm.tenantdata.tenantEmail = tenantEmail;
								}
							});								
						});	
					}
					// console.log(vm.tenantdata);	
					// console.log(vm.rentaldata);	
					// console.log(vm.propdata);	
				});
			});
		} else {
			firebase.database().ref('submitapps/'+$stateParams.applicationId).once("value", function(snapshot) {	
				console.log(snapshot.val());
				$scope.$apply(function(){
					if(snapshot.val() !== null) {
							var value = snapshot.val();
							vm.applicationID = $stateParams.applicationId;
							vm.draftdata = "true";
							vm.tenantdata.tenantID = value.tenantID;
							vm.scheduledata.scheduleID = value.scheduleID;
							vm.propdata.propID = value.propID;
							vm.propdata.landlordID = value.landlordID;
							vm.propdata.address = value.address;
							vm.propdata.rent = value.rent;
							vm.rentaldata.months = value.months;
							vm.rentaldata.startdate = value.startdate;
							vm.rentaldata.parking = value.parking;
							vm.rentaldata.telwork = value.telwork;
							vm.rentaldata.telhome = value.telhome;
							vm.tenantdata.tenantEmail = value.applicantemail;
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
							vm.rentaldata.appfiles = value.appfiles;
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
						
						firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationID).once("value", function(snap) {	
							$scope.$apply(function(){
								if(snap.val()!= null) {
									$.map(snap.val(), function(v, k) {
										console.log(v);
										vm.tenantdata.tenantName = v.mainapplicant.applicantname;
										vm.rentaldata.dob =  new Date(v.mainapplicant.applicantdob);
										vm.rentaldata.sinno = v.mainapplicant.applicantsinno;												
										vm.rentaldata.appcurrentemployer =  v.mainapplicant.appcurrentemployer;
										vm.rentaldata.appposition =  v.mainapplicant.appposition;
										vm.rentaldata.appemployerphone =  v.mainapplicant.appemployerphone;
										vm.rentaldata.appworkingduration =  v.mainapplicant.appworkingduration;
										vm.rentaldata.appgrossmonthlyincome =  v.mainapplicant.appgrossmonthlyincome;
										vm.rentaldata.appincometype =  v.mainapplicant.appincometype;
										vm.rentaldata.appotherincome =  v.mainapplicant.appotherincome;												
										vm.rentaldata.appsign =  v.mainapplicant.appsign;
										
										
										angular.forEach(v.minors, function(value, key) {
										  vm.minor.push(key);
										  vm.rentaldata.minorappname.push(value.minorapplicantname);
										  vm.rentaldata.minorappdob.push(new Date(value.minorapplicantdob));
										  vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);			  
										});
										
										angular.forEach(v.otherapplicants, function(value, key) {
										  vm.adult.push(key);
										  vm.rentaldata.otherappname.push(value.adultapplicantname);
										  vm.rentaldata.otherappdob.push(new Date(value.adultapplicantdob));
										  vm.rentaldata.otherappsinno.push(value.adultapplicantsinno);
										  vm.rentaldata.otherappcurrentemployer.push(value.otherappcurrentemployer);
										  vm.rentaldata.otherappposition.push(value.otherappposition);
										  vm.rentaldata.otherappemployerphone.push(value.otherappemployerphone);
										  vm.rentaldata.otherappworkingduration.push(value.otherappworkingduration);
										  vm.rentaldata.otherappgrossmonthlyincome.push(value.otherappgrossmonthlyincome);
										  vm.rentaldata.otherappincometype.push(value.otherappincometype);
										  vm.rentaldata.otherappotherincome.push(value.otherappotherincome);
										  vm.rentaldata.otherappsign.push(value.otherappsign);									  
										});
										
									});
								}
							});
						});
					} else {
						vm.draftdata = "false";
						firebase.database().ref('users/'+tenantID).once("value", function(snapval) {	
							$scope.$apply(function(){
								if(snapval.val()) {
									vm.tenantdata = snapval.val();
									vm.tenantdata.tenantID = snapval.key;
									vm.tenantdata.tenantName = vm.tenantdata.firstname+" "+vm.tenantdata.lastname;
									vm.tenantdata.tenantEmail = tenantEmail;
								}
							});								
						});	
					}	
				});
			});
		}
			
		vm.rentalAppSubmit = function(){
			console.log(vm.rentaldata, vm.draft);
			// alert($('#appfiles').val().split('\\').pop().split('/').pop().split('.')[0]+new Date().getTime());
			var tenantID = vm.tenantdata.tenantID;
			
			if($stateParams.scheduleId != 0){
				var scheduleID = $stateParams.scheduleId;
				var propID = vm.propdata.propID;
				var landlordID = vm.propdata.landlordID;
				var externalappStatus = "submit";
			} else {
				var scheduleID = 0;
				var propID = 0;	
				var landlordID = 0;
				var externalappStatus = "submit";
				if(vm.draft == "true"){
					var externalappStatus = "draft";					
				} else {
					var externalappStatus = "submit";	
				}
			}
			console.log(externalappStatus);
			
			var address = vm.propdata.address == undefined ? '' :vm.propdata.address;
			var rent = vm.propdata.rent == undefined ? '' :vm.propdata.rent;
			var months = vm.rentaldata.months == undefined ? '' :vm.rentaldata.months;
			var startdate = vm.rentaldata.startdate == undefined ? '' :vm.rentaldata.startdate;
			var parking = vm.rentaldata.parking == undefined ? '' :vm.rentaldata.parking;
			
			var applicantname = vm.tenantdata.tenantName == undefined ? '' :vm.tenantdata.tenantName;
			var applicantdob = vm.rentaldata.dob == undefined ? '' :vm.rentaldata.dob.toString();
			var applicantsinno = vm.rentaldata.sinno == undefined ? '' :vm.rentaldata.sinno;
			var telwork = vm.rentaldata.telwork == undefined ? '' :vm.rentaldata.telwork;
			var telhome = vm.rentaldata.telhome == undefined ? '' : vm.rentaldata.telhome;
			var applicantemail = vm.tenantdata.tenantEmail == undefined ? '' :vm.tenantdata.tenantEmail;
			var appaddress = vm.rentaldata.appaddress == undefined ? '' :vm.rentaldata.appaddress;
			var applicantcity = vm.rentaldata.appcity == undefined ? '' :vm.rentaldata.appcity;
			var maritalstatus = vm.rentaldata.maritalstatus == undefined ? '' :vm.rentaldata.maritalstatus;
			var rent_own = vm.rentaldata.rent_own == undefined ? '' : vm.rentaldata.rent_own;
			var live_time_at_address = vm.rentaldata.live_time == undefined ? '' :vm.rentaldata.live_time;
			var rentamt = vm.rentaldata.rentamt == undefined ? '' :vm.rentaldata.rentamt ;
			var vacantreason = vm.rentaldata.vacantreason == undefined ? '' :vm.rentaldata.vacantreason;
			var landlordname = vm.rentaldata.landlordname == undefined ? '' :vm.rentaldata.landlordname;
			var landlordphone = vm.rentaldata.landlordphone == undefined ? '' :vm.rentaldata.landlordphone;
			
			var adultapplicantname = vm.rentaldata.otherappname;
			var adultapplicantdob = vm.rentaldata.otherappdob;
			var adultapplicantsinno = vm.rentaldata.otherappsinno;
			
			var minorapplicantname = vm.rentaldata.minorappname;
			var minorapplicantdob = vm.rentaldata.minorappdob;
			var minorapplicantsinno = vm.rentaldata.minorappsinno;
			
			var pets = vm.rentaldata.pets == undefined ? '' :vm.rentaldata.pets;
			var petsdesc = vm.rentaldata.petsdesc == undefined ? '' :vm.rentaldata.petsdesc;
			var smoking = vm.rentaldata.smoking == undefined ? '' :vm.rentaldata.smoking;
			
			// var file = $('#appfiles').val().split('\\').pop().split('/').pop();
			// var filename = $('#appfiles').val().split('\\').pop().split('/').pop().split('.')[0]+new Date().getTime();
			// var fileext = $('#appfiles').val().split('\\').pop().split('/').pop().split('.').pop().toLowerCase();
			// var appfiles = "images/applicationuploads/"+filename+"."+fileext;
			
			var appfiles = $('#appfiles').val();
			var filename = $('#filename').val() === '' ? '' : $('#filename').val();
			var filepath = filename != '' ? "http://www.vcancy.ca/login/dist/images/"+filename : appfiles;
			
			var appcurrentemployer = vm.rentaldata.appcurrentemployer == undefined ? '' :vm.rentaldata.appcurrentemployer;
			var appposition = vm.rentaldata.appposition == undefined ? '' :vm.rentaldata.appposition;
			var appemployerphone = vm.rentaldata.appemployerphone == undefined ? '' :vm.rentaldata.appemployerphone;
			var appworkingduration = vm.rentaldata.appworkingduration == undefined ? '' :vm.rentaldata.appworkingduration;
			var appgrossmonthlyincome = vm.rentaldata.appgrossmonthlyincome == undefined ? '' :vm.rentaldata.appgrossmonthlyincome;
			var appincometype = vm.rentaldata.appincometype == undefined ? '' :vm.rentaldata.appincometype;
			var appotherincome = vm.rentaldata.appotherincome == undefined ? '' :vm.rentaldata.appotherincome;
			
			var vehiclemake = vm.rentaldata.vehiclemake == undefined ? '' :vm.rentaldata.vehiclemake;
			var vehiclemodel = vm.rentaldata.vehiclemodel == undefined ? '' :vm.rentaldata.vehiclemodel;
			var vehicleyear = vm.rentaldata.vehicleyear == undefined ? '' :vm.rentaldata.vehicleyear;
			
			var emergencyname = vm.rentaldata.emergencyname == undefined ? '' :vm.rentaldata.emergencyname;
			var emergencyphone = vm.rentaldata.emergencyphone == undefined ? '' :vm.rentaldata.emergencyphone;
			
			var refone_name = vm.rentaldata.refone_name == undefined ? '' :vm.rentaldata.refone_name;
			var refone_phone = vm.rentaldata.refone_phone == undefined ? '' :vm.rentaldata.refone_phone;
			var refone_relation = vm.rentaldata.refone_relation == undefined ? '' :vm.rentaldata.refone_relation;
			
			var reftwo_name = vm.rentaldata.reftwo_name == undefined ? '' :vm.rentaldata.reftwo_name;
			var reftwo_phone = vm.rentaldata.reftwo_phone == undefined ? '' :vm.rentaldata.reftwo_phone;
			var reftwo_relation = vm.rentaldata.reftwo_relation == undefined ? '' :vm.rentaldata.reftwo_relation;
			
			var otherappcurrentemployer = vm.rentaldata.otherappcurrentemployer;
			var otherappposition = vm.rentaldata.otherappposition;
			var otherappemployerphone = vm.rentaldata.otherappemployerphone;
			var otherappworkingduration = vm.rentaldata.otherappworkingduration;
			var otherappgrossmonthlyincome = vm.rentaldata.otherappgrossmonthlyincome;
			var otherappincometype = vm.rentaldata.otherappincometype;
			var otherappotherincome = vm.rentaldata.otherappotherincome;
			
			var dated = vm.rentaldata.dated == undefined ? '' :vm.rentaldata.dated.toString();
			var appsign = vm.rentaldata.appsign == undefined ? '' :vm.rentaldata.appsign;
			var otherappsign = vm.rentaldata.otherappsign;
			vm.adultapplicants = [];
			vm.minorapplicants = [];
			
			vm.adultapplicants = $.map(vm.adult, function(adult, index) {
				return [{
						adultapplicantname: adultapplicantname[index] == undefined ? '' :adultapplicantname[index],
						adultapplicantdob: adultapplicantdob[index] == undefined ? '' :adultapplicantdob[index].toString(),
						adultapplicantsinno: adultapplicantsinno[index] == undefined ? '' :adultapplicantsinno[index],
						otherappcurrentemployer: otherappcurrentemployer[index] == undefined ? '' :otherappcurrentemployer[index],
						otherappposition: otherappposition[index] == undefined ? '' :otherappposition[index],
						otherappemployerphone: otherappemployerphone[index] == undefined ? '' :otherappemployerphone[index],
						otherappworkingduration: otherappworkingduration[index] == undefined ? '' :otherappworkingduration[index],
						otherappgrossmonthlyincome: otherappgrossmonthlyincome[index] == undefined ? '' :otherappgrossmonthlyincome[index],
						otherappincometype: otherappincometype[index] == undefined ? '' :otherappincometype[index] ,
						otherappotherincome: otherappotherincome[index] == undefined ? '' :otherappotherincome[index],					
						otherappsign: otherappsign[index] == undefined ? '' :otherappsign[index] 
					}];
			});	
			
			vm.minorapplicants = $.map(vm.minor, function(minor, index) {
				return [{
						minorapplicantname: minorapplicantname[index]  == undefined ? '' :minorapplicantname[index] ,
						minorapplicantdob: minorapplicantdob[index]  == undefined ? '' :minorapplicantdob[index].toString(), 
						minorapplicantsinno: minorapplicantsinno[index]  == undefined ? '' :minorapplicantsinno[index] 
					}];
			});	
			console.log(vm.adultapplicants);
			
			if(vm.draftdata === "false" && $stateParams.applicationId == 0 ) {		
				firebase.database().ref('submitapps/').push().set({
					tenantID: tenantID,
					scheduleID: scheduleID,
					propID: propID,
					landlordID: landlordID,
					
					address: address,
					rent: rent,
					months: months,
					startdate: startdate,
					parking: parking,					

					telwork: telwork,
					telhome: telhome,
					applicantemail: applicantemail,
					appaddress: appaddress,
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
					appfiles: filepath,
					
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
					
					applicantsno: (vm.adult.length)+1,
					externalappStatus: externalappStatus,
					
					dated: dated,
					
					rentalstatus: "pending"
				}).then(function(){
					 //Generate the applicant details of submitted app to new table
					firebase.database().ref('submitapps/').limitToLast(1).once("child_added", function (snapshot) {		
				  
						if(snapshot.key != "undefined"){
							vm.applicationID = snapshot.key;
							var applicantsdata = {
								"applicationID": snapshot.key,
								"mainapplicant": {
													"applicantname": applicantname,
													"applicantdob": applicantdob,
													"applicantsinno": applicantsinno,												
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
							
							if(vm.draft == "false"){
								// update the schedule to be aubmitted application
								firebase.database().ref('applyprop/'+scheduleID).update({	
									schedulestatus: "submitted"
								})
							}
						}				
					})
				})
			} else {
				firebase.database().ref('submitapps/'+vm.applicationID).set({
					tenantID: tenantID,
					scheduleID: scheduleID,
					propID: propID,
					landlordID: landlordID,
					
					address: address,
					rent: rent,
					months: months,
					startdate: startdate,
					parking: parking,					

					telwork: telwork,
					telhome: telhome,
					applicantemail: applicantemail,
					appaddress: appaddress,
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
					appfiles: filepath,
					
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
					
					applicantsno: (vm.adult.length)+1,
					externalappStatus: externalappStatus,
					
					dated: dated,
					
					rentalstatus: "pending"
				}).then(function(){
					 //Generate the applicant details of submitted app to new table
					var applicantsdata = {
						"applicationID": vm.applicationID,
						"mainapplicant": {
											"applicantname": applicantname,
											"applicantdob": applicantdob,	
											"applicantsinno": applicantsinno,												
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
					firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(vm.applicationID).once("value", function(snap) {	
						console.log(snap.val());
						if(snap.val() != null) {								
							$.map(snap.val(), function(v, k) {
								console.log(k,applicantsdata);
								firebase.database().ref('submitappapplicants/'+k).set(applicantsdata);
							});
						}
					});
					
										
					if(vm.draft == "false"){
						// update the schedule to be aubmitted application
						firebase.database().ref('applyprop/'+scheduleID).update({	
							schedulestatus: "submitted"
						})
					}						
				})
			}
			
			if(filename != ''){
				vm.upload(appfiles,filename);
			}
			
			if(vm.draft == "false") {
				if(landlordID != 0) {
					firebase.database().ref('users/'+landlordID).once("value", function(snap) {
						console.log(snap.val());
						var emailData = '<p>Hello, </p><p>'+applicantname+' has submitted a rental application for '+address+'.</p><p>To view the application, please log in http://www.vcancy.ca/login/dist/#/ and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
						
						emailSendingService.sendEmailViaNodeMailer(snap.val().email, applicantname+' has submitting a rental application', 'rentalreceive', emailData);
					});
				} else {
					var emailData = '<p>Hello, </p><p>'+applicantname+' has submitted an online rental application via Vcancy.com.Please go to this link http://www.vcancy.ca/login/dist/#/viewexternalapp/'+vm.applicationID+' to view the application.</p><p>Check out vcancy.com http://www.vcancy.ca/login/dist/#/ to automate viewing appointments and compare rental applications	 online.</p><p>For any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
					
					emailSendingService.sendEmailViaNodeMailer(vm.submitemail, applicantname+' has submitting a rental application', 'rentalreceive', emailData);
				}
					
				var emailData = '<p>Hello '+applicantname+', </p><p>Your rental application has been submitted to '+applicantemail+'.</p><p>To make changes, please log in  http://www.vcancy.ca/login/dist/#/ and go to “Applications”.</p><p>If you have any questions or suggestions please email us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';
					
				emailSendingService.sendEmailViaNodeMailer(localStorage.getItem('userEmail'), 'Rental application', 'rentalapp', emailData);
			}
			$state.go('tenantapplications');
			
			
		}
		
		vm.upload = function (file,filename) {
			var req = {
				 method: 'POST',
				 url: config.sailsBaseUrl+'fileupload/upload',
				 headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					"Access-Control-Allow-Headers": "Content-Type,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
				 },
				 data: { 
					file:file,
					filename:filename
					}
				}

			$http(req).then(function successCallback(response) {	
				console.log(response);
				console.log("Done");
			}, function errorCallback(response) {
				console.log("Fail");
			});			
        };

		
		vm.savechanges = function(){
			vm.draft = "true";
			// alert(vm.draft);
			vm.rentalAppSubmit();
		}
		
		vm.printApp = function(){
			$window.print();
		}
		
}])