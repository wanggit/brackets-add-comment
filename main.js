/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, MouseEvent */

define(function(require, exports, module){
    
    var Menus = brackets.getModule("command/Menus"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Comment = require("comment"),
        upperOrLower = require("upperOrLower");
    
    var UPPERCASE = "wanggit-uppercase";
    var LOWERCASE = "wanggit-lowercase";
    var ADDCOMMENT = "wanggit-addcomment";    
    // 注册大写命令
    CommandManager.register("To UpperCase", UPPERCASE, upperOrLower.selectUpperCase);
    // 注册小写命令
    CommandManager.register("To LowerCase", LOWERCASE, upperOrLower.selectLowerCase);
    // add comment
    CommandManager.register("Add Comment", ADDCOMMENT, Comment.addComment);
    // 添加菜单
    var editorContextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    var editorMenu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    editorContextMenu.addMenuDivider();
    editorContextMenu.addMenuItem(UPPERCASE, "Ctrl-Shift-X");
    editorContextMenu.addMenuItem(LOWERCASE, "Ctrl-Shift-Y");
    editorMenu.addMenuDivider();
    editorMenu.addMenuItem(ADDCOMMENT, "Ctrl-Alt-A");
    
    
});