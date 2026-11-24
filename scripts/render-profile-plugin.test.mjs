import {test}from'node:test';
import assert from'node:assert/strict';
import vm from'node:vm';
import {instrumentRenders,renderProfilePlugin}from'./render-profile-plugin.mjs';
test('counters preserve return values, props and callback behavior',()=>{
 const input=`function Component(props){return props.value} const Arrow=(x)=>x+1; function helper(){return 5} globalThis.results=[Component({value:4}),Arrow(7),helper()];`;
 const result=instrumentRenders(input,'sample.tsx');const context={__sakugaRenderCalls:[]};vm.runInNewContext(result.code,context);
 assert.deepEqual([...context.results],[4,8,5]);assert.deepEqual(context.__sakugaRenderCalls,['sample.tsx:Component','sample.tsx:Arrow']);
});
test('diagnostic globals are optional and unrelated code is unchanged',()=>{
 const result=instrumentRenders('function View(){return 3} globalThis.result=View();','sample.tsx');const context={};vm.runInNewContext(result.code,context);assert.equal(context.result,3);
 const input='const lower = () => 1;';assert.equal(instrumentRenders(input,'sample.tsx').code,input);
});

test('function directives retain their semantics',()=>{
 const result=instrumentRenders("function View(){'use strict';return this} globalThis.result=View();",'sample.tsx');
 const context={__sakugaRenderCalls:[]};vm.runInNewContext(result.code,context);
 assert.equal(context.result,undefined);assert.equal(context.__sakugaRenderCalls.length,1);
});

test('presence trace preserves an inline conditional state update',()=>{
 const source="const open=false,shown=false; function useEffect(){} function setShown(){throw Error('unexpected update')} if(open && !shown) setShown(true); useEffect(() => {});";
 const result=renderProfilePlugin().transform(source,process.cwd()+'/src/internal/presence.ts');
 vm.runInNewContext(result.code,{});
});
