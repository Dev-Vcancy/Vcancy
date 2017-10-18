'use strict';

//=================================================
// Tenant Schedule
//=================================================

vcancyApp
    .controller('rentalformCtrl', ['$scope','$firebaseAuth','$state','$rootScope','$stateParams','$window','$filter','$sce','NgTableParams',function($scope,$firebaseAuth,$state,$rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {
		
		var vm = this;
		var tenantID = localStorage.getItem('userID');
		var scheduleID = $stateParams.scheduleId;
		var applicationID = $stateParams.applicationId;
		var tenantEmail = localStorage.getItem('userEmail');
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
		
		if($stateParams.scheduleId != 0) {
			firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo($stateParams.scheduleId).once("value", function(snapshot) {	
				console.log(snapshot.val());
				$scope.$apply(function(){
					if(snapshot.val() !== null) {
						$.map(snapshot.val(),function(value,index){						
							vm.applicationID = index;
							vm.draftdata = "true";
							vm.tenantdata.tenantID = value.tenantID;
							vm.scheduledata.scheduleID = value.scheduleID;
							vm.propdata.propID = value.propID;
							
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
						});
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
			var tenantID = vm.tenantdata.tenantID;
			
			if($stateParams.scheduleId != 0){
				var scheduleID = vm.scheduledata.scheduleID;
				var propID = vm.propdata.propID;
				var externalappStatus = "";
			} else {
				var scheduleID = 0;
				var propID = 0;	
				var externalappStatus = "submit";
				if(vm.draft == "true"){
					var externalappStatus = "draft";					
				} else {
					var externalappStatus = "submit";	
				}
			}
			
			var address = vm.propdata.address;
			var rent = vm.propdata.rent;
			
			var months = vm.rentaldata.months;
			var startdate = vm.rentaldata.startdate;
			var parking = vm.rentaldata.parking;
			
			var applicantname = vm.tenantdata.tenantName;
			var applicantdob = vm.rentaldata.dob.toString();
			var applicantsinno = vm.rentaldata.sinno;
			var telwork = vm.rentaldata.telwork;
			var telhome = vm.rentaldata.telhome;
			var applicantemail = vm.tenantdata.tenantEmail;
			var appaddress = vm.rentaldata.appaddress;
			var applicantcity = vm.rentaldata.appcity;
			var maritalstatus = vm.rentaldata.maritalstatus;
			var rent_own = vm.rentaldata.rent_own;
			var live_time_at_address = vm.rentaldata.live_time;
			var rentamt = vm.rentaldata.rentamt;
			var vacantreason = vm.rentaldata.vacantreason;
			var landlordname = vm.rentaldata.landlordname;
			var landlordphone = vm.rentaldata.landlordphone;
			
			var adultapplicantname = vm.rentaldata.otherappname;
			var adultapplicantdob = vm.rentaldata.otherappdob;
			var adultapplicantsinno = vm.rentaldata.otherappsinno;
			
			var minorapplicantname = vm.rentaldata.minorappname;
			var minorapplicantdob = vm.rentaldata.minorappdob;
			var minorapplicantsinno = vm.rentaldata.minorappsinno;
			
			var pets = vm.rentaldata.pets;
			var petsdesc = vm.rentaldata.petsdesc;
			var smoking = vm.rentaldata.smoking;
			
			var appcurrentemployer = vm.rentaldata.appcurrentemployer;
			var appposition = vm.rentaldata.appposition;
			var appemployerphone = vm.rentaldata.appemployerphone;
			var appworkingduration = vm.rentaldata.appworkingduration;
			var appgrossmonthlyincome = vm.rentaldata.appgrossmonthlyincome;
			var appincometype = vm.rentaldata.appincometype;
			var appotherincome = vm.rentaldata.appotherincome;
			
			var vehiclemake = vm.rentaldata.vehiclemake;
			var vehiclemodel = vm.rentaldata.vehiclemodel;
			var vehicleyear = vm.rentaldata.vehicleyear;
			
			var emergencyname = vm.rentaldata.emergencyname;
			var emergencyphone = vm.rentaldata.emergencyphone;
			
			var refone_name = vm.rentaldata.refone_name;
			var refone_phone = vm.rentaldata.refone_phone;
			var refone_relation = vm.rentaldata.refone_relation;
			
			var reftwo_name = vm.rentaldata.reftwo_name;
			var reftwo_phone = vm.rentaldata.reftwo_phone;
			var reftwo_relation = vm.rentaldata.reftwo_relation;
			
			var otherappcurrentemployer = vm.rentaldata.otherappcurrentemployer;
			var otherappposition = vm.rentaldata.otherappposition;
			var otherappemployerphone = vm.rentaldata.otherappemployerphone;
			var otherappworkingduration = vm.rentaldata.otherappworkingduration;
			var otherappgrossmonthlyincome = vm.rentaldata.otherappgrossmonthlyincome;
			var otherappincometype = vm.rentaldata.otherappincometype;
			var otherappotherincome = vm.rentaldata.otherappotherincome;
			
			var dated = vm.rentaldata.dated.toString();
			var appsign = vm.rentaldata.appsign;
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
																
							$state.go('tenantapplications');
						}				
					})
				})
			} else {
				firebase.database().ref('submitapps/'+vm.applicationID).set({
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

					
					$state.go('tenantapplications');				
				})
			}
		}
		
		vm.rentalApp = function(){
			vm.draft = "true";
			// alert(vm.draft);
			vm.rentalAppSubmit();
		}
		
		vm.printApp = function(){
			$window.print();
		}
		
}])