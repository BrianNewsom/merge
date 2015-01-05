function s3_upload(){
    var status_elem = document.getElementById("status");
    var s3upload = new S3Upload({
        file_dom_selector: 'files',
        s3_sign_put_url: '/sign_s3',
        onProgress: function(percent, message) {
            status_elem.innerHTML = 'Upload progress: ' + percent + '% ' + message;
        },
        onFinishS3Put: function(public_url) {
            status_elem.innerHTML = 'Upload completed. Uploaded to: '+ public_url;
            url_elem.value = public_url;
            preview_elem.innerHTML = '<img src="'+public_url+'" style="width:300px;" />';
        },
        onError: function(status) {
            status_elem.innerHTML = 'Upload error: ' + status;
        }
    });
}
/*
* Listen for file selection:
*/
$(document).ready(function(){
    (function() {
        var input_element = document.getElementById("files");
        input_element.onchange = s3_upload;
    })();
});
