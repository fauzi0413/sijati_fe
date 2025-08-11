import axios from "axios";
import { v4 as uuidv4 } from "uuid";
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

// FETCH API USER
export const getUser = (callback) => {
  axios
  .get(`${baseURLBackEnd}/users`)
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const getUserByID = (id, callback) => {
  axios
  .get(`${baseURLBackEnd}/users/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const postUser = async (payload, callback) => {
  try {
      const response = await axios.post(`${baseURLBackEnd}/users`, payload, {
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

export const putUser = async (id, payload, callback) => {
  try {
      const response = await axios.put(`${baseURLBackEnd}/users/${id}`, payload, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      // console.log("Update Success:", response.data); // debug
      callback(response.data); // Jika sukses, panggil callback
  } catch (error) {
      console.error('Gagal mengirim data:', error);
  }
};

export const deleteUserById = (id, callback) => {
  axios
  .delete(`${baseURLBackEnd}/users/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const getTotalUserCount = (range, callback) => {
  let url = `${baseURLBackEnd}/users/total`;

  if (range?.start && range?.end) {
    url += `?start=${range.start}&end=${range.end}`;
  } else if (range?.start) {
    url += `?start=${range.start}`;
  }

  axios
    .get(url)
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};


// FETCH API USER
export const getLoginlogs = (callback) => {
  axios
  .get(`${baseURLBackEnd}/login-logs`)
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const getLoginlogsByID = (id, callback) => {
  axios
  .get(`${baseURLBackEnd}/login-logs/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const postLoginlogs = async (payload, callback) => {
  try {
      const response = await axios.post(`${baseURLBackEnd}/login-logs`, payload, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      // console.log("Post Success:", response.data); // debug
      callback(response.data); // Jika sukses, panggil callback
  } catch (error) {
      console.error('Gagal mengirim data:', error);
  }
};

// FETCH API CHAT HISTORY
export const getChatHistory = (callback) => {
  axios
  .get(`${baseURLBackEnd}/chat-history`)
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const getChatHistoryByID = (id, callback) => {
  axios
  .get(`${baseURLBackEnd}/chat-history/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const postChatHistory = async (payload, callback) => {
  try {
      const response = await axios.post(`${baseURLBackEnd}/chat-history`, payload, {
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

export const putChatHistory = async (id, payload, callback) => {
  try {
      const response = await axios.put(`${baseURLBackEnd}/chat-history/${id}`, payload, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      // console.log("Update Success:", response.data); // debug
      callback(response.data); // Jika sukses, panggil callback
  } catch (error) {
      console.error('Gagal mengirim data:', error);
  }
};

export const deleteChatHistoryById = (id, callback) => {
  axios
  .delete(`${baseURLBackEnd}/chat-history/${id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const getChatHistoryBySessionID = (session_id, callback) => {
  axios
  .get(`${baseURLBackEnd}/chat-history/session/${session_id}`)  
  .then((res) => {
    callback(res.data)
  }).catch((err) => {
    console.log(err)
  })
}

export const getGroupedChatHistoryByUserID = (user_id, callback) => {
  axios
    .get(`${baseURLBackEnd}/chat-history/user/${user_id}/grouped`)
    .then((res) => callback(res.data))
    .catch((err) => console.log(err));
};

export const createEmptySession = (user_id, callback) => {
  const session_id = uuidv4(); // generate session acak
  axios
    .post(`${baseURLBackEnd}/chat-history`, {
      session_id,
      user_id,
      created_at: new Date().toISOString(),
    })
    .then((res) => {
      callback(session_id); // kembalikan session_id ke pemanggil
    })
    .catch((err) => {
      console.error("Gagal buat session baru:", err);
    });
};

export const getTotalChatCount = (range, callback) => {
  const url =
    range === "all"
      ? `${baseURLBackEnd}/chat-history/stats/count`
      : `${baseURLBackEnd}/chat-history/stats/count/${range}`;

  axios
    .get(url)
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};

export const getPopularTopics = (callback) => {
  axios
    .get(`${baseURLBackEnd}/chat-history/stats/topics`)
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};

export const getHourlyChatStats = (callback) => {
  axios
    .get(`${baseURLBackEnd}/chat-history/stats/hourly`)
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};

export const getHourlyLoginStats = (callback) => {
  axios
    .get(`${baseURLBackEnd}/login-logs/stats/hourly`)
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};

export const getFaqCategoryStats = (callback) => {
  axios
    .get(`${baseURLBackEnd}/faq-manual/stats/category`) 
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};

export const getDocumentCategoryStats = (callback) => {
  axios
    .get(`${baseURLBackEnd}/document/stats/category`)
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};

// FETCH API FEEDBACK
export const postFeedback = async (payload, callback) => {
  try {
    const res = await axios.post(`${baseURLBackEnd}/feedback`, payload);
    callback(res.data);
  } catch (err) {
    console.error(err);
  }
};

export const getAverageFeedback = (callback) => {
  axios
    .get(`${baseURLBackEnd}/feedback/average`)
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};

export const getFeedback = (callback) => {
  axios
    .get(`${baseURLBackEnd}/feedback`)
    .then((res) => callback(res.data))
    .catch((err) => console.error(err));
};

