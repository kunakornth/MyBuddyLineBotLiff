/* eslint-disable no-undef */
import {  post } from '@components/utils/ApiClient';
// import {newLinebotServer} from '@constants/sys.constants';


export async function CallNotiPerson(api,id,data,type){
    const _json = {
        lineid: id,
        message: data,
        type:type
    };
    return await post(api+'/notiApprovePerson', _json);
}

