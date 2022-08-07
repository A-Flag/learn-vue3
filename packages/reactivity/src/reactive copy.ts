import { isObject } from "@vue/shared";

//将数据转化为响应式数据,只能做对象代理

let reactiveMap = new WeakMap();//key只能是对象
const enum ReactiveFlags{
    IS_REACTIVE = '__v_isReactive'
}

//实现同一个对象 代理多次，返回一个对象
//代理对象再次代理，可以直接返回
export function reactive(target){
    if(!isObject(target)){
        return
    }
    if(target[ReactiveFlags.IS_REACTIVE]){
        return target
    }
    //test
    // let target1 = {
    //     name:'lala',
    //     get lala(){
    //         return this.name
    //     }
    // }
    // target1.lala
    //proxy.lala 只执行一次，应该走2次(1次取不到name为lala)
    //我在页面中使用了lala对应的值，稍后name变化了，要重新渲染
    //并没有重新定义属性，只是代理，在取值的时候会调用get,当赋值的时候调用set

    let existitignProxy = reactiveMap.get(target)//缓存机制，对象相等的时候使用缓存
    if(existitignProxy){
        return existitignProxy
    }

    //第一次普通对象代理，我们会通过new Proxy代理一次
    //下一次你传递的是proxy，我们可以看一下它有没有代理过，如有访问过proxy的get方法，说明访问过
    const proxy = new Proxy(target,{
        //可以监控到用户取值了
        get(target,key,reactiver){//reactiver 就是代理对象
            console.log('reactiver==',reactiver,'target',target)
            if(key===ReactiveFlags.IS_REACTIVE){
                return true
            }
            // return target[key];
            return Reflect.get(target,key,reactiver)//Reflect改变了取值的时候this的指向
        },
        set(target,key,value,reactiver){
            // target[key] = value;
            //可以监控到用户设值了
            return Reflect.set(target,key,value,reactiver);
        }
    })
    reactiveMap.set(target,proxy);
    return proxy
}