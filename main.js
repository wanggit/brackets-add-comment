/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, MouseEvent */

define(function(require, exports, module){
    
    var Menus = brackets.getModule("command/Menus"),
        CommandManager = brackets.getModule("command/CommandManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        Comment = require("comment"),
        upperOrLower = require("upperOrLower");
    
    var UPPERCASE = "comments-uppercase";
    var LOWERCASE = "comments-lowercase";
    // var ADDCOMMENT = "comments-addcomment";
    var HANDLERENTER = "comments-enter-handler";
    // register uppercase command
    CommandManager.register("Uppercase", UPPERCASE, upperOrLower.selectUpperCase);
    // register lowercase command
    CommandManager.register("Lowercase", LOWERCASE, upperOrLower.selectLowerCase);
    // register add comments command
    // CommandManager.register("Add Comments", ADDCOMMENT, Comment.addComment);
    // register continus comments command
    CommandManager.register("Handler Enter", HANDLERENTER, Comment.handlerEnter);
    // add menuItem
    var editorContextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    //var editorMenu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    editorContextMenu.addMenuDivider();
    editorContextMenu.addMenuItem(UPPERCASE, "Ctrl-Shift-X");
    editorContextMenu.addMenuItem(LOWERCASE, "Ctrl-Shift-Y");
    //editorMenu.addMenuDivider();
    //editorMenu.addMenuItem(ADDCOMMENT, "Ctrl-Alt-A");
    // key binding
    KeyBindingManager.addBinding(HANDLERENTER, "Enter");
    
});