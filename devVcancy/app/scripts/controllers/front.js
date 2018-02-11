'use strict';

//=================================================
// LOGIN, REGISTER
//=================================================

vcancyApp.controller('loginCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$location', '$window', function ($scope, $firebaseAuth, $state, $rootScope, $location, $window) {

	var vm = this;
	//Status
	vm.login = 1;
	vm.register = 0;
	vm.forgot = 0;
	$rootScope.invalid = '';
	$rootScope.error = '';
	$rootScope.success = '';

	vm.loginUser = function ($user) {
		var email = $user.email;
		var password = $user.password;

		var authObj = $firebaseAuth();
		authObj.$signInWithEmailAndPassword(email, password).then(function (firebaseUser) {
			//alert(JSON.stringify(firebase.auth().currentUser));
			if (firebase.auth().currentUser != null) {
				localStorage.setItem('userID', firebase.auth().currentUser.uid);
				localStorage.setItem('userEmail', firebase.auth().currentUser.email);
				localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
				localStorage.setItem('password', password);

			}

			if (firebase.auth().currentUser != null) {
				$rootScope.uid = firebase.auth().currentUser.uid;
				$rootScope.userEmail = firebase.auth().currentUser.email;
				$rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
				$rootScope.password = firebase.auth().currentUser.password;

			}

			// if (!firebase.auth().currentUser.emailVerified) {
			// 	localStorage.setItem('RegEmail', email);
			// 	localStorage.setItem('RegPass', password);
			// 	$rootScope.error = "We've sent you an account confirmation email. Please check your email and Log in.";
			// 	$rootScope.invalid = 'mail';
			// 	authObj.$signOut();
			// 	$rootScope.user = null;
			// 	localStorage.clear();
			// 	$state.go('login');
			// } else {
			firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function (userdata) {
				if (userdata.val().usertype === 0) {
					$rootScope.usertype = 0;
					localStorage.setItem('usertype', 0);
					console.log("Signed in as tenant:", firebaseUser.uid);

					if (localStorage.getItem('applyhiturl') != undefined && localStorage.getItem('applyhiturl').indexOf("applyproperty") !== -1) {
						window.location.href = localStorage.getItem('applyhiturl');
						localStorage.setItem('applyhiturl', '');
					} else {
						$state.go("tenantdashboard");
					}
				} else {
					console.log(userdata.val());
					$rootScope.usertype = 1;
					localStorage.setItem('usertype', 1);
					console.log("Signed in as landlord:", firebaseUser.uid);
					if(userdata.val().refId){
						localStorage.setItem('refId', userdata.val().refId);
					}
					$state.go("landlorddashboard");
				}
			});
			// }

		}).catch(function (error) {
			//console.log(error);
			if (error.message) {

				if (error.message == "The email address is badly formatted.") {
					$rootScope.error = "Invalid Email.";
				} else {
					$rootScope.error = error.message;
				}

			}

			if (error.code === "auth/invalid-email") {
				$rootScope.invalid = 'loginemail';

			} else if (error.code === "auth/wrong-password") {
				$rootScope.invalid = 'loginpwd';
			} else if (error.code === "auth/user-not-found") {
				$rootScope.invalid = 'all';
			} else {
				console.log('hre');
				$rootScope.invalid = '';
			}
		});

	}

	vm.google = function () {

		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('profile');
		provider.addScope('email');
		firebase.auth().signInWithPopup(provider).then(function (result) {
			// This gives you a Google Access Token.
			var token = result.credential.accessToken;
			console.log("token");
			console.log(token);
			// The signed-in user info.
			var user = result.user;
			console.log("User");
			console.log(user);
		});
	}

	vm.facebook = function () {

		var provider = new firebase.auth.FacebookAuthProvider();
		provider.addScope('user_birthday');

		firebase.auth().signInWithPopup(provider).then(function (result) {
			var token = result.credential.accessToken;
			console.log("token");
			console.log(token);
			// The signed-in user info.
			var user = result.user;
			console.log("User");
			console.log(user);
			// ...
		}).catch(function (error) {
			if (error.message) {
				IN.User.logout();
				if (error.message == "The email address is badly formatted.") {
					$rootScope.error = "Invalid Email.";
					$rootScope.success = '';
				} else {
					$rootScope.error = error.message;
					$rootScope.success = '';
				}
				//$rootScope.error = error.message;

			}

			if (error.code === "auth/invalid-email") {
				$rootScope.invalid = 'regemail';
			} else if (error.code === "auth/weak-password") {
				$rootScope.invalid = 'regpwd';
			} else if (error.code === "auth/email-already-in-use") {
				$rootScope.invalid = 'regpwd';
			} else {
				$rootScope.invalid = '';
			}
		});
	}
	$window.onload = function () {
		IN.Event.on(IN, "auth", vm.getProfileData);
	};

	vm.getProfileData = function () {
		IN.API.Profile("me").fields("id", "first-name", "last-name", "headline", "location", "picture-url", "public-profile-url", "email-address").result(vm.displayProfileData).error(vm.onError);
	}
	vm.displayProfileData = function (data) {
		var user = data.values[0];

		vm.saveUserData(user);
	}

	vm.saveUserData = function (userData) {

		var id = userData.id;
		var email = userData.emailAddress;
		var firstName = userData.firstName;
		var lastName = userData.lastName;
		var password = "secret@1234";
		var reguserObj = $firebaseAuth();

		reguserObj.$createUserWithEmailAndPassword(email, password).then(function (firebaseUser) {
			console.log(firebaseUser)
		}).catch(function (error) {
			console.log(error);
			if (error.message) {
				IN.User.logout();
				if (error.message == "The email address is badly formatted.") {
					$rootScope.error = "Invalid Email.";
					$rootScope.success = '';
				} else {
					$rootScope.error = error.message;
					$rootScope.success = '';
				}
				//$rootScope.error = error.message;

			}

			if (error.code === "auth/invalid-email") {
				$rootScope.invalid = 'regemail';
			} else if (error.code === "auth/weak-password") {
				$rootScope.invalid = 'regpwd';
			} else if (error.code === "auth/email-already-in-use") {
				$rootScope.invalid = 'regpwd';
			} else {
				$rootScope.invalid = '';
			}
		});

	}

	vm.onError = function (error) {
		console.log(error);
	}

	vm.logout = function () {
		IN.User.logout(vm.removeProfileData);
	}

	vm.removeProfileData = function () {

	}

	vm.registerUser = function (reguser) {
		var first = reguser.first;
		var last = reguser.last;
		var email = reguser.email;
		var pass = reguser.pass;
		var cpass = reguser.cpass;
		var usertype = reguser.usertype;
		$rootScope.invalid = '';
		$rootScope.success = '';
		$rootScope.error = '';

		var reguserObj = $firebaseAuth();

		if (cpass === pass) {
			reguserObj.$createUserWithEmailAndPassword(email, pass)
				.then(function (firebaseUser) {
					localStorage.setItem('RegEmail', email);
					localStorage.setItem('RegPass', pass);

					// $scope.$apply(function(){
					firebaseUser.sendEmailVerification().then(function () {
						// console.log("Email Sent");
					}).catch(function (error) {
						// console.log("Error in sending email"+error);
					});

					var reguserdbObj = firebase.database();
					reguserdbObj.ref('users/' + firebaseUser.uid).set({
						firstname: first,
						lastname: last,
						usertype: usertype,
						email: email,
						isadded: 1,
						iscancelshow: 1,
						iscreditcheck: 1,
						iscriminalreport: 1,
						isexpiresoon: 1,
						ispropertydelete: 1,
						isrentalsubmit: 1,
						isshowingtime: 1,
						profilepic: 1,
						companyname: ""
					});

					if (usertype == 0) {
						var emailData = '<p>Hello ' + firstname + ', </p><p>Thanks for signing up for Vcancy!</p><p>We’ve built Vcancy from the heart to help renters find a place faster and standout from the crowd. You can schedule multiple same-day viewings and submit your rental applications online. </p><p>Our team is working hard to make the rental process seamless and automated. We would love to have your feedback on our the web-app. You can reach us at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

						// Send Email
						emailSendingService.sendEmailViaNodeMailer(email, 'Welcome to Vcancy', 'Welcome', emailData);
					}
					if (usertype == 1) {
						var emailData = '<p>Hello, </p><p>Thanks for signing up!</p><p>We’ve built Vcancy from the heart to help busy landlords and property management companies find the best tenants faster by saving them time and labour costs. </p><p>We are always working hard make the tenant onboarding process seamless and automated. Please feel free to reach out to us if you have any suggestions about the web-app at support@vcancy.com</p><p>Thanks,</p><p>Team Vcancy</p>';

						// Send Email
						emailSendingService.sendEmailViaNodeMailer(email, 'Welcome to Vcancy', 'Welcome', emailData);
					}

					$rootScope.success = "We've sent you an account confirmation email. Please check your email and Log in. ";
					$rootScope.error = '';
					reguser.first = '';
					reguser.last = '';
					reguser.email = '';
					reguser.pass = '';
					reguser.cpass = '';
					reguser.usertype = -1;
					vm.reguser = reguser;

					// When apply property url hit direct login and redirect to apply link url on signup successful
					if (localStorage.getItem('applyhiturl') != undefined && localStorage.getItem('applyhiturl').indexOf("applyproperty") !== -1 && usertype === 0) {
						var authObj = $firebaseAuth();
						authObj.$signInWithEmailAndPassword(email, pass).then(function (firebaseUser) {
							if (firebase.auth().currentUser != null) {
								localStorage.setItem('userID', firebase.auth().currentUser.uid);
								localStorage.setItem('userEmail', firebase.auth().currentUser.email);
								localStorage.setItem('userEmailVerified', firebase.auth().currentUser.emailVerified);
							}

							if (firebase.auth().currentUser != null) {
								$rootScope.uid = firebase.auth().currentUser.uid;
								$rootScope.userEmail = firebase.auth().currentUser.email;
								$rootScope.emailVerified = firebase.auth().currentUser.emailVerified;
							}

							firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function (userdata) {
								if (userdata.val().usertype === 0) {
									$rootScope.usertype = 0;
									localStorage.setItem('usertype', 0);
									console.log("Signed in as tenant:", firebaseUser.uid);

									window.location.href = localStorage.getItem('applyhiturl');
									localStorage.setItem('applyhiturl', '');
								}
							});
						});
					}
					// Ends Here
					// });
				}).catch(function (error) {
					//console.log(error);
					if (error.message) {
						if (error.message == "The email address is badly formatted.") {
							$rootScope.error = "Invalid Email.";
							$rootScope.success = '';
						} else {
							$rootScope.error = error.message;
							$rootScope.success = '';
						}
						//$rootScope.error = error.message;

					}

					if (error.code === "auth/invalid-email") {
						$rootScope.invalid = 'regemail';
					} else if (error.code === "auth/weak-password") {
						$rootScope.invalid = 'regpwd';
					} else {
						$rootScope.invalid = '';
					}
				});
		} else {
			$rootScope.invalid = 'regcpwd';
			$rootScope.error = 'Passwords don’t match.';
			$rootScope.success = '';
		}

		vm.reguser = reguser;
	}

	vm.forgotpwdmail = function (forgot) {
		var email = forgot.email;
		$rootScope.invalid = '';
		$rootScope.success = '';
		$rootScope.error = '';

		var forgotuserObj = $firebaseAuth();
		forgotuserObj.$sendPasswordResetEmail(email).then(function () {
			$rootScope.success = 'Password reset email sent to your inbox. Please check your email.';
			$rootScope.error = '';
			vm.forgotuser.email = '';
		}).catch(function (error) {
			console.error("Error: ", error);
			if (error.message) {
				$rootScope.error = error.message;
				$rootScope.success = '';
			}
		});

	}

	vm.resendmail = function () {
		$rootScope.success = 'Confirmation email resent';
		var email = localStorage.getItem('RegEmail');
		var pass = localStorage.getItem('RegPass');
		if (email != null && pass != null) {
			firebase.auth().signInWithEmailAndPassword(email, pass)
				.then(function (firebaseUser) {
					// Success 
					firebaseUser.sendEmailVerification().then(function () {
						console.log("Email Sent");
						$rootScope.success = 'Confirmation email resent';
						//$rootScope.success = 'Sent mail in your mail box please check your Email';
						$rootScope.error = '';

					}).catch(function (error) {
						console.log("Error in sending email" + error);
					});
				})
				.catch(function (error) {
					console.log(error);
					// Error Handling
				});

		}
	}

}]);
