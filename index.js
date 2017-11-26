/*jslint browser:true */
/*global document, window, firebase */
/*jslint esnext:true*/

// retrieve HTML elements
var btnSignIn = document.getElementById('btnSignIn');
var txtEmail = document.getElementById('txtEmail');
var txtPassword = document.getElementById('txtPassword');

var paraError = document.getElementById('loginError');

// connect event handler functions
btnSignIn.addEventListener('click', function () {

    'use strict';
    console.log('buttonLogin');

    // get email and password
    let email = txtEmail.value,
        password = txtPassword.value;

    if (email !== "" && password !== "") {

        let promise = firebase.auth().signInWithEmailAndPassword(email, password);

        promise
            .then(function (user) {
            // success
            console.log("signInWithEmailAndPassword: SUCCESS");
            console.log("Email: " + user.email);
            window.location.href = "todo.html";
        })
            .catch(function(error) {
            // error handling
            paraError.textContent = error.message;
        });

    } else {

        console.log("buttonLogin ... failure");
        paraError.textContent = "Please enter user credentials !";
    }
});

// firebase authentication
firebase.auth().onAuthStateChanged(function (user) {
    'use strict';
    if (user) {

        // user is signed in
        console.log("I'm logged IN");
    } else {

        // no user is signed in
        console.log("I'm NOT logged IN");
    }
});



