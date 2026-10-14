import { getApiEndpoints, endPoints } from "./apiEndPoints"

const getOptions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/languages');
      if (!response.ok) {
        throw new Error('Error while fetching Language Options !!!');
      }
      const options = await response.json();
      return options;
    } catch (error) {
      console.error(error);
    }
  };
  

  const translateText = async (text, sourceLanguage, destinationLanguage) => {
    const requestBody = {
      text: text,
      source_lang: sourceLanguage,
      dest_lang: destinationLanguage,
    };
  
    try {
      const response = await fetch('http://127.0.0.1:8000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error('Error while fetching text translation !!!');
      }
  
      const responseData = await response.json();
      return responseData?.translated_text ?? '';
    } catch (error) {
      console.error(error);
    }
  };
  

const getVoiceForText = async (text, language) => {
    const requestBody = {
        text: text,
        lang: language,
    };
    const url = 'http://127.0.0.1:8000/text-to-speech';
    try {
        const response = await fetch(url, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify(requestBody)
        })
        if(!response.ok){
            throw new Error('Error while fetching Speech for text !!!')
        }
        const audioBlob = await response.blob();
        const audioURL =  URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL)
        return audio

    } catch (error) {
        console.error(error)
    }
}

export {translateText, getOptions, getVoiceForText}