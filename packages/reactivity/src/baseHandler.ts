import { activeEffect, track } from "./effect"
export const enum ReactiveFlags{
    IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers={
    //可以监控到用户取值了
    get(target,key,reactiver){//reactiver 就是代理对象
        console.log('reactiver==',reactiver,'target',target)
        if(key===ReactiveFlags.IS_REACTIVE){
            return true
        }
        track(target,'get',key)
        // return target[key];
        return Reflect.get(target,key,reactiver)//Reflect改变了取值的时候this的指向
    },
    set(target,key,value,reactiver){
        // target[key] = value;
        //可以监控到用户设值了
        return Reflect.set(target,key,value,reactiver);
    }
}