import { h, thunk, init } from "./snabbdom/src/snabbdom";
import { VNode } from "./snabbdom/src/vnode";
import { Module } from "./snabbdom/src/modules/module";

function create(_: VNode, newNode: VNode) {
  if (newNode.data.state === undefined) return;
  // console.log("state.create", newNode.data);
}
function update(oldNode: VNode, newNode: VNode) {
  if (newNode.data.state === undefined) return;
  // newNode.data.state = oldNode.data.state;
  // newNode.data.hook = oldNode.data.hook;

  // console.log("state.update", oldNode.data.state, newNode.data.state);
}

function destroy(oldNode: VNode, newNode: VNode) {
  // oldNode.data.instance = null;
  // oldNode.data.state = null;
  // console.log("state.destroy");
}

export const stateModule = {
  create: create,
  update: update,
  destroy: destroy
} as Module;
export default stateModule;
