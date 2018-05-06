import { h, Component, Sub, init } from "./snabbdom/src/snabbdom";
import { VNode, VNodeX } from "./snabbdom/src/vnode";
import { classModule } from "./snabbdom/src/modules/class";
import { propsModule } from "./snabbdom/src/modules/props";
import { styleModule } from "./snabbdom/src/modules/style";
import { eventListenersModule } from "./snabbdom/src/modules/eventlisteners";

const patch: (oldNode: VNode, newNode: VNode) => void = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule
]);
interface Events<P, S> {
  [key: string]: (
    e: any,
    state: S,
    patch: () => void,
    prop: P
  ) => boolean | void;
}
interface Options<P, S> {
  name: string;
  createState?(initialSubValue: any): S;
  subscriptions?(handle: Function): Sub;
  events?: Events<P, S>;
  view(prop: P, state: S, handle: Function): VNodeX | Array<any>;
  thunked?: Function;
}

function makeIterable(e: any, args: any) {
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
      state: undefined as any,
      patch: undefined as any,
      handle(name) {
        const args = arguments;
        return e => {
          makeIterable(e, args);
          const f = events[name];
          if (f === undefined) {
            throw new Error(`event "${name}" is not defined`);
          }
          const triggerPatch = f(
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
    if (vnode.data) {
      vnode.data.component = component;
    }
    return vnode;
  };
}

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
