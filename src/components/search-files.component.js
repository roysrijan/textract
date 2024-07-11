import React, { useEffect, useState } from 'react';

const SearchFiles = ({ blocks }) => {
  const [query, setQuery] = useState();
  const [table, setTable] = useState();
  useEffect(() => {

    const blocksMap = {};
    const tableBlocks = [];

    blocks.forEach(block => {
      blocksMap[block.Id] = block;
      if (block.BlockType === 'TABLE') {
        tableBlocks.push(block);
      }
    });

    if (tableBlocks.length <= 0) {
      return "<b> NO Table FOUND </b>";
    }

    let csv;
    tableBlocks.forEach((table, index) => {
      csv = generateTableCsv(table, blocksMap, index + 1);
    });

    console.log(JSON.stringify(csv));
    setTable(csv);

    // Function to get rows and columns map
    function getRowsColumnsMap(tableResult, blocksMap) {
      const rows = {};
      const scores = [];

      tableResult.Relationships.forEach(relationship => {
        if (relationship.Type === 'CHILD') {
          relationship.Ids.forEach(childId => {
            const cell = blocksMap[childId];
            if (cell.BlockType === 'CELL') {
              const rowIndex = cell.RowIndex;
              const colIndex = cell.ColumnIndex;
              if (!rows[rowIndex]) {
                rows[rowIndex] = {};
              }
              scores.push(cell.Confidence.toString());
              rows[rowIndex][colIndex] = getText(cell, blocksMap);
            }
          });
        }
      });

      return { rows, scores };
    }

    // Function to get text
    function getText(result, blocksMap) {
      let text = '';
      if (result.Relationships) {
        result.Relationships.forEach(relationship => {
          if (relationship.Type === 'CHILD') {
            relationship.Ids.forEach(childId => {
              const word = blocksMap[childId];
              if (word.BlockType === 'WORD') {
                if (word.Text.includes(',') && !isNaN(word.Text.replace(/,/g, ''))) {
                  text += `"${word.Text}"`;
                } else {
                  text += `${word.Text}`;
                }
              }
              if (word.BlockType === 'SELECTION_ELEMENT' && word.SelectionStatus === 'SELECTED') {
                text += 'X ';
              }
            });
          }
        });
      }
      return text;
    }

    // Function to generate table CSV
    function generateTableCsv(tableResult, blocksMap, tableIndex) {
      const { rows, scores } = getRowsColumnsMap(tableResult, blocksMap);
      let csv = [];

      Object.keys(rows).forEach(rowIndex => {
        const cols = rows[rowIndex];
        const colIndices = Object.keys(cols).length;
        let temp = {};
        Object.keys(cols).forEach(colIndex => {
          let field = rows[1][colIndex.toString()];
          if (field)
            temp = { ...temp, [field]: { S: cols[colIndex] } };
        });
        console.log(temp)
        csv.push(temp);
      });
      return csv;
    }
    if (!query) setTable(csv)
    else setTable(csv.filter(o => Object.values(o).filter((e) => e["S"].includes(query))[0]))
  }, [query, blocks]);
  return (
    <div className="container">
      <form class="form-inline my-2 my-lg-0" onInput={(e) => setQuery(e.target.value)}>
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
      </form>
      <table className="table">
        {table && table.length > 0 && Object.keys(table[0]).map(ele => (
          <th>{ele}</th>
        ))}
        <tbody>
          {
            table && table.length > 0 && table
              .map(ele => (
                <tr>
                  {Object.keys(ele).map(index => (
                    <td className="col">{ele[index]["S"]}</td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default SearchFiles;
