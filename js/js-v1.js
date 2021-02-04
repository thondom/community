const URL = "https://thondom.herokuapp.com"; 
const socket = io.connect(URL, {
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
                      url:URL + '/api/auth', 
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
                             clientComment += "<div class='box-login-comment flexer flexer-center-center flexer-column'><div class='get_name'><input type='text' placeholder='Nhập tên của bạn...' class='yourname' /></div><div class='get_status'><p class='title_status'>Chọn trạng thái của bạn: </p><label><input type='radio' name='status' value='1' class='yourstatus'/><p class='text_status'>Vui vẻ</p></label><label><input type=\"radio\" name=\"status\" value=\"2\" class=\"yourstatus\"/><p class=\"text_status\">Buồn</p></label><label><input type=\"radio\" name=\"status\" value=\"3\" class=\"yourstatus\"/><p class=\"text_status\">Ổn</p></label><label><input type=\"radio\" name=\"status\" value=\"4\" class=\"yourstatus\"/><p class=\"text_status\">Giận</p></label><label><input type=\"radio\" name=\"status\" value=\"5\" class=\"yourstatus\"/><p class=\"text_status\">lo lắng</p></label></div><div class='blocked-comment flexer flexer-center-center'><button class='btn btn-firefly btn-submit'>Đăng nhập thành viên</button></div></div>";
                             $('.main--comment').append(clientComment);
                             registry()
                          }       
                          else {
                             clientComment += "<div class='box-comment flexer flexer-center-center'><div class='edge-box-comment'><textarea name='text-comment' class='text-comment' placeholder='Nhập nhật xét của bạn...' rows='3'></textarea><button class='btn btn-firefly btn-submit-text-comment'>Gửi</button></div></div>";
                             $('.main--comment').append(clientComment);
                             returnOptions();
                             returnListUsers();
                             logout();
                             socket.emit('new_client', checkJSON(localStorage.getItem('dataUser'), true))
                             submitComment(); 
                          }
                      }
                    }); 
           }
           else {
                 clientComment += "<div class='box-login-comment flexer flexer-center-center flexer-column'><div class='get_name'><input type='text' placeholder='Nhập tên của bạn...' class='yourname' /></div><div class='get_status'><p class='title_status'>Chọn trạng thái của bạn: </p><label><input type='radio' name='status' value='1' class='yourstatus'/><p class='text_status'>Vui vẻ</p></label><label><input type=\"radio\" name=\"status\" value=\"2\" class=\"yourstatus\"/><p class=\"text_status\">Buồn</p></label><label><input type=\"radio\" name=\"status\" value=\"3\" class=\"yourstatus\"/><p class=\"text_status\">Ổn</p></label><label><input type=\"radio\" name=\"status\" value=\"4\" class=\"yourstatus\"/><p class=\"text_status\">Giận</p></label><label><input type=\"radio\" name=\"status\" value=\"5\" class=\"yourstatus\"/><p class=\"text_status\">Lo lắng</p></label></div><div class='blocked-comment flexer flexer-center-center'><button class='btn btn-firefly btn-submit'>Đăng nhập thành viên</button></div></div>";
                 $('.main--comment').append(clientComment);
                 registry()

           }        
      }

      function returnOptions () {
          let return_options_dom = ''; 
          return_options_dom += "<div class='icon-options setting-options bg-default' style='background-image: url(/community/images/setting.svg)'></div><div class='icon-options logout-options bg-default' style='background-image: url(/images/logout.svg)'></div>";
          $('.right').append(return_options_dom);
      }

      function returnListUsers () {
         let return_list_users = '';
         return_list_users += "<div class='users-online bg-default' style='background-image: url(/community/images/users.svg)'><div class='edge-users-online short-text-1'>100</div></div>";
         $('.result--comment').append(return_list_users)
      }

      function returnMessage () {
          socket.on('received_message', function(data){
            let return_to_client = '';            
            let name_client = data.client.client_name;
            let avt_inner_client = name_client.substring(0, 1);            
            let color_inner_client = data.client.client_color;
            let status_client = data.client.client_status;
            let content_mess_client = data.content;

            return_to_client += "<div class='line_mess flexer flexer-left-center'><div class='avatar_client' style='background: "+ color_inner_client +"'>"+ avt_inner_client +"<div class='online'></div><div class='rating_number'>"+ status_client +"</div></div><div class='content_mess'><div class='info_name_client short-text-1'>"+ name_client +"</div>"+ content_mess_client +"</div></div>";
            $('.result--comment').append(return_to_client);
          });         
      }

      function returnClientOnline () {
          socket.on('client_online', function(data) {
              let total_client = data.total_client;
              let who_client = data.who_client;
              $('.edge-users-online').text(total_client)
          })
          socket.on('is_client_online', function(data){
              let is_client_online = data.data_client.client_name;
              let return_is_client_online = '';
              return_is_client_online += "<div class='is_client_online short-text-1'>"+ is_client_online +" đã tham gia thôn!</div>";
              $('.result--comment').append(return_is_client_online); 
          })
      }

    	function registry () { 
    		$('.btn-submit').on('click', function(){
    		   let yourname = $.trim($(".yourname").val());
    		   let yourstatus = $("input[name='status']:checked").val();
           let validateYourName = (!/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀẾỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]{1,20}$/.test(yourname));
           let validateYourStatus = ['1', '2', '3', '4', '5'];
               if (validateYourName) {
                   alert('Tên của bạn không hợp lệ. Thử lại với tên thật của bạn nhe!');
               }
               else if (!validateYourStatus.includes(yourstatus)){
                   alert('Hãy chọn trạng thái của bạn.');
               }
               else {
                    let json_data = {client_name: yourname, client_status:yourstatus};
                    $.ajax({
                      url:URL + '/api/client_login/login', 
                      type:'post',
                      data:json_data,
                      dataType:'json', 
                      async:true,
                      success:function(res){
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
                   alert('\nNhận xét của bạn không hợp lệ. Vui lòng thử lại sau!');
             }
             else if (trimComment.length < 1) {
                   alert('\nNhận xét của bạn không hợp lệ. Vui lòng thử lại sau!');                  
             }
             else if (trimComment.length > 1000) {
                   alert('\nNhận xét của bạn quá dài. Vui lòng thử lại sau!');                  
             }           
             else {
                   socket.emit('new_message', trimComment);
                   $('.text-comment').val(null);
                   $('.result--comment').animate({
                       scrollTop: $('.result--comment').get(0).scrollHeight
                   }, 500);                   
             }  
          })
      }
      
      function logout () {
         $('.logout-options').on('click', function(){
             setPopupOverlay('Đăng xuất', 'Bạn có muốn đăng xuất không ?', true, 'oke-logout')
         })
         $(document).on('click', '.oke-logout' , function(){
             removeStorage();
             socket.emit('remove_client', true);
             window.location.reload(true);
         })
      }

      function setPopupOverlay (title, content, type, typeclass) {
          if (title && content) {
              if (type == true) {
                 $('.btn-continue').removeClass('hide-block');
                 $('.btn-continue').addClass(typeclass);                 
              }
              else {
                 $('.btn-cancel').addClass('btn-cancel-full');
              }
              $('.title-popup-overlay').text(title)
              $('.content-popup-overlay').html(content);
              $('.popup-overlay').fadeIn(100);
          }
          $('.btn-cancel').on('click', function(){
              $('.popup-overlay').fadeOut(100);   
          })
      }

      handleClient();
      returnMessage();
      returnClientOnline();
         
    })(jQuery);
})
