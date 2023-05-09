import {  get,post } from '@components/utils/ApiClient';
import {backendServer } from '@constants/sys.constants';
export const getHourLeave = async () => {
    
    return await get(backendServer+'/getHourLeave');
};

export async function CallNotiPerson(api,id,data,type){
    const _json = {
        lineid: id,
        message: data,
        type:type
    };
    return await post(api+'/notiApprovePerson', _json);
}