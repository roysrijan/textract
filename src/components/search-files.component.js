import React, { useEffect, useState } from 'react';

const SearchFiles = ({blocks}) => {
  const [fileInfos, setFileInfos] = useState([]);
  const [query, setQuery] = useState();
  useEffect(() => {
    let texts = blocks.map(o => o.Text);
    let index = texts.findIndex(o => o?.includes(query));
    if (!query) setFileInfos(texts);
    else setFileInfos([texts[index - 1], texts[index], texts[index + 1]])
  }, [query]);
  return (
    <>
      <form class="form-inline my-2 my-lg-0" onInput={(e) => setQuery(e.target.value)}>
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
      </form>
      <div className="row mt-4">
        {fileInfos?.length > 0 && fileInfos.map((file) => (
          <div className="badge badge-secondary m-2">
            {file}
          </div>
        ))
        }</div>
    </>
  );
}

export default SearchFiles;
