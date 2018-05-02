import { VNode } from "snabbdom/vnode";
import { patch, n, start, createComponent } from "../src/index";

interface State {
  value: string;
}
const myComponent = createComponent<number, State>({
  state: { value: "init" },
  events: {
    inputValue: (e, state) => {
      state.value = e.target.value;
    }
  },
  view(props, state, handle) {
    return n("div")._([
      n("input")
        .a("value", state.value)
        .e("input", handle("inputValue")),
      n("div")._(state.value + "_" + props)
    ]);
  }
});
interface RootState {
  num: number;
}
const rootComponent = createComponent<undefined, RootState>({
  state: {
    num: 100
  },
  events: {
    increment([step], state) {
      state.num += step;
    }
  },
  view(_, { num }, handle) {
    return n("div")._([
      n("button")
        .e("click", handle("increment", 5))
        ._("increment"),
      n("div")._(num),
      myComponent(num)
    ]);
  }
});

start(rootComponent, "container");
