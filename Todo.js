/*jshint strict:true */
/*jshint unused:false*/

/*jslint browser:true */
/*jslint esnext:true*/
/*global document, firebase */
/*global componentHandler */
/*global ToDoItem */
/*jslint plusplus: true */

// custom event - event based update of page
const FirebaseDataEvent = "onfirebasedatainvalid";
const Event_RequestToDoList = "onRequestToDoList";
const Event_DisplayToDoListNormal = "onDisplayToDoListNormal";

// HTML elements - navigation bar
var navRefreshItem = document.getElementById('navRefresh');
var navAddItem = document.getElementById('navAdd');
var navDeleteItem = document.getElementById('navDel');
var navSignOut = document.getElementById('navSignOut');

// HTML elements - bottom toolbar to add an item
var toolbarAdd = document.getElementById('button_add_toolbar');
var btnAdd = document.getElementById('btnAdd');
var btnAbortAdd = document.getElementById('btnAbortAdd');
var inputToDoItem = document.getElementById('input_todo_item');

// HTML elements - bottom toolbar to delete item(s)
var toolbarDelete = document.getElementById('button_delete_toolbar');
var btnDelete = document.getElementById('btnDelete');
var btnAbortDelete = document.getElementById('btnAbortDelete');

// HTML elements - user information
var txtDisplayName = document.getElementById('txtDisplayName');
var txtEmail = document.getElementById('txtEmail');
var txtEmailVerified = document.getElementById('txtEmailVerified');
var txtPhotoUrl = document.getElementById('txtPhotoUrl');
var txtUid = document.getElementById('txtUid');

// HTML elements - ToDo list
var listTodos = document.getElementById('listTodos');

// local state of current 'todo' items list
var todoListItems = [];

// get a reference to the database service
var db = firebase.database();
var uidCurrentUser = "";

// ==================================================================================
// firebase authentication

firebase.auth().onAuthStateChanged(function (user) {

    'use strict';
    if (user !== null) {

        console.log("User " + user.email + " logged IN");
        uidCurrentUser = user.uid;
        initComponents (user);

        let event = new CustomEvent(FirebaseDataEvent, { detail: Event_RequestToDoList });
        window.dispatchEvent(event);

    } else {

        console.log("user logged OUT");
        uidCurrentUser = '';
    }
});

// signout event handler
navSignOut.addEventListener('click', function () {

    'use strict';
    console.log('navSignOut clicked');

    firebase.auth().signOut().then(function () {

        // sign-out successful ...
        console.log('User successfully signed OUT !');
        window.location.href = 'index.html';

    }, function (error) {
        console.log('User NOT signed out !' + error.message);
    });
});

// ==================================================================================
// miscellaneous event handler methods: page load and custom events

window.onload = function(){

    'use strict';
    console.log('Todo Page LOADED');

    window.addEventListener (FirebaseDataEvent, handleEvent, false);
};

function handleEvent(event)
{
    'use strict';
    console.log('handleEvent [' + event.detail + ']');

    if (event.detail === Event_RequestToDoList) {

        if (uidCurrentUser !== "") {
            readToDoList(uidCurrentUser, Event_DisplayToDoListNormal);
        }
    }
    else if (event.detail === Event_DisplayToDoListNormal) {

        showToDoListNormal (todoListItems);
    }
}

// ==================================================================================
// top navigation bar event handler

// refresh item list
navRefreshItem.addEventListener('click', function () {

    'use strict';
    console.log('"Refresh Item" button clicked');

    let event = new CustomEvent(FirebaseDataEvent, { detail: Event_RequestToDoList });
    window.dispatchEvent(event);
});

// add item - tbd
navAddItem.addEventListener('click', function () {

    'use strict';
    console.log('"Add Item" button clicked');

    // make 'sub menu' visible
    toolbarAdd.style = 'display:block';
    navRefreshItem.style = 'display:none';
    navAddItem.style = 'display:none';
    navDeleteItem.style = 'display:none';
});

// delete item(s)
navDeleteItem.addEventListener('click', function () {

    'use strict';
    console.log('"Delete Item" button clicked');

    // make 'sub menu' visible
    toolbarDelete.style = 'display:block';
    navRefreshItem.style = 'display:none';
    navAddItem.style = 'display:none';
    navDeleteItem.style = 'display:none';

    showToDoListWithCheckboxes (todoListItems);
});

// ==================================================================================
// bottom bar (footer) event handler (add item - tbd)

btnAdd.addEventListener('click', function () {

    'use strict';
    console.log('Add button clicked: ' + todoListItems.length);

    // read input from text box
    var item = inputToDoItem.value;
    console.log ("TEXT: " + item);

    // poke item to firebase data storage
    addToDoItem (item);

    // make menu invisible
    toolbarAdd.style = 'display:none';
    navRefreshItem.style = 'display:block';
    navAddItem.style = 'display:block';
    navDeleteItem.style = 'display:block';

    let event = new CustomEvent(FirebaseDataEvent, { detail: Event_RequestToDoList });
    window.dispatchEvent(event);
});

function addToDoItem(item) {

    'use strict';

    // build firebase reference string
    let refstring = 'users/' + uidCurrentUser + '/items';
    let newItemRef = db.ref(refstring).push();
    newItemRef.set ({ title: item }, function (error) {
        if (error) {
            console.log("Data could not be saved: " + error);

        } else {
            console.log("Data saved successfully.");
        }
    });
}

btnAbortAdd.addEventListener('click', function () {

    'use strict';
    console.log('Abort button clicked');

    // make 'sub menu' invisible
    toolbarAdd.style = 'display:none';
    navRefreshItem.style = 'display:block';
    navAddItem.style = 'display:block';
    navDeleteItem.style = 'display:block';

    let event = new CustomEvent(FirebaseDataEvent, { detail: Event_DisplayToDoListNormal });
    window.dispatchEvent(event);
});

// ==================================================================================
// footer bar event handler (delete items)

btnDelete.addEventListener('click', function () {

    'use strict';
    console.log('Delete button clicked: ' + todoListItems.length);

    var numItemsToDelete = 0;
    for (let i = 0; i < todoListItems.length; i++) {

        var checkBox = todoListItems[i].node;
        if (checkBox.checked === true) {

            numItemsToDelete ++;
            deleteToDoItem(i);
        }
    }

    // make 'sub menu' invisible
    toolbarDelete.style = 'display:none';
    navRefreshItem.style = 'display:block';
    navAddItem.style = 'display:block';
    navDeleteItem.style = 'display:block';

    if (numItemsToDelete > 0) {

        // request current list from server
        let event = new CustomEvent(FirebaseDataEvent, { detail: Event_RequestToDoList });
        window.dispatchEvent(event);
    }
    else {

        // display last read list from client - no server round-trip necessary
        let event = new CustomEvent(FirebaseDataEvent, { detail: Event_DisplayToDoListNormal });
        window.dispatchEvent(event);
    }
});

function deleteToDoItem(index) {

    'use strict';

    // build firebase reference string
    let key = todoListItems[index].key;
    let refstring = 'users/' + uidCurrentUser + '/items/' + key;
    let ref = db.ref(refstring);

    ref.remove();
}

btnAbortDelete.addEventListener('click', function () {

    'use strict';
    console.log('Abort button clicked');

    // make 'sub menu' invisible
    toolbarDelete.style = 'display:none';
    navRefreshItem.style = 'display:block';
    navAddItem.style = 'display:block';
    navDeleteItem.style = 'display:block';

    let event = new CustomEvent(FirebaseDataEvent, { detail: Event_DisplayToDoListNormal });
    window.dispatchEvent(event);
});

// ==================================================================================
// private helper functions

function initComponents(user) {

    'use strict';

    let name = user.displayName,
        email = user.email,
        photoUrl = user.photoURL,
        emailVerified = user.emailVerified,
        uid = user.uid;

    if (name !== null) {
        txtDisplayName.value = uid;
    } else {
        txtDisplayName.value = '<no display found>';
    }

    txtEmail.value = email;
    txtEmailVerified.value = (emailVerified === true) ? 'True' : 'False';

    if (photoUrl !== null) {
        txtPhotoUrl.value = uid;
    } else {
        txtPhotoUrl.value = '<no photo url found>';
    }

    txtUid.value = uid;
}

function readToDoList(uid, kind) {

    'use strict';
    todoListItems = [];

    let refstring = 'users/' + uid + '/items/';
    db.ref(refstring).once('value').then(function (snapshot) {

        snapshot.forEach(function (childSnapshot) {

            let key = childSnapshot.key,
                data = childSnapshot.val(),
                title = data.title;

            // enter todo item into list
            let item = new ToDoItem (key, title);
            todoListItems.push(item);
        });

        // list of ToDo items updated, fire 'display list' event
        let event = new CustomEvent(FirebaseDataEvent, { detail: kind });
        window.dispatchEvent(event);
    });
}

function showToDoListNormal(list) {

    'use strict';

    // clear list
    listTodos.innerHTML = '';

    for (let i = 0; i < list.length; i++) {

        // build list item string
        var linePrefix = (i < 10) ? '  ' : (i < 100) ? ' ' : '',
            line = linePrefix + (i+1) + ': ' + list[i].title;

        // add a 'material design lite' node to a list dynamically
        let node = document.createElement('li');                        // create a <li> node
        node.setAttribute('class', 'mdl-list__item');                   // set an attribute

        let span = document.createElement('span');                      // create a <span> node
        span.setAttribute('class', 'todo_margin mdl-list__item-primary-content');

        let textnode = document.createTextNode(line);                   // create a text node
        node.appendChild(span);                                         // append <span> to <li>
        span.appendChild(textnode);                                     // append text to <span>
        listTodos.appendChild(node);                                    // append <li> to <ul>
    }

    componentHandler.upgradeDom();
}

function showToDoListWithCheckboxes(items) {

    'use strict';

    // clear list
    listTodos.innerHTML = '';

    for (let i = 0; i < items.length; i++) {

        // add a 'material design lite' node to a list dynamically
        let liNode = document.createElement('li');
        liNode.setAttribute('class', 'mdl-list__item');

        let labelNode = document.createElement('label');    // create a <label> node
        labelNode.setAttribute('class', 'mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect');
        labelNode.setAttribute('for', 'checkbox' + i);

        let inputNode = document.createElement('input');
        inputNode.setAttribute('type', 'checkbox');
        inputNode.setAttribute('id', 'checkbox' + i);
        inputNode.setAttribute('class', 'mdl-checkbox__input');

        // todoListCheckboxes.push (inputNode);
        items[i].node = inputNode;

        let spanNode = document.createElement('span');
        spanNode.setAttribute('class', 'todo_margin mdl-checkbox__label');

        let textnode = document.createTextNode(items[i].title);

        spanNode.appendChild(textnode);
        labelNode.appendChild(inputNode);
        labelNode.appendChild(spanNode);
        liNode.appendChild(labelNode);

        listTodos.appendChild(liNode);
    }

    componentHandler.upgradeDom('MaterialCheckbox');
}
