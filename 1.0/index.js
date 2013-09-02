/**
 * @fileoverview 
 * @author 知了<zhiliao.zsl@taobao.com>
 * @module itemSelector
 **/
KISSY.add(function (S, Base, Node, Sizzle, O) {
    "use strict";

    /**
     * 从一个选择多选面板中移到目标面板中
     * @class ItemSelector
     * @constructor
     * @extends S.Base
     */
    function ItemSelector(container, cfg) {
        if (this instanceof ItemSelector) {
            this.ele = Node.one(container);
            ItemSelector.superclass.constructor.call(this, cfg);
            this.init(cfg);
        } else {
            return new ItemSelector(container, cfg);
        }
    }


    S.extend(ItemSelector, Base, {

        init: function(cfg) {
            this.cfg = cfg;
            this._initHTML();
            this._bind();
        },
        _initHTML: function(){
            this._initTarget();
            this._initSrc();

            this._initNum();
        },
        _initTarget: function(){
            var targetData =this.get('target'),
            targetHTML = '',
            targetListClass = this.get('targetListClass');
            S.each(targetData, function(obj,index){
                targetHTML += '<li><input type="checkbox" class="" value="'+obj.id+'" data-text="'+obj.name+'"/>'+obj.name+'</li>';
            });
            this.ele.one(targetListClass).html(targetHTML);
        },
        _initSrc: function(){
            var srcData =this.get('src'),
            targetData = this.get('target'),
            srcHTML = '',
            srcListClass = this.get('srcListClass');

            for (var i = 0; i < targetData.length; i++) {
                var td = targetData[i];
                for (var j = 0; j < srcData.length; j++) {
                    var sd = srcData[j];
                    if(td.id == sd.id){
                        srcData.splice(j,1);
                        break;
                    }
                }
            }
            S.each(srcData,function(obj,index){
                srcHTML += '<li><input type="checkbox" class="" value="'+obj.id+'" data-text="'+obj.name+'"/>'+obj.name+'</li>';
            });
            this.ele.one(srcListClass).html(srcHTML);
        },
        _initNum: function(){
            var targetlistClass = this.get('targetListClass'),
            targetCount = this.ele.one(targetlistClass).all('input').length;

            this._setNum(targetCount);
            this.targetCount = targetCount;
        },
        /**
         * 组件的事件代理
         */
        _bind: function(){
            var container = Node.one('.wt-itemselector-widget');
            container.delegate('click', 'input[type=checkbox], button, .J_Clear', function(ev){
                var targetNode = Node.one(ev.target);
                //处理按钮的点击
                if(targetNode.hasClass('.J_add')){
                    this._add();
                }else if(targetNode.hasClass('.J_del')){
                    this._del();
                }else if(targetNode.hasClass('.J_Clear')){
                    this._clear();
                }else{
                    //checkbox的处理
                    if(targetNode.prop('tagName')==='INPUT'){
                        this._clickCheckBox(targetNode);
                    }
                }   
            },this);
        },
        /**
         * 添加按钮的事件处理器
         */
        _add: function(){
            var targetListClass = this.get('targetListClass'),
            srcListClass = this.get('srcListClass');
            this._moveItem(srcListClass, targetListClass, true);
        },
        /**
         * 删除按钮的事件处理器
         */
        _del: function(){
            var targetListClass = this.get('targetListClass'),
            srcListClass = this.get('srcListClass');
            this._moveItem(srcListClass, targetListClass, false);
        },
        /**
         * 删除按钮的事件处理器
         */
        _clear: function(){
            var targetListClass = this.get('targetListClass'),
            srcListClass = this.get('srcListClass');
            this._moveItem(srcListClass, targetListClass, false, true);
        },
        /**
         * 返回所有选中的条目的id，以逗号分割
         * @return ids 返回所有的id字符串
         */
        getTargetData: function(){
            var targetListClass = this.get('targetListClass');
            var checkboxEs = this.ele.one(targetListClass).all('input'),
            ids = '',
            checkedArr = [];
            S.each(checkboxEs, function(obj, index){
                ids = ids + obj.value + ',';
            });  
            return ids;          
        },
        /**
         * 当点击checkbox时，统一处理
         * @param targetNode 点击的checkbox元素
         */
        _clickCheckBox: function(targetNode){
            var liNode = targetNode.parent('li');
            //单个checkbox
            if(liNode){
                liNode.toggleClass('on');
                var checkboxStatus = liNode.one('input')[0].checked;

                this._handleAllCheckBox(liNode, checkboxStatus);
            }else{//全部checkbox
                this._handleAll(targetNode);
            }
        },
        /**
         * 处理点击全选的checkbox时
         * @param targetNode 全选的checkbox
         */
        _handleAll: function(targetNode){
            var checkboxChecked = targetNode[0].checked;
            var targetListClass = this.get('targetListClass'),
            srcListClass = this.get('srcListClass'),
            srcAllClass = this.get('srcAllClass'),
            targetAllClass = this.get('targetAllClass');
            //如果是选中全部checkbox
            if(checkboxChecked){
                //如果位于左边的容器中
                if(targetNode.parent(srcAllClass)){
                    this._toggleChecked(srcListClass, checkboxChecked);
                }else if(targetNode.parent(targetAllClass)){
                    this._toggleChecked(targetListClass, checkboxChecked);
                }
            }else{
                if(targetNode.parent(srcAllClass)){
                    this._toggleChecked(srcListClass, checkboxChecked);
                }else if(targetNode.parent(targetAllClass)){
                    this._toggleChecked(targetListClass, checkboxChecked);
                }               
            }
        },
        /**
         * 选中或者取消容器中的li
         * @param containerClass li所处的容器
         */
        _toggleChecked: function(containerClass, checkboxChecked){
            var container = this.ele.one(containerClass),
            checkboxInputs = container.all('input'),
            that = this;

            S.each(checkboxInputs, function(checkbox){
                var liNode = that.ele.one(checkbox).parent('li');
                if(checkboxChecked){
                    checkbox.checked= true;
                    liNode.addClass('on');
                }else{
                    checkbox.checked= false;
                    liNode.removeClass('on');
                }
            });
        },
        /**
         * 移动选项
         * @param leftContainerClass 坐标荣的class
         * @param rightContainerClass 右边容器的class
         * @param toRight 向左移还是向右移
         * @param clear 是否是清除按钮
         */
        _moveItem: function(leftContainerClass, rightContainerClass, toRight,clear){
            var srcClass, targetClass, that = this;

            if(toRight){
                srcClass = leftContainerClass;
                targetClass = rightContainerClass;
            }else{
                srcClass = rightContainerClass;
                targetClass = leftContainerClass;
            }

            var srcContainer = this.ele.one(srcClass),
            checkboxInputs = srcContainer.all('input'),
            moveItems = [];

            S.each(checkboxInputs, function(checkbox){
                var liNode = that.ele.one(checkbox).parent('li');
                //如果是删除或者添加按钮
                if(!clear){
                    if(checkbox.checked){
                        //liNode.removeClass('on');
                        //checkbox.checked = false;
                        liNode.remove();
                        moveItems.push(liNode[0]);
                    }

                } else {//如果是清除按钮
                        //liNode.removeClass('on');
                        //checkbox.checked = false;
                        liNode.remove();
                        moveItems.push(liNode[0]);
                }
            });

            if(!clear){
                //计算选中数
                if(toRight){
                    this.targetCount += moveItems.length;
                }else{
                    this.targetCount -= moveItems.length;
                }
            }else{
                this.targetCount = 0;
            }

            this._setNum(this.targetCount);
            this.ele.one(targetClass).append(moveItems);
        },

        _setNum: function(num){
            var numNode = this.ele.one(this.get('targetNumClass'));
            numNode.html(num);
        },
        /**
         * 当选中或者取消单个checkbox时，观察全部checkbox是否应该选中或者取消
         * @param li 当前chebox所处的li
         * @param checked 当前checkbox是否选中
         */     
        _handleAllCheckBox: function(li,checked){
            var lisiblings = li.siblings();
            var l = lisiblings.length;
            var srcListClass = this.get('srcListClass');
            var srcAllClass = this.get('srcAllClass');
            var targetAllClass = this.get('targetAllClass');
            var checkedArr = [], notCheckedArr = [];
            for (var i = 0; i < l; i++) {
                var checkboxNode = this.ele.one(lisiblings[i]).one('input')[0];
                if(checkboxNode.checked){
                    checkedArr.push(checkboxNode);
                }else{
                    notCheckedArr.push(checkboxNode);
                }
            }

            var targetAllCheckbox = this.ele.one(targetAllClass + ' input')[0];
            var srcAllCheckbox = this.ele.one(srcAllClass + ' input')[0];
            //如果当前处于选中模式下
            if(checked){
                //兄弟节点全部被选中，那么全部的checkbox也要被选中
                if(checkedArr.length === l){
                    if(li.parent(srcListClass)){
                        srcAllCheckbox.checked = true;
                    }else{
                        targetAllCheckbox.checked = true;
                    }
                }
            }else{
                if(notCheckedArr.length ===l ){
                    if(li.parent(srcListClass)){
                        srcAllCheckbox.checked = false;
                    }else{
                        targetAllCheckbox.checked = false;
                    }
                }
            }
        }
    },{
        ATTRS:{
            src: {
                value: []
            },
            target: {
                value: []
            },
            srcListClass: {
                value: '.src-list'
            },
            targetListClass: {
                value: '.target-list'
            },
            srcAllClass: {
                value: '.src-all'
            },
            targetAllClass: {
                value: '.target-all'
            },
            targetNumClass: {
                value: '.target-num'
            }
        }
    }
);

    return ItemSelector;
}, {requires:['base', 'node', 'sizzle', 'overlay']});



