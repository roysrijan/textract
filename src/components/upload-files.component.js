import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { HfInference } from "@huggingface/inference";

import UploadService from '../services/upload-files.service';

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

  async handleQuestion(e) {
    if (e.key === 'Enter') {
      console.log(e);
      this.setState({ query: e.target.value });
      const client = new HfInference("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")

      let out = "";

      const stream = client.chatCompletionStream({
        model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: e.target.value.replace('/n', '')
              },
              {
                type: "image_url",
                image_url: {
                  url: 'https://s3.ap-south-1.amazonaws.com/leasing.solution/' + this.state.fileInfos[0].name
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      let content = "";
      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const newContent = chunk.choices[0].delta.content;
          out += newContent;
          content += " " + newContent;
          console.log(newContent);
        }
      }
      this.setState({ answer: content });
      e.preventDefault();
      e.target.blur();
    }
  }

  render() {
    const { selectedFiles, currentFile, progress, query, answer, fileInfos } =
      this.state;

    return (
      <div className="container">
        {currentFile && (
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

        {!this.state.currentFile && <Dropzone onDrop={this.onDrop} multiple={false}>
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

        {query && <div class="d-flex align-items-start mt-1 mb-1">Me: <samp><span class="badge bg-light mt-1">{query}</span></samp></div>}

        {answer && <div class="d-flex align-items-end mt-1 mb-1">Docy: <samp><span class="badge bg-light">{answer}</span></samp></div>}

        {fileInfos?.length > 0 && (<div class="mt-3 mb-3">
          <label for="exampleFormControlTextarea1" class="form-label">Message Docy</label>
          <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" onKeyDown={e => this.handleQuestion(e)}></textarea>
        </div>)}
      </div>
    );
  }
}
