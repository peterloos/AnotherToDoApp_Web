/*global window */
/*jshint unused:false*/

function ToDoItem(key, title) {
    'use strict';

    // key and todo text from firebase data storage
    this.key = key;
    this.title = title;

    // checkbox not yet known
    this.node = null;
    this.toBeDeleted = false;

    this.print = function () {
        window.console.log("Title: " + this.title);
    };
}

//var MODULE = /** @class */ (function () {
//
//    function ToDoItem(key, title) {
//        'use strict';
//        this.key = key;
//        this.title = title;
//        this.toBeDeleted = false;
//    }
//
//    ToDoItem.myprint = function () {
//         window.console.log("Title_A: " + this.title);
//    };
//
//    ToDoItem.prototype.print = function () {
//         window.console.log("Title_B: " + this.title);
//    };
//
//    return ToDoItem;
//
//}());
