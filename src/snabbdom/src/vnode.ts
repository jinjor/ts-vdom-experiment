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
  a(key, value = false): VNodeXImpl {
    this.data.props = this.data.props || {};
    this.data.props[key] = value;
    return this;
  }
  c(key, active = true): VNodeXImpl {
    this.data.class = this.data.class || {};
    if (Array.isArray(key)) {
      for (let k of key) {
        this.data.class[k] = true;
      }
    } else {
      for (let k of key.split(" ")) {
        this.data.class[k] = active;
      }
    }
    return this;
  }
  s(key, value, active = true): VNodeXImpl {
    if (active) {
      this.data.style = this.data.style || {};
      this.data.style[key] = value;
    }
    return this;
  }
  e(key, value):VNodeXImpl {
    this.data.on = this.data.on || {};
    this.data.on[key] = value;
    return this;
  }
  h(name, f):VNodeXImpl {
    this.data.hook = this.data.hook || {};
    this.data.hook[name] = f;
    return this;
  }
  k(name):VNodeXImpl {
    this.key = name;
    return this;
  }
  l(childModels, f):VNodeXImpl {
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
  _(children):VNodeXImpl {
    if (Array.isArray(children)) {
      this.children = this.children || [];
      this.children = children;
      this.text = undefined;
    } else if (children === undefined) {
      // need warning?
    } else {
      this.text = typeof children === "string" ? children : children.toString();
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
