CKEDITOR.plugins.add( 'imgUpload', {

	icons: 'imgUpload',

	init: function( editor ) {

		editor.addCommand( 'imgUpload', new CKEDITOR.dialogCommand( 'imgUpload' ) );

		editor.ui.addButton( 'imgUpload', {
			label: '插入图片',
			command: 'imgUpload',
			toolbar: 'insert'
		});
		
        editor.on('doubleclick', function( evt ){
            var element = evt.data.element; 
            if((element.is('img') &&　element.hasClass('insert-img'))){
                editor.getSelection().selectElement(element);
                evt.data.dialog = 'imgUpload';
            }
         });
        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'uploadGroup' );
            editor.addMenuItem( 'uploadItem', {
                label: '编辑上传图片',
                icon: this.path + 'icons/imgUpload.png',
                command: 'imgUpload',
                group: 'uploadGroup'
            });

            editor.contextMenu.addListener( function( element ) {
                if ( element.getAscendant( 'img', true ) ) {
                    if((element.is('img') &&　element.hasClass('insert-img'))){
                        return { uploadItem: CKEDITOR.TRISTATE_OFF };
                    }
                }
            });
        }

		CKEDITOR.dialog.add( 'imgUpload', this.path + 'dialogs/imgUpload.js' );
	}
});

