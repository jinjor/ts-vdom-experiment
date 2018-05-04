import { VNode } from "snabbdom/vnode";
import { patch, n, start, createComponent } from "../../src/index";

interface TodoProps {
  todo: Todo;
  handleToggle: any;
  handleRemove: any;
}
const todoComponent = createComponent<TodoProps, undefined>({
  name: "todo",
  view({ todo, handleToggle, handleRemove }, _, handle) {
    return n("li")
      .c("completed", todo.done)
      ._([
        n("div.view")._([
          n("input.toggle")
            .a("type", "checkbox")
            .a("checked", todo.done)
            .e("change", handleToggle),
          n("label")._(todo.name),
          n("button.destroy").e("click", handleRemove)
        ]),
        n("input.edit").a("value", "Role the web")
      ]);
  }
});

class Todos extends Array<Todo> {
  isAllDone(): boolean {
    for (let todo of this) {
      if (!todo.done) {
        return false;
      }
    }
    return true;
  }
  hasSomethingDone(): boolean {
    for (let todo of this) {
      if (todo.done) {
        return true;
      }
    }
    return false;
  }
  isEmpty(): boolean {
    return this.length === 0;
  }
}
class Todo {
  constructor(public name: string, public done: boolean) {}
  toggle() {
    this.done = !this.done;
  }
}
interface App {
  text: string;
  hash: string;
  todos: Todos;
}
const app = createComponent<undefined, App>({
  name: "app",
  createState(hash) {
    return {
      text: "",
      hash: hash,
      todos: new Todos()
    };
  },
  subscriptions(handle) {
    const listener = handle("updateHash");
    return {
      init() {
        return location.hash;
      },
      add() {
        window.addEventListener("hashchange", listener);
      },
      remove() {
        window.removeEventListener("hashchange", listener);
      }
    };
  },
  events: {
    updateHash(e, state) {
      state.hash = location.hash;
    },
    input(e, state) {
      state.text = e.target.value;
    },
    add(e, state, setState) {
      // TODO filter
      if (e.keyCode === 13 && state.text.trim().length) {
        state.todos.push(new Todo(state.text, false));
        state.text = "";
        return true;
      }
      return false;
    },
    toggleAll(_, state) {
      state.todos.forEach(todo => {
        todo.toggle();
      });
    },
    toggle([index], state) {
      state.todos[index].toggle();
    },
    remove([index], state) {
      state.todos.splice(index, 1);
    },
    clearCompleted(_, state) {
      state.todos = state.todos.filter(todo => !todo.done);
    }
  },
  view(_, state, handle) {
    return n("section.todoapp")._([
      n("header.header")._([
        n("h1")._("todos"),
        n("input.new-todo")
          .a("placeholder", "What needs to be done?")
          .a("autofocus")
          .a("value", state.text)
          .e("input", handle("input"))
          .e("keyup", handle("add"))
      ]),
      n("section.main")
        .s("display", "none", state.todos.isEmpty())
        ._([
          n("input#toggle-all.toggle-all")
            .a("type", "checkbox")
            .a("checked", state.todos.isAllDone()),
          n("label")
            .a("for", "toggle-all")
            .e("click", handle("toggleAll"))
            ._("Mark all as complete"),
          n("ul.todo-list").l(state.todos, (todo, index) =>
            todoComponent({
              todo: todo,
              handleToggle: handle("toggle", index),
              handleRemove: handle("remove", index)
            })
              .k(todo.name)
              .s(
                "display",
                "none",
                (state.hash === "#/active" && todo.done) ||
                  (state.hash === "#/completed" && !todo.done)
              )
          )
        ]),
      n("footer.footer")
        .s("display", "none", state.todos.isEmpty())
        ._([
          n("span.todo-count")._([
            n("strong")._(state.todos.length),
            n("span")._(" items left")
          ]),
          n("ul.filters")._([
            n("li")._([
              n("a")
                .c("selected", state.hash === "#/")
                .a("href", "#/")
                ._("All"),
              n("a")
                .c("selected", state.hash === "#/active")
                .a("href", "#/active")
                ._("Active"),
              n("a")
                .c("selected", state.hash === "#/completed")
                .a("href", "#/completed")
                ._("Completed")
            ])
          ]),
          n("button.clear-completed")
            .s("display", "none", !state.todos.hasSomethingDone())
            .e("click", handle("clearCompleted"))
            ._("Clear completed")
        ])
    ]);
  }
});

const container = document.getElementsByClassName("todoapp")[0];

start(app, container);
