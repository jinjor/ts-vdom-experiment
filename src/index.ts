import { h, thunk, Component, Sub, init } from "./snabbdom/src/snabbdom";
import { VNode, VNodeX } from "./snabbdom/src/vnode";
import { classModule } from "./snabbdom/src/modules/class";
import { propsModule } from "./snabbdom/src/modules/props";
import { styleModule } from "./snabbdom/src/modules/style";
import { eventListenersModule } from "./snabbdom/src/modules/eventlisteners";

export const patch: (oldNode: VNode, newNode: VNode) => void = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule
]);

interface Options<P, S> {
  name: string;
  createState?(initialSubValue: any): S;
  subscriptions?(handle: any): Sub;
  events?: object;
  view(prop: P, state: S, handle: any): VNodeX | Array<any>;
  thunked?: Function;
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

function createStateDefault(): any {
  return {};
}
export function createComponent<P, S>(
  options: Options<P, S>
): (prop: P) => VNodeX {
  return prop => {
    const events = options.events || {};
    const component: Component<P, S> = {
      name: options.name,
      createState: options.createState || createStateDefault,
      prop: prop,
      state: undefined,
      patch: undefined,
      handle(name) {
        const args = arguments;
        return e => {
          makeIterable(e, args);
          const f = events[name];
          if (f === undefined) {
            throw new Error(`event "${name}" is not defined`);
          }
          let triggerPatch = f(
            e,
            component.state,
            component.patch,
            component.prop
          );
          if (triggerPatch === undefined || triggerPatch === true) {
            component.patch();
          }
        };
      },
      view: options.view,
      thunked: options.thunked,
      subscriptions: options.subscriptions
    };
    const vnode = n(options.name);
    vnode.data.component = component;
    return vnode;
  };
}

// function addHelpers(node: any) {
//   node.a = (key, value = false) => {
//     node.data.props = node.data.props || {};
//     node.data.props[key] = value;
//     return node;
//   };
//   node.c = function(key, active = true) {
//     node.data.class = node.data.class || {};
//     if (Array.isArray(key)) {
//       for (let k of key) {
//         node.data.class[k] = true;
//       }
//     } else {
//       for (let k of key.split(" ")) {
//         node.data.class[k] = active;
//       }
//     }
//     return node;
//   };
//   node.s = function(key, value, active = true) {
//     if (active) {
//       node.data.style = node.data.style || {};
//       node.data.style[key] = value;
//     }
//     return node;
//   };
//   node.e = (key, value) => {
//     node.data.on = node.data.on || {};
//     node.data.on[key] = value;
//     return node;
//   };
//   node.h = (name, f) => {
//     node.data.hook = node.data.hook || {};
//     node.data.hook[name] = f;
//     return node;
//   };
//   node.k = name => {
//     node.key = name;
//     return node;
//   };
// }

export function n(tagName: string): VNodeX {
  return h(tagName) as VNodeX;
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
