import { h, thunk as originalThunk, init } from "./snabbdom/src/snabbdom";
import { VNode } from "./snabbdom/src/vnode";
import { classModule } from "./snabbdom/src/modules/class";
import { propsModule } from "./snabbdom/src/modules/props";
import { styleModule } from "./snabbdom/src/modules/style";
import { eventListenersModule } from "./snabbdom/src/modules/eventlisteners";
import { stateModule } from "./state";
import { subscriptionsModule } from "./subscriptions";

export function thunk(selector, fn: any, args: any): VNodeX {
  const node = originalThunk(selector, fn, args);
  addHelpers(node);
  return node as VNodeX;
}

export const patch: (oldNode: VNode, newNode: VNode) => void = init([
  stateModule,
  subscriptionsModule,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule
]);

interface Options<P, S> {
  createState?(): S;
  subscriptions?(state: S, render: any): any;
  events: object;
  view(prop: P, state: S, handle: any): VNodeX;
}

function makeIterable(e, args) {
  for (let i = 1; i < args.length; i++) {
    e[i - 1] = args[i];
  }
  const length = args.length - 1;
  let cursor = 0;
  const iterator = {
    next() {
      if (cursor >= length) {
        return {
          done: true
        };
      } else {
        return {
          value: e[cursor++],
          done: false
        };
      }
    }
  };
  e[Symbol.iterator] = () => iterator;
}

export function createComponent<P, S>(
  options: Options<P, S>
): (prop: P) => any {
  return prop => {
    const component = {
      createState: options.createState,
      state: undefined,
      _handle(name) {
        const args = arguments;
        return e => {
          console.log("events." + name + " has been called.");
          function render() {
            // TODO
            console.log("render() has been called.");
          }
          makeIterable(e, args);
          const f = options.events[name];
          let triggerRender = f(e, component.state, render);
          if (triggerRender === undefined) {
            triggerRender = true;
          }
          if (triggerRender) {
            render();
          }
        };
      },
      view: options.view,
      _subscriptions: options.subscriptions
    };
    return {
      prop,
      component
    };
  };
}

interface VNodeX extends VNode {
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

function addHelpers(node: any) {
  node.a = (key, value = false) => {
    node.data.props = node.data.props || {};
    node.data.props[key] = value;
    return node;
  };
  node.c = function(key, active = true) {
    node.data.class = node.data.class || {};
    if (Array.isArray(key)) {
      for (let k of key) {
        node.data.class[k] = true;
      }
    } else {
      for (let k of key.split(" ")) {
        node.data.class[k] = active;
      }
    }
    return node;
  };
  node.s = function(key, value, active = true) {
    if (active) {
      node.data.style = node.data.style || {};
      node.data.style[key] = value;
    }
    return node;
  };
  node.e = (key, value) => {
    node.data.on = node.data.on || {};
    node.data.on[key] = value;
    return node;
  };
  node.h = (name, f) => {
    node.data.hook = node.data.hook || {};
    node.data.hook[name] = f;
    return node;
  };
  node.k = name => {
    node.data.key = name;
    return node;
  };
  node.l = (childModels, f) => {
    return node._(
      childModels.map((model, index, array) => {
        const node = f(model, index, array);
        if (node.data.key === undefined) {
          throw new Error(
            `key for ${JSON.stringify(model, null, 2)} is not provided`
          );
        }
        return node;
      })
    );
  };
  node._ = children => {
    if (Array.isArray(children)) {
      node.children = node.children || [];
      node.children = children;
      node.text = undefined;
    } else if (children === undefined) {
      // need warning?
    } else {
      node.text = typeof children === "string" ? children : children.toString();
      node.children = undefined;
    }
    return node;
  };
}

export function n(tagName: string): VNodeX {
  const node = h(tagName);
  addHelpers(node);
  return node as VNodeX;
}

export function start(
  rootComponent: (props: undefined) => VNode,
  element: Element | string
) {
  const oldNode: any = element
    ? typeof element === "string"
      ? document.getElementById(element)
      : element
    : document.body;
  patch(oldNode, rootComponent(undefined));
}
