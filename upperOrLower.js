define(function(require, exports, module){
    
    var EditorManager = brackets.getModule("editor/EditorManager");
    
    /**
     * 把选中的文件转为大写或小写
     * @param {boolean} upperCase false就转为小写，反之转为大小
     */
    function _toUpperCase(upperCase){
        var editor = EditorManager.getFocusedEditor();
        if( editor ){
            var selection = editor.getSelection();
            var selectText = editor.getSelectedText();
            if( upperCase ){
                selectText = selectText.toUpperCase();
            }else{
                selectText = selectText.toLowerCase();
            }
            editor.document.replaceRange(selectText, selection.start, selection.end);
        }
    }
    
    function selectUpperCase(){
        _toUpperCase(true);
    }
    
    function selectLowerCase(){
        _toUpperCase(false);
    }
    
    exports.selectUpperCase = selectUpperCase;
    exports.selectLowerCase = selectLowerCase;

});