var socket = io("http://localhost:3000/");

var listUser = [];
var indexUser = '';
var userSend = '';

var j = '';
socket.on("UserLogin",function(data){
    if(data.check === false)
    {
        if(indexUser === '')
        {
            indexUser = data.user;
        }
        if(listUser.indexOf(data.user) < 0)
        {
            var content = `<li id="${data.user}">
                                <a href="#" class="clearfix">
                                    <img src="http://bootdey.com/img/Content/user_1.jpg" alt="" class="img-circle">
                                    <div class="friend-name" style="line-height:50px">
                                	    &nbsp;	&nbsp;<strong>${data.user}</strong>
                                    </div>
                                    <small class="chat-alert text-muted"><i class="fa fa-check"></i></small>
                                </a>
                           </li>`;
            $("#ListMember").append(content);
            listUser.push(data.user);
        }
        else
        {
            if(indexUser === '')
            {
               indexUser = data.user;
            }
            $("#ListMember").empty();
            $.each(listUser,function(){
                 var content = `<li id="${this}">
                                <a href="#" class="clearfix">
                                    <img src="http://bootdey.com/img/Content/user_1.jpg" alt="" class="img-circle">
                                    <div class="friend-name" style="line-height:50px">
                                	    &nbsp;	&nbsp;<strong>${this}</strong>
                                    </div>
                                    <small class="chat-alert text-muted"><i class="fa fa-check"></i></small>
                                </a>
                           </li>`;
            $("#ListMember").append(content);
            });
        }
    }
    else
    {
         if(indexUser === '')
            {
               indexUser = data.indexUser;
            }
         $("#ListMember").empty();
            $.each(data.lst,function(){
                 var content = `<li id="${this}">
                                <a href="#" class="clearfix">
                                    <img src="http://bootdey.com/img/Content/user_1.jpg" alt="" class="img-circle">
                                    <div class="friend-name" style="line-height:50px">
                                	    &nbsp;	&nbsp;<strong>${this}</strong>
                                    </div>
                                    <small class="chat-alert text-muted"><i class="fa fa-check"></i></small>
                                </a>
                           </li>`;
            $("#ListMember").append(content);
            });
    }
});

socket.on("LogOut",function(data){
    var id = listUser.indexOf(data);
    listUser.splice(id,1);
    indexUser = '';
    $( "#"+data).remove();
});

function SendMessage(){
    console.log($("#MessageContent").text());
    if($("#MessageContent").val() !== '')
    {
        socket.emit("Client_SendMessage",{Message:$("#MessageContent").val(),User:indexUser});
        $("#MessageContent").val('');
    }
};

socket.on("Server_RepplyMessage",function(data){
    var myUser = $("#userName").val();
    var i = 'media-left';
    j = '';
    if(data.UserName !== myUser)
    {
         i = 'media-right';
         j = 'speech-right';
    }
    var content = `<li class="mar-btm">
    							<div class="${i}">
    								<img src="http://bootdey.com/img/Content/avatar/avatar1.png" class="img-circle img-sm" alt="Profile Picture">
    							</div>
    							<div class="media-body pad-hor ${j}">
    								<div class="speech">
    									<a href="#" class="media-heading" style="font-weight:bold">${data.UserName}</a>
    									<p>${data.Message}</p>
    									<p class="speech-time" style="color:white">
    									<i class="fa fa-clock-o fa-fw"></i>&nbsp;&nbsp;${moment().add(24, 'hours').format("YYYY/MM/DD HH:mm a").toString()}
    									</p>
    								</div>
    							</div>
    						</li>`;
    $("#lstMessage").append(content);
});
