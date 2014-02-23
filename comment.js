/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, MouseEvent */
define(function(require, exports, module){
    var EditorManager = brackets.getModule("editor/EditorManager");
    
    /**
     * 响应Enter事件
     * @return {$.Promise}
     */
    function handlerEnter(){
        var editor = EditorManager.getFocusedEditor();
        var deferred = new $.Deferred();
        var line, content, cm, endComments, indentInfo, nextLineInfo;
        var beginRegex = /^\s*\/\*\*\s*$/;
        var regex = /^\s+\*\s*[^\/]*$/;
        var endRegex = /^\s+\*\/\s*$/;
        if( editor ){
            cm = editor._codeMirror;
            line = cm.getCursor().line;
            content = cm.getLine(line);
            // 如果光标所在于的内容为/***/那么把内容替换为/**
            content = _replaceContent(cm, line, content);
            // 依据光标所在行的内容，判断当前缩进的位数与缩进显示的空格字符串
            indentInfo = _getIndentInformation(content);
            // 判断当前注释是否已存在结束注释
            endComments = _nextHasEndComments(cm, line, regex, endRegex);
            // 如果当前行的内容是/**那么就检查它的下面行是否存在*/标记，如果存在就只创建一行*，如果不存在就创建*和*/
            if( beginRegex.test(content) ){
                if( endComments ){
                    _appendNoEndStar(cm, line, indentInfo);
                }else{
                    // 获取下一行的函数有多少个参数
                    nextLineInfo = _getNextLineInfo(cm, line);
                    // 添加*
                    _appendNoEndStar(cm, line, indentInfo);
                    // 添加参数的注释
                    _appendArgsStar(cm, line, indentInfo, nextLineInfo);
                    cm.execCommand("newlineAndIndent");
                    cm.setLine(line+2+(nextLineInfo ? nextLineInfo.length : 0), indentInfo.indentStr+" */");
                }
                // 把光标定位到第line+1行
                cm.setCursor({
                    line : line + 1,
                    ch : indentInfo.indent + 3
                });
                // 不再让其他功能处理Enter事件
                deferred.resolve();
                return deferred.promise();
            }else if( regex.test(content) ){
                _appendStar(cm, line, indentInfo);
                // 不再让其他工能处理Enter事件
                deferred.resolve();
                return deferred.promise();
            }
        }
        deferred.reject();
        return deferred.promise();
    }
    /**
     * 替换光标所在行的内容，如果内容为\/**[*]*\/格式，那么就把它替换为\/××
     * @param {CodeMirror} cm CodeMirror编辑器
     * @param {Number} line 行号
     * @param {String} content line行的内容
     * @return {String} 替换之后的内容，此内容一定是/**
     */
    function _replaceContent(cm, line, content){
        var regex = /^\s*\/\*\*[*]*\/$/;
        var contentRegex = /^\s*\/\*\*/;
        if( regex.test(content) ){
            cm.setLine(line, content.match(contentRegex)[0]);
        }
        return cm.getLine(line);
    }
    /**
     * 添加具有参数注释信息
     * @param {CodeMirror} cm Editor的CodeMirror
     * @param {Number} line 当前光标所在行
     * @param {Object} indentInfo 包含关于缩进位数与缩进要补充的空格数
     * @param {Array} nextLineInfo 光标所在行的下一行函数具有参数个数
     */
    function _appendArgsStar(cm, line, indentInfo, nextLineInfo){
        var len;
        line ++;
        if( nextLineInfo ){
            len = nextLineInfo.length;
            for(var i=0;i<len;i++){
                cm.execCommand("newlineAndIndent");
                cm.setLine(line+i+1, indentInfo.indentStr+" * @param {Type} "+nextLineInfo[i]);
            }
        }
    }
    /**
     * 获取line+1行的内容，并判断它是否是函数，如果是函数那么再获取此函数的参数数组
     * @param {CodeMirror} cm CodeMirror编辑器
     * @param {Number} line 行号
     * @return {Array|null} 函数的参数数组
     */
    function _getNextLineInfo(cm, line){
        var lastLine = cm.lastLine();
        var content, matcheds;
        var funRegex = /^\s*function(?:\s+[\w_$]*)?\([\w_$\s,]*\)\s*\{.*$/;
        var argsRegex = /\([\w_$\s,]*\)/;
        // 如果当前的line已是最后一行
        if( line >= lastLine ){
            return null;
        }else{
            content = cm.getLine(line+1);
            // 判断这line+1的这一行是否定义了函数
            if( funRegex.test(content) ){
                matcheds = content.match(argsRegex);
                if( matcheds.length > 0 ){
                    matcheds = matcheds[0];
                    matcheds = matcheds.replace(/\(/, "").replace(/\)/, "");
                    matcheds = matcheds.split(/\s*,\s*/);
                    return matcheds;
                }
            }
        }
        return null;
    }
    /**
     * 在有注释结束标记的情况下添加*
     * @param {CodeMirror} cm CodeMirror编辑器
     * @param {Number} line 行号
     * @param {Object} indentInfo 包含缩进空格个数与补充缩进空格的字符串的对象
     */
    function _appendStar(cm, line, indentInfo){
        cm.execCommand("newlineAndIndent");
        cm.setLine(line+1, indentInfo.indentStr+"* ");
    }
    /**
     * 在没有注释结束标记的情况下添加*
     * @param {CodeMirror} cm CodeMirror编辑器
     * @param {Number} line 行号
     * @param {Object} indentInfo 包含缩进空格个数与补充缩进空格的字符串的对象
     */
    function _appendNoEndStar(cm, line, indentInfo){
        cm.execCommand("newlineAndIndent");
        cm.setLine(line+1, indentInfo.indentStr+" * ");
    }
    
    /**
     * 查看光标所在行向一能不能找到一个匹配的注释结束标记
     * @param {CodeMirror} cm CodeMirror编辑器
     * @param {Number} line 行号
     * @param {Regex} regex /^\s+\*\s*[^\/]*$/
     * @param {Regex} endRegex /^\s+\*\/\s*$/
     * @return {Boolean} 是否存在注释结束标记
     */
    function _nextHasEndComments(cm, line, regex, endRegex){
        var lastLine = cm.lastLine(), isEnd = false;
        var content;
        for(var i=line+1;i<=lastLine;i++){
            content = cm.getLine(i);
            if( regex.test(content) ){
                continue;
            }
            if( endRegex.test(content) ){
                isEnd = true;
                break;
            }
            break;
        }
        return isEnd;
    }
    
    /**
     * 依据字符串前的空格判断缩进情况。
     * @param {String} content
     * @return {Object} {indent : '', indentStr : ''}
     */
    function _getIndentInformation(content){
        var indent = 0, indentStr = "";
        // 计算当前行有多个缩进
        for(var i=0;i<content.length;i++){
            if( content.charAt(i) == " " ){
                indent++;
                indentStr += " ";
            }else{
                break;
            }
        }
        return {
            indent : indent,
            indentStr : indentStr
        };
    }
    
    // exports.addComment = handlerEnter;
    exports.handlerEnter = handlerEnter;
    
});