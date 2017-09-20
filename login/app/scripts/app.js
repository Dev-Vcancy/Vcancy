'use strict';

/**
 * @ngdoc overview
 * @name vcancyApp
 * @description
 * # vcancyApp
 *
 * Main module of the application.
 */
var vcancyApp = angular
  .module('vcancyApp', [
    //'ngRoute'
    'ngResource',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'oc.lazyLoad',
    'nouislider',
    'ngTable',
	'firebase'
  ]);
  
vcancyApp 
 .config(function ($stateProvider, $urlRouterProvider){	
	  // Initialize Firebase
	  var config = {
		apiKey: "AIzaSyAM5ga-meRv9xYWKsCjDj-qYv3TD1ivLCA",
		authDomain: "vcancy-5e3b4.firebaseapp.com",
		databaseURL: "https://vcancy-5e3b4.firebaseio.com",
		projectId: "vcancy-5e3b4",
		storageBucket: "vcancy-5e3b4.appspot.com",
		messagingSenderId: "330892868858"
	  };
	  firebase.initializeApp(config);
	  
	  
	$urlRouterProvider.otherwise("/");
	$stateProvider			
	   .state ('login', {
			url: '/',
			controller: 'loginCtrl',
			controllerAs: 'lctrl',
			templateUrl: 'views/login.html',	
		}) 
		
		.state ('termsofuse', {
			url: '/termsofuse',
			templateUrl: 'views/termspublic.html',	
		}) 
		
		.state ('landlorddashboard', {
			url: '/landlorddboard',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/landlord.html',
			resolve: { authenticate: authenticate }
		})
		.state ('faq', {
			url: '/faq',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/faq.html',
			resolve: { authenticate: authenticate }
		}) 
		.state ('contact', {
			url: '/contact',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/contact.html',
			resolve: { authenticate: authenticate }
		}) 
		.state ('security', {
			url: '/security',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/security.html',
			resolve: { authenticate: authenticate }
		}) 
		.state ('terms', {
			url: '/terms',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/terms.html',
			resolve: { authenticate: authenticate }
		});
		
		
		function authenticate($q,$state, $timeout, $rootScope) {
			// console.log($rootScope.user.emailVerified);			
						
			if ($rootScope.user.uid) {
				if(!$rootScope.user.emailVerified){
					console.log("Please verify your email and login again");
					
					// The next bit of code is asynchronously tricky.

					$timeout(function() {
						// This code runs after the authentication promise has been rejected.
						// Go to the log-in page
						$state.go('login')
						$('.loginmsgvalidate').html('<div class="alert alert-danger alert-dismissable fade in">Your new email is not verified. Please try again after verifying your email.</div>');
					})

					// Reject the authentication promise to prevent the state from loading
					return $q.reject()
				} else {
					// Resolve the promise successfully
					return $q.when()
				}
				
				
			} else {
				  // The next bit of code is asynchronously tricky.

				  $timeout(function() {
				  // This code runs after the authentication promise has been rejected.
				  // Go to the log-in page
				  $state.go('login')
				})

				// Reject the authentication promise to prevent the state from loading
				return $q.reject()
			}
		}
  });
