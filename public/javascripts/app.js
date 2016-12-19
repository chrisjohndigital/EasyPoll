function setLocalStorageData() {
    if (typeof(Storage) !== 'undefined') {
		localStorage.setItem(((window.location.href).replace(/[^A-Za-z0-9]/g, '')), '1');
	} 
}
    
function checkLocalStorageData() {
    if (typeof(Storage) !== 'undefined') {
        var localStorageData = localStorage.getItem((window.location.href).replace(/[^A-Za-z0-9]/g, ''));
        if (localStorageData==null || localStorageData.length==0  || $('.ratings').length == 0) {
            $( '#ratings-form' ).css('display', 'block');
        }
    } else {
        $( '#ratings-form' ).css('display', 'block');
    }
}

$( document ).ready(function() {
    
    $( '#ratings-form' ).submit(function( event ) {
       setLocalStorageData();
    });
    
    $( '.radio-inline' ).click(function( event ) {
        $( '#ratings-form-submit' ).attr('disabled', false);
        $( '#ratings-form' ).submit();
    });
    
    checkLocalStorageData();
    
});