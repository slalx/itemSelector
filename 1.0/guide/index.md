## 综述

itemSelector双区域多选控件，左边是可选择的条目，右边是选中的条目；两个区域之间有操作按钮，供左移，右移操作。

## 快速使用

### 初始化组件

    S.use('gallery/itemSelector/1.0/index', function (S, ItemSelector) {
        var is = new ItemSelector('#J_NumLevelSelector',{
            src:[{id:1,name:'第一条'},{id:2,name:'第二条'},{id:3,name:'第三条'},{id:4,name:'第四条'}],
            target:[{id:1,name:'第一条'},{id:2,name:'第二条'}]
        });


        Node.one('.J_confirm').on('click',function(){
        	//获取选中的条目的ids
            alert('选中的id列表'+is.getTargetData());
        });
    })

## API说明

### 类参数
itemSelector类接受两个参数

第一个参数是组件所在容器的id，如#J_NumLevelSelector

第二个元素是组件配置项

参数名 | 类型 | 默认值 | 描述 
------------ | ------------- | ------------ | ------------ 
src | Array   | [] | 数组的每个元素有id,name两个属性，如[{id:1,name:'第一条'},{id:2,name:'第二条'},{id:3,name:'第三条'}]
target | Array  | []  |	数组的每个元素有id,name两个属性，如[{id:1,name:'第一条'},{id:2,name:'第二条'}]

### 公共方法

getTargetData ,返回选中的id字符串列表，以逗号分割


