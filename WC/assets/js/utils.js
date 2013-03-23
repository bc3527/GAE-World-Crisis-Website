$(document).ready(function() {
    var form = $("#upload_form form");

    $('#fileupload').fileupload({
        url : form.attr("action"),
    });

    $("#flush_button").click(function() {
        var result = $("#flush_result");
        result.empty().append("<img src='/assets/images/transparent-ajax-loader.gif'>").fadeIn();
        
        $.ajax({
            url: "/flush",
            type: "post",
            data : {
                password: $("#flush_pass").val()
            },
            dataType : "json",
            success : function(data) {
                console.log(data);
                if(data.error){
                    result.html('<div><span class="label label-important">Error!</span> ' + data.error.message + "</div>");
                }
                else{
                    result.html('<div><span class="label success">Success!</span></div>');
                }
                
                setTimeout(function(){
                    result.children().fadeOut("slow");
                }, 3000);
            },
            

        });
    });

});