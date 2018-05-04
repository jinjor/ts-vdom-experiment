import vnode, {VNode, VNodeData, Key} from './vnode';

export function viewComponent(component: any) {
  const vnode = component.view(component.prop, component.state, component._handle);
  vnode.data.component = component;
  return vnode;
}

export function patchComponent(oldVnode: VNode, newVnode: VNode, patch: any) {
  if(newVnode.data.component) {
    const component = (oldVnode && oldVnode.data.component) || newVnode.data.component;
    component.prop = newVnode.data.component.prop;
    component._patch = () => {
      patch(newVnode, viewComponent(component));
    };
    if(component.state === undefined) {
      component.state = component.createState();
    }
    const tmpVnode = viewComponent(component);
    newVnode.sel = tmpVnode.sel;
    newVnode.children = tmpVnode.children;
    newVnode.text = tmpVnode.text;
    newVnode.key = tmpVnode.key;
    newVnode.elm = tmpVnode.elm;
    newVnode.data = tmpVnode.data;
  }
}
