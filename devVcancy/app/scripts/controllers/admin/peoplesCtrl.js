'use strict';

vcancyApp
    .controller('adminPeoplesCtrl', ['$scope', '$firebaseAuth', '$state', '$rootScope', '$stateParams', '$window', '_',
        function ($scope, $firebaseAuth, $state, $rootScope, $stateParams, $window, _) {

            var vm = this;
            var landlordID = localStorage.getItem('userID');
            vm.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;

        }]);
