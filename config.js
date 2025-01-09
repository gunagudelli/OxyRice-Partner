const config=(value)=>{
	var userStage="test1"
	var BASE_URL;
 if(userStage=="test1"){
	//Live	
  BASE_URL='https://meta.oxyloans.com/api/';

 }else {
	//Test
  BASE_URL='https://meta.oxyglobal.tech/api/';
	// BASE_URL='http://65.0.147.157:8282/api/';
 }
	// console.log(link);
	
	return (BASE_URL);
}

export default config();    