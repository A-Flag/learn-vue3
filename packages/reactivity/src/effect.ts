
export let activeEffect = undefined
class ReactiveEffect {
    public parent = null;
    public deps =[]

    //这里表示在实例上新增了active属性
    public active=true;//这个effect默认是激活状态
    constructor(public fn){//用户传递的参数也会放到this上：this.fn = fn

    }
    run(){//执行effect
        if(!this.active){
            this.fn();//这里表示如果是非激活情况，只需要执行函数，不需要进行依赖收集
        }

        //这里要依赖收集，核心就是将当前的effect和稍后渲染的属性关联在一起,就是赋值（let activeEffect = undefined）
       try{
            this.parent = activeEffect;
            activeEffect = this;
            return this.fn()//当稍后调用取值操作的时候，就可以获取到这个全局的activeEffect了
       }finally{
            activeEffect = this.parent;
            this.parent = null;

       }
    }
}

export function effect(fn){
    //这里fn,可以根据状态变化，重新执行，effect可以嵌套着写

   const _effect= new ReactiveEffect(fn);
   _effect.run()//默认先执行一次
}

//一个effect对应多个属性，一个属性对应多个effect
const targetMap = new WeakMap()
export function track(target,type,key){//模版中没有用到的属性是不会被跟踪的
    debugger
    if(!activeEffect) return
    let depsMap = targetMap.get(target);  //第一次没有
    if(!depsMap){
        targetMap.set(target,(depsMap= new Map()))
    }
    let dep = depsMap.get(key)
    if(!dep){
        depsMap.set(key,(dep=new Set()))
    }
    let shouldTrack = !dep.has(activeEffect)//去重了
    if(shouldTrack){
        dep.add(activeEffect)
        // name:new Set() deps存effects
        activeEffect.deps.push(dep)//让effect记录对应的key
    }
//单向的指的是，属性记录了effect,应该让effect也记录它被那些属性收集过


//对象 某个属性 -》多个effect
//weakMap ={对象:Map{name:Set}}
//{对象:{name:[]}}

}

//这个执行流程 就类似于一个树形结构

//【e1，e2】---执行e2后删除e2 进栈出栈---

// effect(()=>{//e1   //parent = null;   activeEffect=e1 ---标记
    //state.name //name--e1
//     effect(()=>{//e2 //parent = e1;   activeEffect=e2
  //state.age //age--e2
//     })
  //state.address //? activeEffect--e1 // activeEffect = this.parent
// })

export function trigger(target,type,key,value,oldValue){
    const depsMap = targetMap.get(target)
    if(!depsMap)return;//的、触发的值不在模版中
    
    const effects = depsMap.get(key);//找到了属性对应的effect
    effects && effects.forEach((effect)=>{
        //在执行effecct的时候，又要执行自己，那我们要屏蔽，不要无限调用
        if(effect !== activeEffect) effect.run()
        
    })


}

//1) 先创建一个响应式对象 new Proxy
//2) effect 默认数据变化要执行能更新（把数据和函数关联起来），先将正在执行的effect作为全局变量，
//渲染（取值），在get方法中进行依赖收集
//3）依赖收集过程结构：weakmap(对象：map(属性:set(effect)))
//4)稍后用户发生数据变化，会通过对象属性来查找对应的effect集合，找到effect全部执行



//watch api/computed/组件基于effect   ----vue2 watcher 没有区别