import React, { useEffect, useState } from 'react';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import UploadFiles from './components/upload-files.component';
import SearchFiles from './components/search-files.component';
import axios from 'axios';
import DateArea from './components/dashboard.component';

function App() {
  const [tab, setTab] = useState('home');
  const [blocks, setBlocks] = useState([]);
  const [files, setFiles] = useState();
  const [attr, setAttr] = useState([]);
  const [table, setTable] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    axios.get('https://v618j3wl9d.execute-api.ap-south-1.amazonaws.com/dev/feedback').then(res => {
      setFiles(res.data.Contents);
    })
    axios.post('https://v618j3wl9d.execute-api.ap-south-1.amazonaws.com/dev/feedback', {

        }).then(res => {
            let table = res.data.items.map(e=>({ 
                KeyNo: e["KeyNO"], 
                EmployeeName: e["Employeesame"],
                ReturnDate: e["ReturnedDiets"],
                IssueDate: e["Date"]
            }));
            setAttr(res.data.attributeNames);
            setTable(table);
            var temp = res.data.items.map(o => o.Date.S.split('/')[1] + '/' + o.Date.S.split('/')[0] + '/' + o.Date.S.split('/')[2]);
            var map = new Map();
            temp.forEach(ele => {
                if (map.get(ele)) map.set(ele, map.get(ele) + 1);
                else map.set(ele, 1);
            });
            var result = Array.from(map).map(o => ({ date: new Date(o[0]).getTime(), val: o[1] })).sort((a, b) => a.date - b.date);
            setData(result);
        })
  }, []);
  const handleClick = (Key) => {
    axios.post('https://v618j3wl9d.execute-api.ap-south-1.amazonaws.com/dev/feedback', {
      Key
    }).then(res => {
      setBlocks(res.data.Blocks);
      setTab('search');
    })
  };
  return (
    <>
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="#">Textract </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class={`nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
              <a class="nav-link" href="javascript:;">Home <span class="sr-only">(current)</span></a>
            </li>
            <li class={`nav-item ${tab === 'search' ? 'active' : ''}`} onClick={() => setTab('search')}>
              <a class="nav-link" href="javascript:;">Search</a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="javascript:;" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Documents
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                {files && files.map(ele => (<a class="dropdown-item" href="javascript:;" onClick={() => { console.log(ele); handleClick(ele.Key) }}>{ele.Key}</a>))}
              </div>
            </li>
            <li class={`nav-item ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>
              <a class="nav-link" href="javascript:;">File Upload</a>
            </li>
          </ul>
          <form class="form-inline my-2 my-lg-0">
            <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
          </form>
        </div>
      </nav>
      <div className={tab === 'upload' ? "container" : ""} style={{ width: '400px' }}>
        <div style={{ margin: tab === 'upload' ? '20px 0' : '20px' }}>
          {tab === 'home' ? <h4>KPIs</h4> :
            tab === 'search' ? <h4>Search File Information</h4> :
              <h4>Textract Drag & Drop File Upload</h4>}
        </div>

        {tab === 'home' ? <DateArea table={table} attr={attr} data={data} /> :
          tab === 'search' ? <SearchFiles blocks={blocks} /> :
            <UploadFiles setTab={setTab} setBlocks={setBlocks} />}
      </div>
    </>
  );
}

export default App;
