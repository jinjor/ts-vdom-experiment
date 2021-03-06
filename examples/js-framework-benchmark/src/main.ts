// import { patch, n, start, createComponent } from "my-vdom";
import { n, start, createComponent } from "my-vdom/src/index";

import { Data, run, runLots, add, update, swapRows, deleteRow } from "./utils";

let startTime: any;
let lastMeasure: any;
function startMeasure(name: string) {
  startTime = performance.now();
  lastMeasure = name;
}
function stopMeasure() {
  const last = lastMeasure;
  if (lastMeasure) {
    window.setTimeout(() => {
      lastMeasure = null;
      const stop = performance.now();
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

const row = createComponent<RowProps, object>({
  name: "row",
  events: {
    click(e, state, _, props) {
      props.handleClick(e);
      return false;
    },
    delete(e, state, _, props) {
      props.handleDelete(e);
      return false;
    }
  },
  view({ selected, data }, state, handle) {
    return ["tr", selected, data.id, data.label, handle];
  },
  thunked(selected: boolean, id: number, label: string, handle: Function) {
    // console.log("row.view", selected, id, label);
    return n("tr")
      .c("danger", selected)
      ._([
        n("td.col-md-1")._(id),
        n("td.col-md-4")._([
          n("a")
            .e("click", handle("click"))
            ._(label)
        ]),
        n("td.col-md-1")._([
          n("a")
            .e("click", handle("delete"))
            ._([n("span.glyphicon.glyphicon-remove").a("aria-hidden", "true")])
        ]),
        n("td.col-md-6")
      ]);
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
      selected: undefined,
      id: 1
    };
  },
  events: {
    run(_, state) {
      startMeasure("run");
      state.id = run(state.data, state.id);
      state.selected = undefined;
    },
    add(_, state) {
      startMeasure("add");
      state.id = add(state.data, state.id);
    },
    update(_, state) {
      startMeasure("update");
      update(state.data);
    },
    select(id, state) {
      startMeasure("select");
      state.selected = id;
    },
    delete(id, state) {
      startMeasure("delete");
      deleteRow(state.data, id);
    },
    runLots(_, state) {
      startMeasure("runLots");
      state.id = runLots(state.data, state.id);
      state.selected = undefined;
    },
    clear(_, state) {
      startMeasure("clear");
      state.data.length = 0;
      state.selected = undefined;
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
              })
                .s("color", "red") // for debug
                .k(d.id);
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
