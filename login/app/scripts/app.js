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
	'firebase',
	'ngclipboard'
  ]);
  
vcancyApp  
 .directive('loginHeader', function() {
  return {
    controller: 'headerCtrl',
	controllerAs: 'hctrl',
	templateUrl: 'views/template/header.html',
  };
}); 

vcancyApp  
 .directive('loginSidebar', function() {
  return {
    controller: 'maCtrl',
	controllerAs: 'mactrl',
	templateUrl: 'views/template/sidebar-left.html',
  };
}); 
  
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
        .state ('tenantdashboard', {
			url: '/tenantdashboard',
			controller: 'maCtrl',
			controllerAs: 'mactrl',
			templateUrl: 'views/tenant.html',
			resolve: { authenticate: authenticate }
		})
		.state ('viewprop', {
			url: '/myprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/viewproperties.html',
			resolve: { authenticate: authenticate }
		}) 
		.state ('editprop', {
			url: '/editprop/{propId}',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/addproperties.html',
			resolve: { authenticate: authenticate }
		})
		 .state ('addprop', {
			url: '/addprop',
			controller: 'propertyCtrl',
			controllerAs: 'propctrl',
			templateUrl: 'views/addproperties.html',
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
			
			if(localStorage.getItem('userID') !== "null" && localStorage.getItem('userEmailVerified')!== "null"){
				 $rootScope.uid  = localStorage.getItem('userID');
				 $rootScope.emailVerified  = localStorage.getItem('userEmailVerified');
			 } 
			  
			if ($rootScope.uid && $rootScope.emailVerified) {				
				// Resolve the promise successfully
				return $q.when()			
				
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
