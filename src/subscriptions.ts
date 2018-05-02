import { h, thunk, init } from "./snabbdom/src/snabbdom";
import { VNode } from "./snabbdom/src/vnode";
import { Module } from "./snabbdom/src/modules/module";

// shoulld be a hook?

function create(_: VNode, newNode: VNode) {
  if (newNode.data.subscriptions === undefined) return;
  newNode.data.subscriptions.add();
  // console.log("subscriptions.create", newNode.data.subscriptions);
}
function update(oldNode: VNode, newNode: VNode) {
  if (newNode.data.subscriptions === undefined) return;
  // newNode.data.subscriptions = oldNode.data.subscriptions;
  // console.log(
  //   "subscriptions.update",
  //   oldNode.data.subscriptions,
  //   newNode.data.subscriptions
  // );
}

function destroy(oldNode: VNode, newNode: VNode) {
  if (oldNode.data.subscriptions === undefined) return;
  oldNode.data.subscriptions.remove();
  oldNode.data.subscriptions = null;
  // console.log("subscriptions.destroy");
}

export const subscriptionsModule = {
  create: create,
  update: update,
  destroy: destroy
} as Module;
export default subscriptionsModule;
