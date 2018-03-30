'use strict';

//=================================================
// View Tenant Application
//=================================================

vcancyApp
	.controller('adminviewappCtrl', ['$scope', '$timeout', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', function ($scope, $timeout, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams) {

		var vm = this;
		// var tenantID = localStorage.getItem('userID');
		var applicationID = $stateParams.appID;
		// var tenantEmail = localStorage.getItem('userEmail');

		vm.publicappview = $state.current.name == "viewexternalapplication" ? "1" : "0";
		vm.isLoggedIn = ($state.current.name != "viewexternalapplication") && localStorage.getItem('userEmail');

		vm.adult = [];
		vm.minor = [];
		vm.rentaldata = [];

		// DATEPICKER
		vm.today = function () {
			vm.dt = new Date();
		};
		vm.today();

		vm.toggleMin = function () {
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


		firebase.database().ref('submitapps/' + applicationID).once("value", function (snapshot) {
			console.log(snapshot.val());
			$scope.$apply(function () {
				if (snapshot.val()) {
					var value = snapshot.val();
					console.log(value);
					vm.TCData = value.TCData;
					vm.customRentalApplicationCheck = value.customRentalApplicationCheck;
					vm.rentaldata.tenantID = value.tenantID;
					vm.rentaldata.scheduleID = value.scheduleID;
					vm.rentaldata.propID = value.propID;

					vm.rentaldata.landlordID = value.landlordID;

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
					
					console.log(vm.rentaldata);

					firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(applicationID).once("value", function (snap) {
						$scope.$apply(function () {
							if (snap.val()) {
								$.map(snap.val(), function (v, k) {
									console.log(v);
									vm.rentaldata.tenantName = v.mainapplicant.applicantname;
									vm.rentaldata.dob = new Date(v.mainapplicant.applicantdob);
									vm.rentaldata.sinno = v.mainapplicant.applicantsinno;
									vm.rentaldata.appcurrentemployer = v.mainapplicant.appcurrentemployer;
									vm.rentaldata.appposition = v.mainapplicant.appposition;
									vm.rentaldata.appemployerphone = v.mainapplicant.appemployerphone;
									vm.rentaldata.appworkingduration = v.mainapplicant.appworkingduration;
									vm.rentaldata.appgrossmonthlyincome = v.mainapplicant.appgrossmonthlyincome;
									vm.rentaldata.appincometype = v.mainapplicant.appincometype;
									vm.rentaldata.appotherincome = v.mainapplicant.appotherincome;
									vm.rentaldata.appsign = v.mainapplicant.appsign;

									vm.rentaldata.minorappname = [];
									vm.rentaldata.minorappdob = [];
									vm.rentaldata.minorappsinno = [];

									if (v.minors != undefined) {
										angular.forEach(v.minors, function (value, key) {
											vm.minor.push(key);
											vm.rentaldata.minorappname.push(value.minorapplicantname);
											vm.rentaldata.minorappdob.push(new Date(value.minorapplicantdob));
											vm.rentaldata.minorappsinno.push(value.minorapplicantsinno);
										});
									}
									vm.rentaldata.otherappname = [];
									vm.rentaldata.otherappdob = [];
									vm.rentaldata.otherappsinno = [];
									vm.rentaldata.otherappcurrentemployer = [];
									vm.rentaldata.otherappposition = [];
									vm.rentaldata.otherappemployerphone = [];
									vm.rentaldata.otherappworkingduration = [];
									vm.rentaldata.otherappgrossmonthlyincome = [];
									vm.rentaldata.otherappincometype = [];
									vm.rentaldata.otherappotherincome = [];
									vm.rentaldata.otherappsign = [];

									if (v.otherapplicants != undefined) {
										angular.forEach(v.otherapplicants, function (value, key) {
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
									}
								});
							}
						});
					});
					if (vm.rentaldata.landlordID) {
						firebase.database().ref('users/' + vm.rentaldata.landlordID).once("value", function (snap) {
							$scope.$apply(function() {
								vm.landlordData = snap.val();
							});
						});
					}
				}
			});
		});

		vm.viewFile = function (location) {
			if (!location) {
				return;
			}
			var _params = {
				Bucket: 'vcancy-final',
				Key: location.split(`https://vcancy-final.s3.ca-central-1.amazonaws.com/`)[1],
				Expires: 60 * 5
			}
			AWS.config.update({
				accessKeyId: 'AKIAIYONIKRYTFNEPDSA',
				secretAccessKey: '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'
			});
			AWS.config.region = 'ca-central-1';
			var bucket = new AWS.S3({
				params: {
					Bucket: 'vcancy-final'
				}
			});

			bucket.getSignedUrl('getObject', _params, function (err, data) {
				if (err) return console.log(err, err.stack); // an error occurred

				// var type = 'application/pdf';
				var extension = location.substring(location.lastIndexOf('.'));
				// var file = new Blob([data], { type: 'application/pdf' });
				// saveAs(file, 'filename.pdf');
				// var url = URL.createObjectURL(new Blob([data]));
				var a = document.createElement('a');
				a.href = data;
				a.download = location.substr(location.lastIndexOf('/') + 1);
				a.target = '_blank';
				a.click();
			});
		}

		vm.printApp = function () {
			vm.printMode = true;
			$timeout(function(){
				$window.print();
			}, 1000);
			$timeout(function(){
				vm.printMode = false;
			}, 3000);
			// vm.printMode = false;
		}
	}])