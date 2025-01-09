const loggedReducer = (state = null ,action)=>{
    switch (action.type) {
     case 'USER_ID':
        return action.payload;
     default:
        return state;
    }
};

export default loggedReducer;
