define(function(require, exports, module){
    var EditorManager = brackets.getModule("editor/EditorManager");
    
    
    /**
     * 
     */
    function beginComment(){
        var editor = EditorManager.getFocusedEditor(), 
            cm;
        if( editor ){
            cm = editor._codeMirror;
            // 为CodeMirror绑定一个新的Enter事件
            cm.addKeyMap({
                "Enter" : function(cm){
                    
                }
            });
        }
    }
    
    /**
     * 
     */
    function addComment(){
        var editor = EditorManager.getFocusedEditor(), 
            selectedText, 
            cm,
            line,
            lastLine,
            content,
            moveLine,
            indent = 0,
            indentStr = "";
        if( editor ){
            selectedText = editor.getSelectedText();
            cm = editor._codeMirror;
            // 获取当前光标所在位置
            line = cm.getCursor().line;
            content = cm.getLine(line);
            // 计算当前行有多个缩进
            for(var i=0;i<content.length;i++){
                if( content.charAt(i) == " " ){
                    indent++;
                    indentStr += " ";
                }else{
                    break;
                }
            }
            // 把光标移动到要添加注释的行
            cm.setCursor({
                line : line,
                ch : indent
            });
            // 在光标所在行执行“newlineAndIndent”命令
            cm.execCommand("newlineAndIndent");
            cm.setLine(line, indentStr+"/**");
            cm.execCommand("newlineAndIndent");
            cm.setLine(line+1, indentStr+" * ");
            cm.execCommand("newlineAndIndent");
            cm.setLine(line+2, indentStr+" */");
        }
    }
    
    exports.addComment = addComment;
    
});