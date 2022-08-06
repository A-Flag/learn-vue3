
//minist用来解析命令参数的
const args = require("minimist")(process.argv.slice(2));//node scripts/dev.js reactivity -f global"
const {resolve} = require('path');//node内置模块，帮忙找绝对路径
const {build} = require('esbuild');

// console.log(args);//{ _: [ 'reactivity' ], f: 'global' }

const target = args._[0]||'reactivity';
const format = args.f|| 'global';//打包格式

//开发环境只打包一个
const pkg = require(resolve(__dirname,`../packages/${target}/package.json`));//__dirname当前目录


//iife 立即执行函数 (function(){})
//cjs node中的模块 module.exports
//esm 浏览器中的esmodule模块 import
const outpuFormat = format.startsWith('global')?'iife':format==='cjs'?'cjs':'esm'//输出格式，startsWith是以什么开头的

const outfile = resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`);//输出文件，文件名+格式.js


//es6 天生支持ts vite--go
build({
    entryPoints:[resolve(__dirname,`../packages/${target}/src/index.ts`)],
    outfile,
    bundle:true,//把所有包全部打包到一起
    sourcemap:true,
    format:outpuFormat,//输出格式
    globalName:pkg.buildOptions?.name,//打包的全局名字
    platform:format==='cjs'?'node':'browser',//平台
    watch:{
        onRebuild(error){
            if(!error){
                console.log('---rebuild')
            }
        }
    }
}).then(()=>{
    console.log('watch----')
})