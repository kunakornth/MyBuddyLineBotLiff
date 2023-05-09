import axios from 'axios';

import template from 'url-template';

const _apiEndpoint = '';//backendServer;

const _client = axios.create({
    responseType: 'json',
    headers: {
        'Content-Type': 'application/json',
     
    },
    cancelToken: new axios.CancelToken(() => {
     
    }),
});
// const _cancel = () => { };

function responseHandler(promise) {
    return promise.then((response) => {
        console.log('%cRESPONSE => ', 'color: green; font-weight: bold;', response.data);
        return response.data;
    });
}

function requestHandler(formData) {
    let transformedFormData = formData;
    
    // *check Key And Value
    // forOwn(formData, (v, k) => {
    // *Delete value if value !== null and undifined      
    //     if (null !== v && 'undefined' !== typeof v  ) {
    //         delete transformedFormData[k];
    //     }
    // });

    console.log('%cFORM_DATA => ', 'color: blue; font-weight: bold;', transformedFormData);

    transformedFormData = JSON.stringify(transformedFormData);
    return transformedFormData;
}



function parseUrl(path) {
    const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)/;
    if (regex.test(path)) {
        return path;
    }

    return `${_apiEndpoint}${path}`;
}

export function get(_path, _params = {}) {
    const url = template.parse(`${parseUrl(_path)}{?_params*}`).expand({
        _params: {
            ..._params
        }
    });

    console.log('API[GET] ==>', url);

    return responseHandler(_client.get(url));
}

export function post(_path, _formData = {}) {
    const url = parseUrl(_path);
    console.log('API[POST] ==>', url);
    return responseHandler(
        _client.post(url, requestHandler(_formData))
    );
}

