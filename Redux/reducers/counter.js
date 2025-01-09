
const counterReducer = (state=null,action)=>{
    switch (action.type) {
     case 'ACCESSTOKEN':
        return action.payload;
     default:
        return state;
    }
};

export default counterReducer;
