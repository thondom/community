const socket = io.connect("https://thondom.herokuapp.com/", {
    query: {
        token: getTokenBearer()
    }
});
function getTokenBearer () {
    let token = (getCurrentToken() == true ? localStorage.getItem('uid_connected') : false);
    if (token != false) {
       return token
    }
    else {
       return null;
    }
}   
function checkTokenBearer (token) {
    let t = token.split('.');
    if (typeof t != undefined && t.length === 3){
        return true;
    }
    else{
        return false;
    }
} 

function checkJSON (json, status) {
    if (typeof json !== 'string'){
         return false;
    }
    else{
         try {
            const isJSON = JSON.parse(json);
            const typeJSON = Object.prototype.toString.call(isJSON);
            const returnType = (typeJSON === '[object Object]' || typeJSON === '[object Array]') ? true:false;
            if (returnType == true) {
                if (status != null) {
                    return json;
                }
                else {
                    return returnType;
                }
            }
            else{
                return false;
            }
         }
         catch(err){
             return false;
         }
    }
}    

function getCurrentToken (getdata) {

     let UID_CONNECTED = localStorage.getItem('uid_connected');
     let DATA_USER = localStorage.getItem('dataUser');

     if (UID_CONNECTED && DATA_USER){
           let checkTokenBear = checkTokenBearer(UID_CONNECTED); 
           let check_JSON = checkJSON(DATA_USER, null);
           if (check_JSON != false && checkTokenBearer != false){
                if (getdata){
                    let J_PARSE = JSON.parse(DATA_USER);
                    return J_PARSE[getdata];
                }
                else{
                   return true
                }
           }
           else{
               return false
           }

     }
     else{
           return false;
     }
}

function setStorage (err, token, data) {
       if (err === 0 && token && data){   
          localStorage.setItem('uid_connected', token);
          localStorage.setItem('dataUser', JSON.stringify(data));
 
       }
       else{
          removeStorage();
       }
  
}

function removeStorage () {
    let checkToken = getCurrentToken();
    if (checkToken != false){
       localStorage.removeItem('uid_connected');
       localStorage.removeItem('dataUser');   
    }
} 


function getAll () { 
      let validJSON = checkJSON(localStorage.getItem('dataUser'), true);
      let JSONDataUser = (getCurrentToken() == true ? localStorage.getItem('dataUser'):false);
      if (JSONDataUser == false){      
          return false;
      }
      else if (validJSON == false || validJSON == undefined) {
          return false;        
      }
      else{
          return true; 
      }             

}


$(document).ready(function(){


    (function($){ 

      function handleClient () {
           var j = getAll();
           var clientComment = '';           
           var validJSON = checkJSON(localStorage.getItem('dataUser'), true);
           if (j === true) {
                  $.ajax({
                      url:'https://thondom.herokuapp.com/api/auth', 
                      type:'post', 
                      data:validJSON, 
                      beforeSend: function (xhr) {
                          xhr.setRequestHeader('Authorization', 'Bearer '+getTokenBearer());
                      },                      
                      dataType:'json', 
                      async:true,
                      success:function(res){
                          let err = res.error; 
                          if (err === 1) {
                             clientComment += "<div class='box-login-comment flexer flexer-center-center flexer-column'><div class='get_name'><input type='text' placeholder='Nhập tên của bạn...' class='yourname' /></div><div class='get_rating'><p class='title_rating'>Chọn đánh giá của bạn: </p><label><input type='radio' name='rating' value='1' class='yourrating'/><p class='text_rating'>1 trái dừa</p></label><label><input type=\"radio\" name=\"rating\" value=\"2\" class=\"yourrating\"/><p class=\"text_rating\">2 trái dừa</p></label><label><input type=\"radio\" name=\"rating\" value=\"3\" class=\"yourrating\"/><p class=\"text_rating\">3 trái dừa</p></label><label><input type=\"radio\" name=\"rating\" value=\"4\" class=\"yourrating\"/><p class=\"text_rating\">4 trái dừa</p></label><label><input type=\"radio\" name=\"rating\" value=\"5\" class=\"yourrating\"/><p class=\"text_rating\">5 trái dừa</p></label></div><div class='blocked-comment flexer flexer-center-center'><button class='btn btn-firefly btn-submit'>Đăng nhập thành viên</button></div></div>";
                             $('.main--comment').append(clientComment);
                             registry()
                          }       
                          else {
                             clientComment += "<div class='box-comment flexer flexer-center-center'><div class='edge-box-comment'><textarea name='text-comment' class='text-comment' placeholder='Nhập nhật xét của bạn...' rows='3'></textarea><button class='btn btn-firefly btn-submit-text-comment'>Gửi</button></div></div>";
                             $('.main--comment').append(clientComment);
                             socket.emit('new_client', checkJSON(localStorage.getItem('dataUser'), true))
                             submitComment(); 
                          }
                      }
                    }); 
           }
           else {
                 clientComment += "<div class='box-login-comment flexer flexer-center-center flexer-column'><div class='get_name'><input type='text' placeholder='Nhập tên của bạn...' class='yourname' /></div><div class='get_rating'><p class='title_rating'>Chọn đánh giá của bạn: </p><label><input type='radio' name='rating' value='1' class='yourrating'/><p class='text_rating'>1 trái dừa</p></label><label><input type=\"radio\" name=\"rating\" value=\"2\" class=\"yourrating\"/><p class=\"text_rating\">2 trái dừa</p></label><label><input type=\"radio\" name=\"rating\" value=\"3\" class=\"yourrating\"/><p class=\"text_rating\">3 trái dừa</p></label><label><input type=\"radio\" name=\"rating\" value=\"4\" class=\"yourrating\"/><p class=\"text_rating\">4 trái dừa</p></label><label><input type=\"radio\" name=\"rating\" value=\"5\" class=\"yourrating\"/><p class=\"text_rating\">5 trái dừa</p></label></div><div class='blocked-comment flexer flexer-center-center'><button class='btn btn-firefly btn-submit'>Đăng nhập thành viên</button></div></div>";
                 $('.main--comment').append(clientComment);
                 registry()

           }        
      }

      function returnMessage () {
          socket.on('received_message', function(data){
            console.log(data)
            let return_to_client = '';            
            let name_client = data.client.client_name;
            let avt_inner_client = name_client.substring(0, 1);            
            let rating_client = data.client.client_rating;
            let content_mess_client = data.content;

            return_to_client += "<div class='line_mess flexer flexer-left-center'><div class='avatar_client'>"+ avt_inner_client +"<div class='online'></div><div class='rating_number'>"+ rating_client +" sao</div></div><div class='content_mess'><div class='info_name_client short-text-1'>"+ name_client +"</div>"+ content_mess_client +"</div></div>";
            $('.result--comment').append(return_to_client);
          });         
      }

    	function registry () { 
    		$('.btn-submit').on('click', function(){
    		   let yourname = $.trim($(".yourname").val());
    		   let yourrating = $("input[name='rating']:checked").val();
           let validateYourName = (!/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀẾỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]{1,20}$/.test(yourname));
           let validateYourRating = ['1', '2', '3', '4', '5'];
               if (validateYourName) {
                   alert('Táo trưởng thôn cho biết: \nTên của bạn không hợp lệ. Thử lại với tên thật của cháu nhe!');
               }
               else if (!validateYourRating.includes(yourrating)){
                   alert('Táo trưởng thôn cho biết: \nHãy chọn đánh giá bằng quả dừa bên dưới! (1 quả dừa = 1 sao)');
               }
               else {
                    let json_data = {client_name: yourname, client_rating:yourrating};
                    $.ajax({
                      url:'https://thondom.herokuapp.com/api/client_login/login', 
                      type:'post',
                      data:json_data,
                      dataType:'json', 
                      async:true,
                      success:function(res){
                          console.log(res)
                          let err = res.error; 
                          setStorage(err, res.token, res.data)
                          window.location.reload(true);
                      }
                    });                   
               }    		   
    		})
    	}


      function submitComment () {
          $('.btn-submit-text-comment').on('click', function(){
             let textComment = $(".text-comment").val();
             let filterComment = textComment.replace(/<(.|\n)*?>/g, '');
             let trimComment = $.trim(filterComment);
             if (!trimComment) {
                   alert('Táo trưởng thôn cho biết: \nNhận xét của bạn không hợp lệ. Vui lòng thử lại sau!');
             }
             else if (trimComment.length < 1) {
                   alert('Táo trưởng thôn cho biết: \nNhận xét của bạn không hợp lệ. Vui lòng thử lại sau!');                  
             }
             else if (trimComment.length > 1000) {
                   alert('Táo trưởng thôn cho biết: \nNhận xét của bạn quá dài. Vui lòng thử lại sau!');                  
             }           
             else {
                   socket.emit('new_message', trimComment);
                   $('.text-comment').val(null)
             }  
          })
      }
      
      handleClient();
      returnMessage()
         
    })(jQuery);
})