export interface Data {
  id: number;
  label: string;
}

function _random(max: number) {
  return Math.round(Math.random() * 1000) % max;
}

function updateData(data: Array<Data>) {
  for (let i = 0; i < data.length; i += 10) {
    data[i].label += " !!!";
  }
}
const adjectives = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy"
];
const colours = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange"
];
const nouns = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard"
];
export function addData(data: Array<Data>, id: number, count: number): number {
  for (let i = 0; i < count; i++)
    data.push({
      id: id++,
      label:
        adjectives[_random(adjectives.length)] +
        " " +
        colours[_random(colours.length)] +
        " " +
        nouns[_random(nouns.length)]
    });
  return id;
}

export function add(data: Array<Data>, id: number): number {
  return addData(data, id, 1000);
}
export function run(data: Array<Data>, id: number): number {
  data.length = 0;
  return addData(data, id, 1000);
}
export function runLots(data: Array<Data>, id: number): number {
  data.length = 0;
  return addData(data, id, 10000);
}
export function update(data: Array<Data>) {
  updateData(data);
}

export function swapRows(data: Array<Data>) {
  if (data.length > 998) {
    const temp = data[1];
    data[1] = data[998];
    data[998] = temp;
  }
}
export function deleteRow(data: Array<Data>, id: number) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      data.splice(i, 1);
      return;
    }
  }
}
