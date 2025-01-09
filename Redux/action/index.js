export const AccessToken = (access) => {
    return{
     type: 'ACCESSTOKEN',
     payload: access
    };
} ;
export const UserID = (id) => {
    return{
     type: 'USER_ID',
     payload: id
    };
} ;
