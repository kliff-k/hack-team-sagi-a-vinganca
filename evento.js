<script type="text/javascript">
$('input#submit-googlecode').on('click', function() {
    var googlecode = $('input#googlecode').val();
    if ($.trim(googlecode) != '') {
        $.post('ajax/check.php', {code: googlecode}, function(data) {
            $('div#loginstatus').text(data);
            if (data == 1) {
                $('div#loginstatus').text('Logged in');
                $('div#loginform').hide();
            }
        });
    }
 });
 
</script>