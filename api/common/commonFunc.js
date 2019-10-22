const { DB_PREFIX } = require('../../config/column.json');



function createRORInsertQuery(table, data, roNumber) {
  let columns = '';
  let rows = [];
  if (Array.isArray(data)) {
    columns = Object.keys(data[0]).toString();
    data.map(value => beautifyInsertRORQuery(value, roNumber)).forEach(value => rows.push(`(${value.toString()})`));
  }
  else {
    columns = Object.keys(data).toString();
    rows.push(`(${beautifyInsertRORQuery(data, roNumber)})`);
  }

  return `Insert into [${ DB_PREFIX }].[${table}](${columns}) values ${rows};`;

}

function beautifyInsertRORQuery(data, roNumber) {
  let rowsGroup = [];
  Object.values(data).forEach((row) => {

    if (typeof (row) == ("number" || "boolean")) {
      rowsGroup.push(`${row}`);
    }
    else {
      if (row == null) {
        rowsGroup.push(`${row}`);
      } else {
        rowsGroup.push(`'${row}'`)
      }

    }
  });

  if (roNumber === null) {
    rowsGroup.splice(-1, 1, `@CounterInitialValue`);
  }

  return rowsGroup
}

module.exports = { createRORInsertQuery }