import axios from 'axios';

class UploadFilesService {
  upload(file, onUploadProgress) {
    let formData = new FormData();

    formData.append('file', file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        const response = await axios.post('https://v618j3wl9d.execute-api.ap-south-1.amazonaws.com/dev/upload',
          JSON.stringify({ image: base64Image, name: file.name, type: file.type }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            onUploadProgress,
          });

        console.log(response.data);
        resolve(response.data);
      };
      reader.onerror = (error) => {
        console.error('Error: ', error);
        reject(error);
      };

    })
  }

  getFiles() {
    return axios.get('/files');
  }
}

export default new UploadFilesService();
