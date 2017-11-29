/*jslint browser:true */
/*jslint esnext:true*/
/*global document, window, firebase */

// retrieve HTML elements
var btnAction = document.getElementById('btnAction');
var txtEmail = document.getElementById('txtEmail');
var txtPassword = document.getElementById('txtPassword');
var txtPasswordRepeated = document.getElementById('txtPasswordRepeated');
var navLinkSignUp = document.getElementById('navLinkSignUp');
var navLinkSignIn = document.getElementById('navLinkSignIn');
var paraError = document.getElementById('errorMessage');

var divRepeatPassword = document.getElementById('div_repeat_password');

var state = "SignInMode";  // "SignInMode" or "SignUpMode"

navLinkSignUp.addEventListener('click', function () {

    if (state === "SignInMode") {
        state = "SignUpMode";
        btnAction.innerText = "Sign Up";
        divRepeatPassword.style = 'display:block';
        paraError.textContent = "";
        console.log("New mode: SignUpMode");
    }
});

navLinkSignIn.addEventListener('click', function () {

    if (state === "SignUpMode") {
        state = "SignInMode";
        btnAction.innerText = "Sign In";
        divRepeatPassword.style = 'display:none';
        paraError.textContent = "";
        console.log("New mode: SignInMode");
    }
});

// connect event handler functions
btnAction.addEventListener('click', function () {

    'use strict';
    console.log('btnAction');

    // get email and password
    let email = txtEmail.value,
        password = txtPassword.value;

    if (state === "SignInMode") {

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
    }
    else if (state === "SignUpMode") {

        let passwordRepeated = txtPasswordRepeated.value;

        if (password !== passwordRepeated) {

            paraError.textContent = "Passwords are different! Please enter correct credentials!";
            txtPassword.value = "";
            txtPasswordRepeated.value = "";

            return;
        }

        console.log('Yeahhhhh - got a new Sign Up client');
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



