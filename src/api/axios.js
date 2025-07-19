import axios from "axios";
const baseURLBackEnd = process.env.REACT_APP_BASE_URL_BACKEND;

// FETCH API FAQ MANUAL
export const getFAQ = (callback) => {
  axios
  .get(`${baseURLBackEnd}/faq-manual`)
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const getFAQByID = (id, callback) => {
  axios
  .get(`${baseURLBackEnd}/faq-manual/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const postFAQ = async (payload, callback) => {
  try {
      const response = await axios.post(`${baseURLBackEnd}/faq-manual`, payload, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      console.log("Post Success:", response.data); // debug
      callback(response.data); // Jika sukses, panggil callback
  } catch (error) {
      console.error('Gagal mengirim data:', error);
  }
};

export const putFAQ = async (id, payload, callback) => {
  try {
      const response = await axios.put(`${baseURLBackEnd}/faq-manual/${id}`, payload, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      console.log("Update Success:", response.data); // debug
      callback(response.data); // Jika sukses, panggil callback
  } catch (error) {
      console.error('Gagal mengirim data:', error);
  }
};

export const deleteFAQById = (id, callback) => {
  axios
  .delete(`${baseURLBackEnd}/faq-manual/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

// FETCH API DOKUMEN
export const getDocument = (callback) => {
  axios
  .get(`${baseURLBackEnd}/document`)
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const getDocumentByID = (id, callback) => {
  axios
  .get(`${baseURLBackEnd}/document/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const postDocument = async (payload, callback) => {
  try {
      const response = await axios.post(`${baseURLBackEnd}/document`, payload, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      console.log("Post Success:", response.data); // debug
      callback(response.data); // Jika sukses, panggil callback
  } catch (error) {
      console.error('Gagal mengirim data:', error);
  }
};

export const putDocument = async (id, payload, callback) => {
  try {
      const response = await axios.put(`${baseURLBackEnd}/document/${id}`, payload, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      console.log("Update Success:", response.data); // debug
      callback(response.data); // Jika sukses, panggil callback
  } catch (error) {
      console.error('Gagal mengirim data:', error);
  }
};

export const deleteDocumentById = (id, callback) => {
  axios
  .delete(`${baseURLBackEnd}/document/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}