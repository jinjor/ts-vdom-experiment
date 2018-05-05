import {Hooks} from './hooks';
import {AttachData} from './helpers/attachto'
import {VNodeStyle} from './modules/style'
import {On} from './modules/eventlisteners'
import {Attrs} from './modules/attributes'
import {Classes} from './modules/class'
import {Props} from './modules/props'
import {Dataset} from './modules/dataset'
import {Hero} from './modules/hero'

export type Key = string | number;

export interface VNode {
  sel: string | undefined;
  data: VNodeData | undefined;
  children: Array<VNode | string> | undefined;
  elm: Node | undefined;
  text: string | undefined;
  key: Key | undefined;
}

export interface VNodeX extends VNode {
  a(key: string, value?: string | boolean): VNodeX;
  c(value: Array<string> | string, active?: boolean): VNodeX;
  e(key: string, value: (e: any) => void): VNodeX;
  h(name: string, f: Function): VNodeX;
  k(name: string | number): VNodeX;
  l<Data>(
    models: Array<Data>,
    f: (data: Data, index: number, array: Array<Data>) => VNodeX
  ): VNodeX;
  s(key: string, value: string, active?: boolean): VNodeX;
  _(children: Array<VNode> | string | number): VNodeX;
}

class VNodeXImpl implements VNodeX, VNode {
  constructor(
    public sel: string | undefined,
    public data: VNodeData | undefined,
    public children: Array<VNode | string> | undefined,
    public elm: Node | undefined,
    public text: string | undefined,
    public key: Key | undefined
  ){}
  ensureData(key: string): any {
    this.data = this.data || {};
    this.data.key = this.data[key] || {};
    return this.data.key;
  }
  a(key: string, value = false): VNodeXImpl {
    const props = this.ensureData("props");
    props[key] = value;
    return this;
  }
  c(key: string | string[], active = true): VNodeXImpl {
    const clas = this.ensureData("class");
    if (Array.isArray(key)) {
      for (let k of key) {
        clas[k] = true;
      }
    } else {
      for (let k of key.split(" ")) {
        clas[k] = active;
      }
    }
    return this;
  }
  s(key: string, value: any, active = true): VNodeXImpl {
    if (active) {
      const style = this.ensureData("style");
      style[key] = value;
    }
    return this;
  }
  e(key: string, value: any):VNodeXImpl {
    const on = this.ensureData("on");
    on[key] = value;
    return this;
  }
  h(name: string, f: Function):VNodeXImpl {
    const hook = this.ensureData("hook") as any;
    hook[name] = f;
    return this;
  }
  k(name: string | number):VNodeXImpl {
    this.key = name;
    return this;
  }
  l(childModels: any[], f: Function):VNodeXImpl {
    return this._(
      childModels.map((model, index, array) => {
        const node = f(model, index, array);
        if (node.key === undefined) {
          throw new Error(
            `key for ${JSON.stringify(model, null, 2)} is not provided`
          );
        }
        return node;
      })
    );
  }
  _(children: VNodeX[] | string | number):VNodeXImpl {
    if (Array.isArray(children)) {
      this.children = this.children || [];
      this.children = children;
      this.text = undefined;
    } else if (typeof children === "string") {
      this.text = children;
      this.children = undefined;
    } else if (typeof children === "number"){
      this.text = children.toString();
      this.children = undefined;
    }
    return this;
  }
}

export interface VNodeData {
  props?: Props;
  attrs?: Attrs;
  class?: Classes;
  style?: VNodeStyle;
  dataset?: Dataset;
  on?: On;
  hero?: Hero;
  attachData?: AttachData;
  hook?: Hooks;
  key?: Key;
  ns?: string; // for SVGs
  fn?: () => VNode; // for thunks
  args?: Array<any>; // for thunks
  [key: string]: any; // for any other 3rd party module
}

export function vnode(sel: string | undefined,
                      data: any | undefined,
                      children: Array<VNode | string> | undefined,
                      text: string | undefined,
                      elm: Element | Text | undefined): VNode {
  let key = data === undefined ? undefined : data.key;
  // return {sel: sel, data: data, children: children,
  //         text: text, elm: elm, key: key};
  return new VNodeXImpl(sel, data, children, elm, text, key);
}

export default vnode;
