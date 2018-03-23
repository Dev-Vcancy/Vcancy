'use strict';

//=================================================
// Landlord Applications
//=================================================

vcancyApp
	.controller('landlordappCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '$filter', '$sce', 'NgTableParams', '$uibModal', '_', '$q', 'emailSendingService',
		function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, $filter, $sce, NgTableParams, $uibModal, _, $q, emailSendingService) {
			$scope.oneAtATime = true;
			var vm = this;
			vm.moment = moment;
			vm.sortType = 'name';
			vm.sortReverse = false;
			var landlordID = ''
			if (localStorage.getItem('refId')) {
				landlordID = localStorage.getItem('refId')
			} else {
				landlordID = localStorage.getItem('userID');
			}
			vm.landLordID = landlordID;
			var userData = JSON.parse(localStorage.getItem('userData'));
			var userEmail = localStorage.getItem('userEmail');
			vm.userData = userData;
			vm.propcheck = [];
			vm.applyPropUsers = {};
			vm.applyPropSubmittedUsers = {};
			vm.apppropaddress = [];
			vm.apppropaddressAppl = {};
			vm.submittedAppl = [];
			vm.submittedApplUsers = [];

			vm.originalPropAddress = [];
			vm.loader = 1;
			vm.creditCheck = {
				reportType: "Both of the above $45/Report",
				forTenant: ''
			}
			vm.customRentalApplicationCheck = {};
			vm.customRentalApplicationCheck.TCData = 'You are authorized to obtaining credit checks & verifying details contained in this Application.' +

				'This unit/s is strictly NON SMOKING. This offer is subject to acceptance by the landlord/property' +
				'management company that listed the property.This application is made on the understanding that no ' +
				'betterments will be provided to the Rental Unit except those which may be specifically requested in' +
				'this Application and agreed to in writing by the Landlord and specified in a tenancy agreement.' +

				'It is understood that this application will not be processed unless fully completed.' +

				'If the landlord/property management company accepts this Application, we will sign a Fixed ' +
				'Term Tenancy Agreement at the offices of the property management company or in person with' +
				'the landlord and pay the security deposit. The Rental Unit will not be considered rented' +
				'until the Fixed Term Tenancy Agreement is signed by the Tenant and the Landlord.' +

				'We will ensure that the collection, use, disclosure and retention of information will comply with ' +
				'the provisions of the Freedom of information and Protection of Privacy Act. ' +
				'Information will be collected and used only as necessary and for the intended purpose and will ' +
				'not be disclosed as required by law.' +

				'I hereby state that the information contained herein is true and I authorize my References' +
				'as listed above to release information regarding my employment and/or past/current tenancies.' +

				'Tenants are not chosen on a first come – first served basis. We choose the most suitable ' +
				'application for the unit at our sole discretion. This application form is to be used only' +
				'in the interested of the owner of the rental unit.';
			// Function to generate Random Id
			function generateToken() {
				var result = '',
					length = 6,
					chars = 'ABCEDFGHIJKLMNOPQRSTUVWXYZ0123456789';

				for (var i = 0; i < length; i++)
					result += chars[Math.floor(Math.random() * chars.length)];

				return result;
			}

			vm.questionDropDown = [
				{ id: 'WKRX6Q', label: 'What is your profession?', isChecked: true },
				{ id: 'MV5SML', label: 'Do you have Pets? Provide details', isChecked: true },
				{ id: 'N1F5MO', label: 'Are you able to provide references?', isChecked: false },
				{ id: 'OU489L', label: 'Why are you moving?', isChecked: false },
				{ id: 'U0G6V8', label: 'Tell me a bit about yourself', isChecked: true },
				{ id: 'A9OG32', label: 'No. of Applicants', isChecked: true },
				{ id: 'UH7JZS', label: 'Do you smoke?', isChecked: true },
				{ id: 'ZGJQ60', label: 'Move-in date', isChecked: true },
			];

			vm.filters = {
				options: [],
			};

			vm.companyDetail = function () {
				return vm.userData.companyname + ' ' + (vm.userData.contact || '')
			}

			vm.defaultRentalApplicationCheck = {
				'PAPPD': true,
				'CADDR': true,
				'PADDR': false,
				'AAPPD': false,
				'AAPP1': false,
				'AAPP2': false,
				'ESIV': true,
				'ESIV1': true,
				'VI': false,
				'EC': false,
				'EC1': false,
				'REF': true,
				'REF1': true,
				'REF2': false,
				'UD': true,
				'UDAAPP': false,
				'TC': true,
				'TCData': vm.customRentalApplicationCheck.TCData,
				'companyLogo': userData ? userData.companylogo : '',
				'companyDetails': vm.companyDetail()
			}

			function refreshCustomRentalApplicationCheck() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.customRentalApplicationCheck) {
					if (userData.customRentalApplicationCheck && !userData.customRentalApplicationCheck.TCData) {
						userData.customRentalApplicationCheck.TCData = vm.customRentalApplicationCheck.TCData;
					}
					if (!userData.customRentalApplicationCheck.companyLogo) {
						userData.customRentalApplicationCheck.companyLogo = userData.companylogo || vm.customRentalApplicationCheck.companyLogo;
					}
					if (!userData.customRentalApplicationCheck.companyDetails) {
						userData.customRentalApplicationCheck.companyDetails = vm.companyDetail();
					}
					vm.customRentalApplicationCheck = userData.customRentalApplicationCheck;
				} else {
					vm.customRentalApplicationCheck = angular.copy(vm.defaultRentalApplicationCheck);
				}
			}
			refreshCustomRentalApplicationCheck();

			function refreshScreeningQuestions() {
				userData = JSON.parse(localStorage.getItem('userData'));
				vm.userData = userData;
				if (userData && userData.screeningQuestions && userData.screeningQuestions.length !== 0) {
					vm.screeningQuestions = userData.screeningQuestions;
				} else {
					vm.screeningQuestions = angular.copy(vm.questionDropDown);
				}
			}
			refreshScreeningQuestions();

			vm.getUsers = function () {

				if (vm.apppropaddressList) {
					vm.loader = 1;
					var promises = [];
					_.map(vm.apppropaddressList, function (value, key) {
						var promiseObj = firebase.database().ref('users/' + value.tenantID).once("value");
						promises.push(promiseObj);
					});
					$q.all(promises).then(function (data) {
						var usersData = {};
						data.forEach(function (dataObj) {
							usersData[dataObj.key] = dataObj.val();
						});
						vm.applyPropUsers = usersData;
						_.forEach(vm.submittedApplUsers, function (value, index) {
							if (usersData[value]) {
								vm.applyPropSubmittedUsers[value] = usersData[value];
							}
						});
						vm.apppropaddress = vm.apppropaddressList;
						// console.log(vm.apppropaddressList)
						vm.loader = 0;
					});
				}
			}

			vm.getProperty = function () {
				vm.loader = 1;
				var propdbObj = firebase.database().ref('properties/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					if (snapshot.val()) {
						vm.properties = snapshot.val();
					}
					vm.loader = 0;
				});
			};

			vm.getApplyProp = function () {
				vm.loader = 1;
				vm.apppropaddress = {};
				var propdbObj = firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					if (snapshot.val()) {
						$scope.$apply(function () {

							vm.apppropaddressList = snapshot.val();
							_.forEach(vm.apppropaddressList, function (value, key) {
								value.key = key;
							});
							// vm.getUsers();
							console.log(vm.apppropaddressList)
							vm.originalPropAddress = angular.copy(snapshot.val());
							vm.loader = 1;
							var promises = [];
							_.map(vm.apppropaddressList, function (value, key) {
								if (value.schedulestatus == 'submitted') {
									vm.submittedApplUsers.push(value.tenantID);
									var promiseObj = firebase.database().ref('submitapps/').limitToLast(1).orderByChild("scheduleID").equalTo(key).once("value");
									promises.push(promiseObj);
								}
							});
							vm.submittedApplUsers = _.uniq(vm.submittedApplUsers);

							$q.all(promises).then(function (data) {
								var usersData = {};
								data.forEach(function (dataObj) {
									if (dataObj.val()) {
										_.forEach(dataObj.val(), function (_value, _key) {
											vm.apppropaddressAppl[_key] = _value;

											vm.submittedAppl.push(_value)
											_.forEach(vm.apppropaddressList, function (list, key) {
												if (key === _value.scheduleID) {
													list.applyedRentalForm = _value;
													vm.originalPropAddress[key].applyedRentalForm = _value;
												};
											});
										});
									}
									vm.getUsers();
								});
								vm.loader = 0;
							});
						});
					}
					$scope.$apply(function () {
						vm.loader = 0;
					});
				});
			};


			vm.getUserName = function (id, value, key) {
				if (!vm.applyPropUsers[id]) {
					return value.name || '-';
				}
				if (key === 'email') {
					return vm.applyPropUsers[id][key] || '-';
				}
				return ((vm.applyPropUsers[id].firstname || '') + ' ' + (vm.applyPropUsers[id].lastname || '')) || '-';
			}

			vm.changeSort = function (key) {
				// $scope.$apply(function() {
				// $timeout	
				vm.sortType = key;
				vm.sortReverse = !vm.sortReverse;
				// });
			}

			$scope.formatDay = function (key) {
				return moment(key, 'MM/DD/YYYY').format('ddd')
			};

			$scope.formatDate = function (key) {
				return moment(key, 'MM/DD/YYYY').format('MMM DD')
			};

			vm.init = function () {
				vm.getProperty();
				vm.getApplyProp();
			};

			vm.init();

			vm.openPrescremingQuestions = function () {
				vm.prescremingQuestion = $uibModal.open({
					templateUrl: 'prescremingquestions.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};
			vm.filterData = function (forProperty) {
				var properties = angular.copy(vm.originalPropAddress);
				vm.apppropaddress = properties;
				if (vm.filters.property) {
					var obj = {};
					_.filter(properties, function (value, key) {
						if (value.propID == vm.filters.property) {
							obj[key] = value;
						}
					});
					vm.apppropaddress = obj;
				}
				if (forProperty) {
					vm.filters.unit = [];
				}
				if (vm.filters.unit && vm.filters.unit.length > 0) {
					var unitItems = {};
					var unitIds = _.reduce(vm.filters.unit, function (previousValue, currentValue, key) {
						if (currentValue.unit) {
							previousValue.push(parseInt(currentValue.unit));
						}
						return previousValue;
					}, []);
					_.filter(properties, function (value, key) {
						if (value.propID == vm.filters.property && unitIds.includes(parseInt(value.unitID))) {
							unitItems[key] = value;
						}
					});
					vm.apppropaddress = unitItems;
					return
				}

				vm.apppropaddress = obj;
			}

			vm.selectAllQuestions = function () {
				vm.filters.options = angular.copy(vm.screeningQuestions);
			}

			vm.clearAllFilters = function () {
				vm.filters = {
					options: []
				}
				vm.apppropaddress = angular.copy(vm.originalPropAddress);
			}

			vm.getApplicationLink = function (key) {
				var data;
				_.forEach(vm.apppropaddressAppl, function (_value, _key) {
					if (_value.scheduleID == key) {
						data = _key;
						return false;
					}
				});
				if (data) {
					var host = window.location.origin;
					if (host.indexOf('localhost') > -1) {
						host = host + '/#/viewapplication/' + data;
					} else {
						host = host + '/login/#/viewapplication/' + data;
					}
					return host;
				}
				return false;
			}

			vm.getRentalField = function (key, field) {
				let data;
				_.forEach(vm.apppropaddressAppl, function (_value, _key) {
					if (_value.scheduleID == key) {
						data = _value;
						return false;
					}
				});
				if (data) {
					return data[field]
				} else {
					return '-'
				}
			}
			vm.customQuestion = null;
			vm.addCustomQuestion = function () {
				if (!vm.customQuestion) {
					return;
				}
				var data = {
					label: vm.customQuestion,
					id: generateToken(),
					isChecked: false
				}

				vm.screeningQuestions.push(data);
				vm.customQuestion = null;
			}

			vm.saveScreeningQuestions = function () {
				vm.loader = 1;
				var ques = angular.copy(vm.screeningQuestions);
				_.omit(ques, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					screeningQuestions: ques
				}).then(function () {
					userData.screeningQuestions = ques;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshScreeningQuestions();
					vm.loader = 0;
					vm.prescremingQuestion.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			vm.saveCustomRentalApplicationCheck = function () {
				vm.loader = 1;
				var customChecks = angular.copy(vm.customRentalApplicationCheck);
				console.log('customChecks', customChecks);
				_.omit(customChecks, '$$hashKey');
				firebase.database().ref('users/' + this.landLordID).update({
					customRentalApplicationCheck: customChecks
				}).then(function () {
					userData.customRentalApplicationCheck = customChecks;
					localStorage.setItem('userData', JSON.stringify(userData));
					refreshCustomRentalApplicationCheck();
					vm.loader = 0;
					vm.customrentalapp.close();
				}, function (error) {
					vm.loader = 0;
					return false;
				});
			}

			$scope.uploadDetailsImages = function (event) {
				var file = event.target.files[0];
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
				var filename = moment().format('YYYYMMDDHHmmss') + file.name;
				filename = filename.replace(/\s/g, '');

				if (file.size > 3145728) {
					swal({
						title: "Error!",
						text: 'File size should be 3 MB or less.',
						type: "error",
					});
					return false;
				} else if (file.type.indexOf('image') === -1) {
					swal({
						title: "Error!",
						text: 'Only files are accepted.',
						type: "error",
					});
					return false;
				}

				var params = {
					Key: 'company-logo/' + filename,
					ContentType: file.type,
					Body: file,
					StorageClass: "STANDARD_IA",
					ACL: 'public-read'
				};

				bucket.upload(params).on('httpUploadProgress', function (evt) { })
					.send(function (err, data) {
						if (data && data.Location) {
							$scope.$apply(function () {
								vm.customRentalApplicationCheck.companyLogo = data.Location;
							});
							// });
							// firebase.database().ref('users/' + landLordID).update(vm.userData).then(function () {
							//   vm.opensuccesssweet("Profile Updated successfully!");
							// }, function (error) {

							//   vm.openerrorsweet("Profile Not Updated! Try again!");
							//   return false;
							// });
						}
					});
			}
			vm.sortBy = {};
			vm.opencustomrentalapp = function () {
				vm.customrentalapp = $uibModal.open({
					templateUrl: 'customrentalapp.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};

			vm.deleteQuestionById = function (id) {
				var index = vm.screeningQuestions.findIndex(function (ques) {
					if (ques.id == id) return true;
				});
				vm.screeningQuestions.splice(index, 1);
			};


			vm.openruncreditcriminalcheck = function () {
				vm.runcreditcriminalcheck = $uibModal.open({
					templateUrl: 'runcreditcriminalcheck.html',
					backdrop: 'static',
					size: 'lg',
					scope: $scope
				});
			};

			$scope.closePrescreeningModal = function () {
				vm.prescremingQuestion.close();
			}

			$scope.closecustomrentalappModal = function () {
				vm.customrentalapp.close();
			}

			$scope.closeruncreditcriminalcheckModal = function () {
				vm.runcreditcriminalcheck.close();
				vm.creditCheck = {
					reportType: "Both of the above $45/Report",
					forTenant: ''
				}
			}

			$scope.submitCreditCheck = function () {
				var tenantData = vm.applyPropUsers[vm.creditCheck.forTenant];
				if (!tenantData) {
					return;
				}
				swal({
					title: "Are you sure?",
					text: "Your account will be charged with the amount specified.",
					type: "info",
					showCancelButton: true,
					confirmButtonClass: "bgm-teal",
					confirmButtonText: "Yes",
					closeOnConfirm: false
				},
					function () {
						var userName = '';
						if (userData) {
							userName = userData.firstname + ' ' + (userData.lastname || '');
						}
						var tenantUserName = tenantData.firstname + ' ' + (tenantData.lastname || '');
						var emailData = '<p>Hello, </p><p>Landlord - ' + userName + ' (' + userEmail + ') has requested credit report of tenant - ' + tenantUserName + ' (' + tenantData.email + ') for type - ' + vm.creditCheck.reportType + '</p>';
						var toEmail = 'creditrequest@vcancy.com';
						emailSendingService.sendEmailViaNodeMailer(toEmail, 'Landlord request for Credit/Criminal Report', 'Request Credit?criminal Check Report', emailData);
						swal("", "Your request has been submitted successfully!", "success");
						var requestData = {
							tenantID: vm.creditCheck.forTenant,
							tenantEmail: tenantData.email,
							landlordID: landlordID,
							landlordEmail: userEmail,
							requestType: vm.creditCheck.reportType,
							requestedOn: moment().format('x'),
							status: 'PENDING'
						}
						firebase.database().ref('credit_report_request/').push().set(requestData);
						$scope.closeruncreditcriminalcheckModal();
					});

			}

			vm.orderBySalary = function (key) {
				if (vm.sortBy[key] == undefined) {
					vm.sortBy = {};
				}
				vm.sortBy[key] = !vm.sortBy[key];
				var unsortedArray = angular.copy(vm.apppropaddress);
				if (vm.sortBy[key]) {
					var sorted = _.sortBy(unsortedArray, [key]);
				} else {
					var sorted = _.reverse(unsortedArray, [key]);
				}

				vm.apppropaddress = sorted;
			}
			vm.tablefilterdata = function (propID = '') {
				if (propID != '') {
					vm.propcheck[propID] = !vm.propcheck[propID];
				}
				vm.loader = 1;
				firebase.database().ref('applyprop/').orderByChild("landlordID").equalTo(landlordID).once("value", function (snapshot) {
					// console.log(snapshot.val())
					$scope.$apply(function () {
						if (snapshot.val() != null) {
							$.map(snapshot.val(), function (value, index) {
								if (vm.apppropaddress.findIndex(x => x.propID == value.propID) == -1 && value.schedulestatus == "submitted") {
									vm.apppropaddress.push({ propID: value.propID, address: value.address, units: value.units });
									vm.propcheck[value.propID] = true;
								}
							});
						}
						vm.submitappsdata = [];

						if (snapshot.val() != null) {
							vm.submittedappsavail = 0;
							//to map the object to array
							vm.submitappsdata = $.map(snapshot.val(), function (value, index) {
								if (vm.propcheck[value.propID] == true || propID == '') {
									if (value.schedulestatus == "submitted") {
										vm.submittedappsavail = 1;
										return [{ scheduleID: index, name: value.name, age: value.age, profession: value.jobtitle, schedulestatus: value.schedulestatus }];
									}
								}
							});

							angular.forEach(vm.submitappsdata, function (schedule, key) {
								firebase.database().ref('submitapps/').orderByChild("scheduleID").equalTo(schedule.scheduleID).once("value", function (snapshot) {
									$scope.$apply(function () {
										if (snapshot.val()) {
											$.map(snapshot.val(), function (value, index) {
												vm.submitappsdata[key].applicationID = index;
												vm.submitappsdata[key].pets = value.pets;
												vm.submitappsdata[key].maritalstatus = value.maritalstatus;
												vm.submitappsdata[key].appno = value.applicantsno;
												firebase.database().ref('submitappapplicants/').orderByChild("applicationID").equalTo(index).once("value", function (snap) {
													$scope.$apply(function () {
														if (snap.val()) {
															$.map(snap.val(), function (v, k) {
																// console.log(v);
																vm.submitappsdata[key].salary = v.mainapplicant.appgrossmonthlyincome;
															});
														}
													});
												});
											});
										}
									});
								});
							});

							vm.submitappsextracols = [
								{ field: "applicationID", title: "Credit Score", show: true }
							];


						} else {
							vm.submitappsdata = [{ scheduleID: '', name: '', age: '', profession: '', salary: '', pets: '', maritalstatus: '', appno: '', schedulestatus: '' }];

							vm.submittedappsavail = 0;
						}

						
						vm.submitappscols = [
							{ field: "name", title: "Name", sortable: "name", show: true },
							{ field: "age", title: "Age", sortable: "age", show: true },
							{ field: "profession", title: "Job Title", sortable: "profession", show: true },
							{ field: "salary", title: "Salary", sortable: "salary", show: true },
							{ field: "pets", title: "Pets", sortable: "pets", show: true },
							{ field: "maritalstatus", title: "Marital Status", sortable: "maritalstatus", show: true },
							{ field: "appno", title: "No of Applicants", sortable: "appno", show: true },
						];

						vm.loader = 0;

						//Sorting
						vm.submitappsSorting = new NgTableParams({
							sorting: { name: 'asc' }
						},

							{
								dataset: vm.submitappsdata
								/*}, {
									total: vm.submitappsdata.length, // length of data
									getData: function($defer, params) {
										// console.log(params);
										// use build-in angular filter
										var orderedData = params.sorting() ? $filter('orderBy')(vm.submitappsdata, params.orderBy()) : vm.submitappsdata;
							
										$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
									}*/
								// dataset: vm.submitappsdata
							})
					});
				});

			}
			// vm.tablefilterdata();

			vm.deleteApplyProp = function (key, status) {
				var statusToChange = 'cancelled';
				var message = "This will cancel the schedule."
				var buttonText = "Yes";

				if (status === 'cancelled') {
					statusToChange = 'removed';
					message = "This will delete the schedule from the system.";
					buttonText = "Delete";
				}

				swal({
					title: "Are you sure?",
					text: message,
					type: "warning",
					showCancelButton: true,
					confirmButtonClass: "btn-danger",
					confirmButtonText: buttonText,
					closeOnConfirm: true
				}, function () {
					firebase.database().ref('applyprop/' + key).update({
						schedulestatus: statusToChange
					}).then(function () {
						vm.getApplyProp();
					})
						.catch(function (err) {
							console.error('ERROR', err);
							swal("", "There was error deleteing the schedule.", "error");
						});

				});
			}
		}])