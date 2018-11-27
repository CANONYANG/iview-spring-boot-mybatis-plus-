UE.registerUI('字间距',function(editor,uiName){
    //注册按钮执行时的command命令,用uiName作为command名字，使用命令默认就会带有回退操作
    var label = uiName;
    editor.registerCommand(uiName,{
        execCommand:function(cmdName,value){
            //这里借用fontsize的命令
            var me = this;
            // var text= editor.selection.getText();
            var text = me.selection.getText();
            var obj=me.selection.getStart();
            var range = me.selection.getRange();
            var txt = "";
            var oNode = document.createElement("span");
            oNode.appendChild(range.cloneContents());
            console.log(oNode)
            var b = oNode.childNodes;
            for(i=0;i<b.length;i++){
                if(b[i].style !== undefined){
                    b[i].style.letterSpacing = "";
                }
            }
            // oNode.setAttribute('letter-spacing',value + 'px !important');
            txt = oNode.innerHTML;
            range.deleteContents();
            var node = new UE.uNode({
                type:'element',
                tagName:'span',
                attrs:{style:'letter-spacing:' + value + 'px !important'}
            })
            // node.innerText(txt);
            node.innerHTML(txt);
            me.execCommand('inserthtml',node.toHtml());

        },

        queryCommandValue:function(){
            // console.log('正在监听。。。')
            // return this.queryCommandValue(label);
        }
    });


    //创建下拉菜单中的键值对，这里我用字体大小作为例子
    var items = [];
    for(var i= 0,ci;ci=['0', 0.5, 1, 2][i++];){
        items.push({
            //显示的条目
            label:ci + 'px',
            //选中条目后的返回值
            value:ci,
            //针对每个条目进行特殊的渲染
            renderLabelHtml:function () {
                //这个是希望每个条目的字体是不同的
                return '<div class="edui-label %%-label" style="line-height:2;font-size:2px;">' + (this.value || '') + '</div>';
            }
        });
    }
    //创建下来框
    var combox = new UE.ui.Combox({
        //需要指定当前的编辑器实例
        editor:editor,
        //添加条目
        items:items,
        //当选中时要做的事情
        onselect:function (t, index) {
            //拿到选中条目的值
            label = this.items[index].label;
            editor.execCommand(uiName, this.items[index].value);
        },
        //提示
        title:uiName,
        //当编辑器没有焦点时，combox默认显示的内容
        initValue:uiName
    });

    editor.addListener('selectionchange', function (type, causeByUi, uiReady) {
        if (!uiReady) {
            var state = editor.queryCommandState(uiName);
            if (state == -1) {
                combox.setDisabled(true);
            } else {
                combox.setDisabled(false);
                var value = editor.queryCommandValue(label);
                if(!value){
                    combox.setValue(label);
                    return;
                }
                //ie下从源码模式切换回来时，字体会带单引号，而且会有逗号
                value && (value = value.replace(/['"]/g, '').split(',')[0]);
                combox.setValue(value);
            }
        }

    });
    return combox;
},2/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);
