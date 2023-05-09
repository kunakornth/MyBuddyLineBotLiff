import {  post } from '@components/utils/ApiClient';
import {backendServer ,linebotServer} from '@constants/sys.constants';
export const AddMeeting = async (title,locate,desc,startdatetime,enddatetime,person,max) => {
    let all_person = '';
    if(person.length === max){
        all_person = 'ทุกคน';
    }
    else{
        for(let i =0;i<person.length ;i++){
            all_person = all_person+ person[i]+' ';
        }
    }
    
    let summary = title+' ( '+all_person+' )';
    let location = locate;
    let description = desc;
    let start = startdatetime+':00';
    // 2020-03-27T18:30
    let end = enddatetime+':00';

    const _json = {
        eventName: summary,
        location: location,
        description: description,
        startTime: start,
        endTime: end
    };
    return await post(backendServer+'/addMeetingToCalendar', _json);
};

export const CallNotiMeeting = async (summary,location,description,startdatetime,enddatetime,name) => {
    const _json = {
        linename: name,
        summary: summary,
        location: location,
        description: description,
        startdatetime: startdatetime,
        enddatetime: enddatetime
    };
    console.log(_json);
    return await post(linebotServer+'/callMeeting', _json);
};

