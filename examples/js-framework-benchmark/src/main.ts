import { VNode } from "snabbdom/vnode";
// import { patch, n, start, createComponent } from "my-vdom";
import { patch, thunk, n, start, createComponent } from "my-vdom/src/index";

import { Data, run, runLots, add, update, swapRows, deleteRow } from "./utils";

let startTime;
let lastMeasure;
function startMeasure(name) {
  startTime = performance.now();
  lastMeasure = name;
}
function stopMeasure() {
  const last = lastMeasure;
  if (lastMeasure) {
    window.setTimeout(() => {
      lastMeasure = null;
      const stop = performance.now();
      const duration = 0;
      console.log(last + " took " + (stop - startTime));
    }, 0);
  }
}

interface RowProps {
  selected: boolean;
  handleClick: any;
  handleDelete: any;
  data: Data;
}
function renderRow(selected, id, label, handle) {
  console.log("thunk", selected, id, label);
  return n("tr")
    .c("danger", selected)
    ._([
      n("td.col-md-1")._(id),
      n("td.col-md-4")._([
        n("a")
          .e("click", handle("_click"))
          ._(label)
      ]),
      n("td.col-md-1")._([
        n("a")
          .e("click", handle("_delete"))
          ._([n("span.glyphicon.glyphicon-remove").a("aria-hidden", "true")])
      ]),
      n("td.col-md-6")
    ]);
}
const row = createComponent<RowProps, object>({
  name: "row",
  createState() {
    return {};
  },
  events: {
    _click(e, state, _, props) {
      props.handleClick(e);
      return false;
    },
    _delete(e, state, _, props) {
      props.handleDelete(e);
      return false;
    }
  },
  // watch({ selected, data }, _) {
  //
  // },
  view({ selected, data }, state, handle) {
    // return n("div")._([
    //   thunk("tr", renderRow, [selected, data.id, data.label, handle])
    // ]);
    // return thunk("row", renderRow, [selected, data.id, data.label, handle]);
    return renderRow(selected, data.id, data.label, handle);
  }
});
interface RootState {
  selected?: number;
  id: number;
  data: Array<Data>;
}
const rootComponent = createComponent<undefined, RootState>({
  name: "root",
  createState() {
    return {
      data: [],
      selected: null,
      id: 1
    };
  },
  events: {
    run(_, state) {
      startMeasure("run");
      state.id = run(state.data, state.id);
      state.selected = null;
    },
    add(_, state) {
      startMeasure("add");
      state.id = add(state.data, state.id);
    },
    update(_, state) {
      startMeasure("update");
      update(state.data);
    },
    select([id], state) {
      startMeasure("select");
      state.selected = id;
    },
    delete([id], state) {
      startMeasure("delete");
      deleteRow(state.data, id);
    },
    runLots(_, state) {
      startMeasure("runLots");
      state.id = runLots(state.data, state.id);
      state.selected = null;
    },
    clear(_, state) {
      startMeasure("clear");
      state.data.length = 0;
      state.selected = null;
    },
    swapRows(_, state) {
      startMeasure("swapRows");
      swapRows(state.data);
    }
  },
  view(_, state, handle) {
    return n("div.container")
      ._([
        n("div.jumbotron")._([
          n("div.row")._([
            n("div.col-md-6")._([n("h1")._("my-vdom keyed")]),
            n("div.col-md-6")._([
              n("div.row")._([
                n("div.col-sm-6.smallpad")._([
                  n("button#run.btn.btn-primary.btn-block")
                    .a("type", "button")
                    .e("click", handle("run"))
                    ._("Create 1,000 rows")
                ]),
                n("div.col-sm-6.smallpad")._([
                  n("button#runlots.btn.btn-primary.btn-block")
                    .a("type", "button")
                    .e("click", handle("runLots"))
                    ._("Create 10,000 rows")
                ]),
                n("div.col-sm-6.smallpad")._([
                  n("button#add.btn.btn-primary.btn-block")
                    .a("type", "button")
                    .e("click", handle("add"))
                    ._("Append 1,000 rows")
                ]),
                n("div.col-sm-6.smallpad")._([
                  n("button#update.btn.btn-primary.btn-block")
                    .a("type", "button")
                    .e("click", handle("update"))
                    ._("Update every 10th row")
                ]),
                n("div.col-sm-6.smallpad")._([
                  n("button#clear.btn.btn-primary.btn-block")
                    .a("type", "button")
                    .e("click", handle("clear"))
                    ._("Clear")
                ]),
                n("div.col-sm-6 smallpad")._([
                  n("button#swaprows.btn.btn-primary.btn-block")
                    .a("type", "button")
                    .e("click", handle("swapRows"))
                    ._("Swap Rows")
                ])
              ])
            ])
          ])
        ]),
        n("table.table.table-hover.table-striped.test-data")._([
          n("tbody")
            .a("data-render-id")
            .l(state.data, (d, i) => {
              return row({
                data: d,
                handleClick: handle("select", d.id),
                handleDelete: handle("delete", d.id),
                selected: d.id === state.selected
              }).k(d.id); // TODO maybe not working
            })
        ]),
        n("span.preloadicon.glyphicon.glyphicon-remove").a(
          "aria-hidden",
          "true"
        )
      ])
      .h("postpatch", stopMeasure);
  }
});
start(rootComponent, document.getElementsByClassName("container")[0]);
