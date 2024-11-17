import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import UploadService from '../services/upload-files.service';
import axios from 'axios';

export default class UploadFiles extends Component {
  constructor(props) {
    super(props);
    this.upload = this.upload.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      selectedFiles: undefined,
      currentFile: undefined,
      progress: 0,
      message: '',
      query: '',
      answer: '',
      clear: false,
      fileInfos: [],
    };
  }

  componentDidMount() {

  }

  upload() {
    let currentFile = this.state.selectedFiles[0];

    this.setState({
      progress: 0,
      currentFile: currentFile,
    });

    UploadService.upload(currentFile, (event) => {
      this.setState({
        progress: Math.round((100 * event.loaded) / event.total),
      });
    })
      .then((response) => {
        this.setState({
          message: response.Blocks,
          fileInfos: [this.state.currentFile],
        });
        this.props.setBlocks(response.Blocks);
        return ''//UploadService.getFiles();
      })
      .catch(() => {
        this.setState({
          progress: 0,
          message: 'Could not upload the file!',
          currentFile: undefined,
        });
      });

    this.setState({
      selectedFiles: undefined,
    });
  }

  onDrop(files) {
    if (files.length > 0) {
      this.setState({ selectedFiles: files });
    }
  }

  async handleKeyDown(e) {
    if (e.key === 'Enter') {
      console.log(e);
      e.target.value = "";
      e.preventDefault();
      e.target.blur();
      this.handleQuestion();
    }
  }

  async handleQuestion() {
    this.setState({ answer: ".....", clear: true });

    const resp = await axios.post('https://peak-theorem-441815-t4.uc.r.appspot.com', {
      file_name: 'https://s3.ap-south-1.amazonaws.com/leasing.solution/' + this.state.fileInfos[0].name,
      file_type: this.state.fileInfos[0].type,
      text: this.state.query.replace('/n', '')
    });
    console.log("vertextai response:", resp.data);
    this.setState({ answer: resp.data.message });
  }

  render() {
    const { selectedFiles, currentFile, progress, query, answer, clear, fileInfos } =
      this.state;

    return (
      <div className="container">
        {currentFile && fileInfos?.length === 0 && (
          <div className="progress mb-3">
            <div
              className="progress-bar progress-bar-info progress-bar-striped"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: progress + '%' }}
            >
              {progress}%
            </div>
          </div>
        )}

        {!currentFile && <Dropzone onDrop={this.onDrop} multiple={false}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                {selectedFiles && selectedFiles[0].name ? (
                  <div className="selected-file">
                    {selectedFiles && selectedFiles[0].name}
                  </div>
                ) : (
                  'Drag and drop file here, or click to select file'
                )}
              </div>
              <aside className="selected-file-wrapper">
                <button
                  className="btn btn-success"
                  disabled={!selectedFiles}
                  onClick={this.upload}
                >
                  Upload
                </button>
              </aside>
            </section>
          )}
        </Dropzone>}

        {fileInfos?.length > 0 && (
          <div className="card">
            <div className="card-header">List of Files</div>
            <ul className="list-group list-group-flush">
              {fileInfos.map((file, index) => (
                <li className="list-group-item" key={index}>
                  <img src={'https://s3.ap-south-1.amazonaws.com/leasing.solution/' + file.name} width={300} height={213} />
                  <a href="javasciprt:;" onClick={() => this.props.setTab('search')}>{file.name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {clear && query && <div class="d-flex align-items-start mt-1 mb-1"><samp>Me: <span class="badge bg-light text-wrap" style={{ textAlign: "left" }}>{query}</span></samp></div>}

        {clear && answer && <div class="d-flex align-items-end mt-1 mb-1"><samp>Docy: <span class="badge bg-light text-wrap" style={{ textAlign: "left" }}>{answer}</span></samp></div>}

        {fileInfos?.length > 0 && (<div class="mt-3 mb-3">
          <label for="exampleFormControlTextarea1" class="form-label"><b>What can I help with?</b></label>
          <textarea
            class="form-control"
            placeholder="Message Docy"
            id="exampleFormControlTextarea1"
            rows="3"
            value={clear ? '' : query}
            onChange={e => this.setState({ query: e.target.value, clear: false })}
            onKeyDown={e => this.handleKeyDown(e)}
          />
          <button class="floating-btn" onClick={() => this.handleQuestion()}>
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>)}
      </div>
    );
  }
}
