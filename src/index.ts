import { h, Handle, Component, Sub, init } from "./snabbdom/src/snabbdom";
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
  view(prop: P, state: S, handle: Handle): VNodeX | Array<any>;
  thunked?: Function;
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
      handle(name, data) {
        return e => {
          const f = events[name];
          if (f === undefined) {
            throw new Error(`event "${name}" is not defined`);
          }
          data = data === undefined ? e : data;
          const triggerPatch = f(
            data,
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
